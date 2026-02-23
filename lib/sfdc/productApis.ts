import { CCRZ_PRODUCT_API_URL } from 'lib/constants';
import { Product, Category, ProductFilter } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';

function extractImages(product: any): { url: string; altText: string; width: number; height: number }[] {
  const medias: any[] = product.EProductMediasS || product.EProductMedias || [];
  if (medias.length === 0) return [];
  return medias.map((m: any) => ({
    url: m.URI || '',
    altText: product.sfdcName || '',
    width: 0,
    height: 0,
  }));
}

/**
 * Extract price from either the `find` endpoint's productPricingData (keyed by sfid)
 * or the `fetch` endpoint's PriceResults (keyed by SKU).
 */
function extractPrice(
  pricingData: any,
  sfid: string,
  sku: string,
  source: 'find' | 'fetch'
): { amount: string; currencyCode: string } {
  if (source === 'find' && pricingData?.[sfid]) {
    const entry = pricingData[sfid];
    // CloudCraze FIND API nests price under productPrice.price
    const price =
      entry.productPrice?.price ??
      entry.unitPrice ??
      entry.listPrice ??
      0;
    const currencyCode =
      entry.productPrice?.currencyISOCode ||
      entry.productPrice?.currencyIsoCode ||
      entry.currencyISOCode ||
      entry.currencyIsoCode ||
      'GBP';
    return { amount: String(price), currencyCode };
  }
  if (source === 'fetch' && pricingData?.[sku]) {
    const entry = pricingData[sku].priceEntries?.[0];
    return {
      amount: String(entry?.price || '0'),
      currencyCode: entry?.currencyCode || 'GBP',
    };
  }
  return { amount: '0', currencyCode: 'GBP' };
}

function formatUnitWeight(
  rawWeight: number | string | null | undefined,
  unitOfMeasure?: string
): string | undefined {
  if (!rawWeight) return undefined;
  const num = Number(rawWeight);
  if (isNaN(num) || num === 0) return undefined;
  // If we have an explicit unit of measure from the API, use it directly
  if (unitOfMeasure) return `${num}${unitOfMeasure}`;
  // Otherwise derive unit from magnitude
  return num >= 1000 ? `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}kg` : `${num}g`;
}

function mapProduct(p: any, pricingData: any, priceSource: 'find' | 'fetch'): Product {
  const images = extractImages(p);
  const price = extractPrice(pricingData, p.sfid, p.SKU, priceSource);

  // Prefer alternateName (display override) over sfdcName
  const displayName = p.alternateName || p.sfdcName || '';

  // Base price (before discount) — from find endpoint's pricingData
  const basePriceNum = pricingData?.[p.sfid]?.priceBase ?? p.priceBase;
  const basePrice: Product['basePrice'] = basePriceNum != null && Number(basePriceNum) > 0
    ? { amount: String(basePriceNum), currencyCode: price.currencyCode }
    : undefined;

  return {
    id: p.sfid,
    handle: p.SKU || p.sfid,
    availableForSale: true,
    title: displayName,
    description: p.subtitle || p.shortDesc || p.longDesc || '',
    descriptionHtml: p.longDesc || p.shortDesc || '',
    price,
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: price,
    },
    featuredImage: images[0] || { url: '', altText: '', width: 0, height: 0 },
    images,
    seo: { title: displayName, description: p.subtitle || p.shortDesc || '' },
    tags: Array.isArray(p.tags) ? p.tags : [],
    updatedAt: '',
    // CloudCraze-specific
    subtitle: p.subtitle || undefined,
    alternateName: p.alternateName || undefined,
    brandColor: p.brandColor || undefined,
    ean: p.shopXTXTEAN13 || undefined,
    sku: p.SKU || undefined,
    unitsPerBox: p.shopXNUMUnitsPerBox ? Number(p.shopXNUMUnitsPerBox) : undefined,
    unitWeight: formatUnitWeight(
      p.productWeight ?? p.shopXLKPProduct2R?.NUMLWeight,
      p.unitOfMeasure || undefined
    ),
    isFrozen: p.isFrozen === true || p.isFrozen === 'true' || undefined,
    basePrice,
    promos: p.promos && typeof p.promos === 'object' ? p.promos : undefined,
    productType: p.productType || undefined,
  };
}

/**
 * Fetches products for the given categories from the CloudCraze API.
 *
 * Calls /ccproduct/v9/find with CATEGORYIDS (array of category sfids).
 * The caller is responsible for passing all relevant child category IDs
 * when browsing from a root/parent category.
 */
/**
 * Fetches available spec-based filters for a category or search term.
 * Calls /ccproduct/v9/findfilters and returns the prodFilters array.
 */
export async function getProductFilters({
  categories,
  searchTerm,
}: {
  categories: Category[];
  searchTerm?: string;
}): Promise<ProductFilter[]> {
  const isSearch = Boolean(searchTerm?.trim());
  const categoryIds = categories.map((c) => c.sfid || c.categoryId);

  if (!isSearch && categoryIds.length === 0) return [];

  try {
    const body: Record<string, unknown> = {};
    if (isSearch) {
      body.SEARCHTERM = searchTerm!.trim();
    } else {
      body.CATEGORYIDS = categoryIds;
    }

    const response = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/findfilters', HttpMethod.POST, body);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.prodFilters)) return [];

    return (data.prodFilters as any[]).map((f) => ({
      sfid: f.sfid ?? '',
      sfdcName: f.sfdcName ?? f.name ?? '',
      filterType: f.filterType,
      collapsed: f.collapsed,
      specValues: Array.isArray(f.specValues)
        ? f.specValues.map((v: any) => ({
            value: v.value ?? '',
            count: v.count,
            selected: v.selected,
            enabled: v.enabled,
          }))
        : [],
    }));
  } catch (error) {
    console.error('Error fetching product filters:', error);
    return [];
  }
}

export async function getProductsByCategories({
  categories,
  reverse: _reverse,
  sortKey: _sortKey,
  pageSize: _pageSize,
  searchTerm,
  productFilters,
}: {
  categories: Category[];
  reverse?: boolean;
  sortKey?: string;
  pageSize?: number;
  searchTerm?: string;
  productFilters?: { sfid: string; specValues: { value: string }[] }[];
}): Promise<Product[]> {
  const isSearch = Boolean(searchTerm?.trim());

  // Use sfid (Salesforce record Id) for the CC product API; fall back to categoryId
  const categoryIds = categories.map((c) => c.sfid || c.categoryId);

  if (!isSearch && categoryIds.length === 0) {
    return [];
  }

  try {
    // When a search term is present use SEARCHTERM in FIND; otherwise use CATEGORYIDS
    const body: Record<string, unknown> = { ISPRICED: true };
    if (isSearch) {
      body.SEARCHTERM = searchTerm!.trim();
    } else {
      body.CATEGORYIDS = categoryIds;
    }
    // Pass spec-based filters server-side if provided
    if (productFilters && productFilters.length > 0) {
      body.PRODUCTFILTERS = productFilters;
    }

    const response = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/find', HttpMethod.POST, body, undefined, 'ccrz__ProductList');
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.productList)) {
      return [];
    }

    if (data.productList.length > 0) {
      const fp = data.productList[0];
      console.log('[find debug] keys:', Object.keys(fp));
      console.log('[find debug] tags/characteristics:', fp.tags, fp.ECharacteristicsS, fp.characteristics, fp.EProductSpecificationsS);
    }

    return data.productList.map((p: any) => mapProduct(p, data.productPricingData, 'find'));
  } catch (error) {
    console.error('Error fetching products by categories:', error);
    return [];
  }
}

/**
 * Fetches a single product by its SKU handle from the CloudCraze API.
 */
export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    const response = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/fetch', HttpMethod.POST, {
      SKU: handle,
      ISPRICED: true,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.productList) || data.productList.length === 0) {
      return undefined;
    }

    return mapProduct(data.productList[0], data.PriceResults, 'fetch');
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
    return undefined;
  }
}

/**
 * Searches products by query string. Returns an empty array when no query is provided.
 */
export async function getProducts({
  query,
  reverse: _reverse,
  sortKey: _sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  if (!query) return [];

  try {
    // Step 1: search for matching product SFIDs
    const searchResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/search', HttpMethod.POST, { SEARCHTERM: query });
    const searchText = await searchResponse.text();
    const searchData = searchText ? JSON.parse(searchText) : null;

    const sfids: string[] = Array.isArray(searchData?.searchResults)
      ? searchData.searchResults
      : Array.isArray(searchData?.productList)
      ? searchData.productList
      : [];

    if (!searchData?.success || sfids.length === 0) return [];

    // Step 2: fetch full product details and pricing — cap at 10 for performance
    const fetchResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/fetch', HttpMethod.POST, {
      PRODUCTLIST: sfids.slice(0, 10),
      ISPRICED: true,
    });
    const fetchText = await fetchResponse.text();
    const fetchData = fetchText ? JSON.parse(fetchText) : null;

    if (!fetchData?.success || !Array.isArray(fetchData.productList)) return [];

    return fetchData.productList.map((p: any) => mapProduct(p, fetchData.PriceResults, 'fetch'));
  } catch (error) {
    console.error(`Error searching products for "${query}":`, error);
    return [];
  }
}
