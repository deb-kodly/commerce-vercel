import { NextRequest, NextResponse } from 'next/server';
import { getServiceUserToken } from 'app/api/auth/authUtil';
import { makeSfdcApiCall, HttpMethod } from 'lib/sfdc/sfdcApiUtil';
import { SFDC_OAUTH_BASE_URL, SFDC_COMMERCE_API_VERSION, CCRZ_PRODUCT_API_URL } from 'lib/constants';

async function soqlFetch(soql: string): Promise<any> {
  const serviceToken = await getServiceUserToken();
  const url = `${SFDC_OAUTH_BASE_URL}/services/data/${SFDC_COMMERCE_API_VERSION}/query?q=${encodeURIComponent(soql)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${serviceToken}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  try {
    // Step 1: CloudCraze search — returns relevance-ranked product SFIDs
    const searchResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/search', HttpMethod.POST, {
      SEARCHTERM: q,
    }, req);
    const searchText = await searchResponse.text();
    const searchData = searchText ? JSON.parse(searchText) : null;

    const sfids: string[] = Array.isArray(searchData?.searchResults)
      ? searchData.searchResults.slice(0, 6)
      : [];

    if (sfids.length === 0) return NextResponse.json([]);

    // Step 2: SOQL — fast lookup of product details by SFID
    const idList = sfids.map((id) => `'${id}'`).join(',');
    const soql = `SELECT Id, Name, ccrz__SKU__c, ccrz__ShortDesc__c FROM ccrz__E_Product__c WHERE Id IN (${idList})`;
    const soqlData = await soqlFetch(soql);

    if (!Array.isArray(soqlData?.records)) return NextResponse.json([]);

    // Preserve the search-relevance order from CloudCraze
    const recordMap = new Map(soqlData.records.map((r: any) => [r.Id, r]));
    const suggestions = sfids
      .map((id) => recordMap.get(id))
      .filter(Boolean)
      .map((r: any) => ({
        id: r.Id,
        title: r.Name,
        handle: r.ccrz__SKU__c ?? r.Id,
        sku: r.ccrz__SKU__c ?? '',
        description: r.ccrz__ShortDesc__c ?? '',
      }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('[/api/search]', error);
    return NextResponse.json([]);
  }
}
