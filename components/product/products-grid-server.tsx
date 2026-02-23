import Link from 'next/link';
import { getProductsByCategories, getCategories, getCategorySfid } from 'lib/sfdc';
import { Category } from 'lib/sfdc/types';
import { ROOT_CATEGORY_ID } from 'lib/constants';
import { ProductsGridClient } from './products-grid-client';
import { PlpSortSelect } from 'components/plp-sort-select';
import { Suspense } from 'react';

interface ProductsGridServerProps {
  collection: string;
  isRoot: boolean;
  sortKey: string;
  reverse: boolean;
  searchTerm?: string;
  priceFilter?: string;
  filtersParam?: string;
}

/**
 * Parse ?f=SFID1:val1|SFID1:val2|SFID2:val3 into PRODUCTFILTERS array.
 */
function parseProductFilters(raw?: string): { sfid: string; specValues: { value: string }[] }[] {
  if (!raw) return [];
  const bySpec = new Map<string, Set<string>>();
  for (const token of raw.split('|')) {
    const idx = token.indexOf(':');
    if (idx === -1) continue;
    const sfid = token.slice(0, idx);
    const val = token.slice(idx + 1);
    if (!sfid || !val) continue;
    if (!bySpec.has(sfid)) bySpec.set(sfid, new Set());
    bySpec.get(sfid)!.add(val);
  }
  return Array.from(bySpec.entries()).map(([sfid, vals]) => ({
    sfid,
    specValues: Array.from(vals).map((v) => ({ value: v })),
  }));
}

export async function ProductsGridServer({ collection, isRoot, sortKey, reverse, searchTerm, priceFilter, filtersParam }: ProductsGridServerProps) {
  // When a search term is present, skip category resolution — FIND API uses SEARCHTERM instead.
  let categoriesToFetch: Category[];
  if (searchTerm?.trim()) {
    categoriesToFetch = [];
  } else if (isRoot) {
    categoriesToFetch = await getCategories(ROOT_CATEGORY_ID);
  } else {
    const sfid = await getCategorySfid(collection);
    categoriesToFetch = [{ categoryId: collection, sfid: sfid ?? collection, categoryName: '' }];
  }

  const productFilters = parseProductFilters(filtersParam);
  let products = await getProductsByCategories({ categories: categoriesToFetch, sortKey, reverse, searchTerm, productFilters });

  // Apply price range filter if set (format: "min-max", e.g. "10-25")
  if (priceFilter) {
    const [minStr, maxStr] = priceFilter.split('-');
    const min = Number(minStr);
    const max = Number(maxStr);
    if (!isNaN(min) && !isNaN(max)) {
      products = products.filter((p) => {
        const price = Number(p.priceRange.minVariantPrice.amount);
        return price >= min && price <= max;
      });
    }
  }

  return (
    <>
      {/* Sort / count bar */}
      <div className="flex items-center justify-between mb-6 bg-white border border-[#edecec] px-4 py-3">
        <p className="text-[13px] text-[#665c5c]">
          <span className="font-bold text-[#1b1818]">{products.length}</span>{' '}
          {products.length === 1 ? 'product' : 'products'}
        </p>
        <Suspense fallback={null}>
          <PlpSortSelect />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-[#edecec]">
          <img src="/images/Bond_DocumentTableSearchIcon.svg" alt="" className="h-16 w-16 opacity-20" />
          <p className="text-[#665c5c] text-[14px]">
            {searchTerm ? `No products found for "${searchTerm}".` : 'No products found in this category.'}
          </p>
          <Link
            href={`/search/${ROOT_CATEGORY_ID}`}
            className="text-[12px] font-bold text-[#00573f] underline hover:text-[#004530]"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <ProductsGridClient products={products} />
      )}
    </>
  );
}
