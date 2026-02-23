import { CCRZ_CATEGORY_API_URL, SFDC_OAUTH_BASE_URL, SFDC_COMMERCE_API_VERSION, ROOT_CATEGORY_ID } from 'lib/constants';
import { Category, Collection } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';
import { getServiceUserToken } from 'app/api/auth/authUtil';
import { cache } from 'react';

// In-memory cache keyed by parentCategoryId
let categoriesCacheMap = new Map<string, { data: Category[]; generatedAt: number }>();
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

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
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`SOQL failed (${response.status}): ${text}`);
  return data;
}

/**
 * Returns direct child categories of the given parent category ID.
 * The parentCategoryId is matched against ccrz__CategoryID__c (the custom ID field,
 * e.g. '999999' for root).
 *
 * Results are cached in-memory per parentCategoryId with a 5-minute TTL.
 */
export const getCategories = cache(async function getCategories(parentCategoryId: string = ROOT_CATEGORY_ID): Promise<Category[]> {
  const now = Date.now();
  const cached = categoriesCacheMap.get(parentCategoryId);
  if (cached && cached.data.length > 0 && now - cached.generatedAt < CATEGORIES_CACHE_TTL) {
    return cached.data;
  }

  try {
    const soql = `SELECT Id, Name, ccrz__CategoryID__c, ccrz__ParentCategory__c FROM ccrz__E_Category__c WHERE ccrz__ParentCategory__r.ccrz__CategoryID__c = '${parentCategoryId}' ORDER BY Name LIMIT 500`;

    console.log('\n=== [getCategories] SOQL REQUEST ===');
    console.log('parentCategoryId:', parentCategoryId);
    console.log('SOQL:', soql);

    const data = await soqlFetch(soql);

    console.log('\n=== [getCategories] SOQL RESPONSE ===');
    console.log('Records returned:', data?.records?.length ?? 0);
    console.log('First record:', JSON.stringify(data?.records?.[0] ?? null));

    if (!Array.isArray(data?.records)) {
      console.log('No records array in response:', data);
      return [];
    }

    const categories: Category[] = data.records.map((r: any) => ({
      categoryId: r.ccrz__CategoryID__c || r.Id, // URL-safe custom ID
      sfid: r.Id,                                 // Salesforce record Id for product API
      categoryName: r.Name,
      parentCategoryId: r.ccrz__ParentCategory__c || undefined,
      numberOfProducts: 0,
      path: `search/${r.ccrz__CategoryID__c || r.Id}`,
    }));

    const sorted = categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    categoriesCacheMap.set(parentCategoryId, { data: sorted, generatedAt: now });
    return sorted;
  } catch (error) {
    console.error('Error fetching categories via SOQL:', error);
    return [];
  }
});

/**
 * Returns the display name of a category by its ccrz__CategoryID__c custom ID.
 * Used by CategoryLabelServer for breadcrumb/hero label.
 */
export const getCategoryById = cache(async function getCategoryById(id: string): Promise<string | null> {
  try {
    const soql = `SELECT Name FROM ccrz__E_Category__c WHERE ccrz__CategoryID__c = '${id}' LIMIT 1`;
    const data = await soqlFetch(soql);
    return data?.records?.[0]?.Name ?? null;
  } catch (error) {
    console.error('Error fetching category by id:', error);
    return null;
  }
});

/**
 * Returns the Salesforce record Id for a category given its ccrz__CategoryID__c custom ID.
 * The CloudCraze product API (/ccproduct/v9/find CATEGORYIDS) requires Salesforce record Ids.
 */
export const getCategorySfid = cache(async function getCategorySfid(customId: string): Promise<string | null> {
  try {
    const soql = `SELECT Id FROM ccrz__E_Category__c WHERE ccrz__CategoryID__c = '${customId}' LIMIT 1`;
    const data = await soqlFetch(soql);
    return data?.records?.[0]?.Id ?? null;
  } catch (error) {
    console.error('Error fetching category sfid:', error);
    return null;
  }
});

/**
 * Returns a limited set of categories such that the total number of products does not exceed maxProducts.
 */
export function getLimitedCategories(categories: Category[], maxProducts = 3): Category[] {
  const selectedCategories: Category[] = [];
  let totalProducts = 0;

  for (const category of categories) {
    const productsCount = Number(category.numberOfProducts);
    if (selectedCategories.length === 0 || totalProducts + productsCount <= maxProducts) {
      selectedCategories.push(category);
      totalProducts += productsCount;
    } else {
      break;
    }
  }
  return selectedCategories;
}

/**
 * Fetches a single collection (category) by its handle or ID.
 */
export async function getCollection(handle: string): Promise<Collection | undefined> {
  try {
    const response = await makeSfdcApiCall(CCRZ_CATEGORY_API_URL + '/fetch', HttpMethod.POST, {
      ID: handle,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.categoryList) || data.categoryList.length === 0) {
      return undefined;
    }

    const cat = data.categoryList[0];
    return {
      handle: cat.sfid,
      title: cat.sfdcName,
      description: cat.shortDesc || cat.longDesc || '',
      seo: { title: cat.sfdcName, description: cat.shortDesc || '' },
      updatedAt: '',
      path: `search/${cat.sfid}`,
    };
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return undefined;
  }
}
