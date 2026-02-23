import { CCRZ_CATEGORY_API_URL } from 'lib/constants';
import { Category, Collection } from './types';
import { makeSfdcApiCall, HttpMethod } from './sfdcApiUtil';
import { cache } from 'react';

// In-memory cache with TTL for getCategories
let categoriesCache: { data: Category[] | null; generatedAt: number } = { data: null, generatedAt: 0 };
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

function flattenCategories(categoryList: any[]): Category[] {
  const result: Category[] = [];
  for (const cat of categoryList) {
    if (cat.sfid && cat.sfdcName) {
      result.push({
        categoryId: cat.sfid,
        categoryName: cat.sfdcName,
        parentCategoryId: cat.parentCategory || undefined,
        numberOfProducts: cat.productCount ?? 0,
        path: `search/${cat.sfid}`,
      });
    }
    if (Array.isArray(cat.productCategories) && cat.productCategories.length > 0) {
      result.push(...flattenCategories(cat.productCategories));
    }
  }
  return result;
}

/**
 * Returns a cached, sorted list of categories with products.
 * @returns {Promise<Category[]>} Sorted categories with products.
 */
export const getCategories = cache(async function getCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache.data && now - categoriesCache.generatedAt < CATEGORIES_CACHE_TTL) {
    return categoriesCache.data;
  }

  try {
    const response = await makeSfdcApiCall(CCRZ_CATEGORY_API_URL + '/fetch?ccLog=shopxLog', HttpMethod.POST, { ROOTCATEGORY: 'a3J2p0000035jt3EAA' });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (data?.ccLog) {
      console.log('[getCategories] ccLog:', JSON.stringify(data.ccLog, null, 2));
    }

    if (!data?.success || !Array.isArray(data.categoryList)) {
      return [];
    }

    const categories = flattenCategories(data.categoryList);
    const sorted = categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    categoriesCache = { data: sorted, generatedAt: now };
    return sorted;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});

/**
 * Returns a limited set of categories such that the total number of products does not exceed maxProducts.
 * This is used to limit the number of products displayed on the home page to increase the performance.
 * @param {Category[]} categories - The list of categories to filter.
 * @param {number} [maxProducts=3] - The maximum number of products to include.
 * @returns {Category[]} The limited set of categories.
 */
export function getLimitedCategories(categories: Category[], maxProducts = 3): Category[] {
  const selectedCategories: Category[] = [];
  let totalProducts = 0;

  for (const category of categories) {
    const productsCount = Number(category.numberOfProducts);

    // Always include at least one category
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
 * @param {string} handle - The category handle or ID.
 * @returns {Promise<Collection | undefined>} The collection object, or undefined if not found.
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
