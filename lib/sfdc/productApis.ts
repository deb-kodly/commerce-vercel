import { CCRZ_PRODUCT_API_URL } from 'lib/constants';
import { Product, Category, ProductOption, ProductVariant } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';

function extractImages(product: any): { url: string; altText: string; width: number; height: number }[] {
  const medias: any[] = product.EProductMedias || [];
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
    return {
      amount: String(pricingData[sfid].unitPrice || pricingData[sfid].listPrice || '0'),
      currencyCode: pricingData[sfid].currencyISOCode || 'USD',
    };
  }
  if (source === 'fetch' && pricingData?.[sku]) {
    const entry = pricingData[sku].priceEntries?.[0];
    return {
      amount: String(entry?.price || '0'),
      currencyCode: entry?.currencyCode || 'USD',
    };
  }
  return { amount: '0', currencyCode: 'USD' };
}

function mapProduct(p: any, pricingData: any, priceSource: 'find' | 'fetch'): Product {
  const images = extractImages(p);
  const price = extractPrice(pricingData, p.sfid, p.SKU, priceSource);
  const options: ProductOption[] = [];
  const variants: ProductVariant[] = [
    {
      id: p.sfid,
      title: p.sfdcName || p.SKU,
      availableForSale: true,
      selectedOptions: [],
      price,
    },
  ];

  return {
    id: p.sfid,
    handle: p.SKU || p.sfid,
    availableForSale: true,
    title: p.sfdcName || '',
    description: p.shortDesc || p.longDesc || '',
    descriptionHtml: p.longDesc || p.shortDesc || '',
    options,
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: price,
    },
    variants,
    featuredImage: images[0] || { url: '', altText: '', width: 0, height: 0 },
    images,
    seo: { title: p.sfdcName || '', description: p.shortDesc || '' },
    tags: [],
    updatedAt: '',
  };
}

/**
 * Fetches products for the given categories from the CloudCraze API.
 */
export async function getProductsByCategories({
  categories,
  reverse,
  sortKey,
  pageSize,
}: {
  categories: Category[];
  reverse?: boolean;
  sortKey?: string;
  pageSize?: number;
}): Promise<Product[]> {
  const categoryIds = categories.map((c) => c.categoryId);
  if (categoryIds.length === 0) return [];

  try {
    const response = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/find', HttpMethod.POST, {
      CATEGORYIDS: categoryIds,
      ISPRICED: true,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!data?.success || !Array.isArray(data.productList)) return [];

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
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  if (!query) return [];

  try {
    // Step 1: search for matching product SFIDs
    const searchResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/search', HttpMethod.POST, {
      SEARCHTERM: query,
    });
    const searchText = await searchResponse.text();
    const searchData = searchText ? JSON.parse(searchText) : null;

    if (
      !searchData?.success ||
      !Array.isArray(searchData.productList) ||
      searchData.productList.length === 0
    ) {
      return [];
    }

    // Step 2: fetch full product details and pricing for those SFIDs
    const fetchResponse = await makeSfdcApiCall(CCRZ_PRODUCT_API_URL + '/fetch', HttpMethod.POST, {
      PRODUCTLIST: searchData.productList,
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
