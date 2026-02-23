import { getProductsByCategories, getCategories } from 'lib/sfdc';
import { defaultSort, sorting } from 'lib/constants';
import { Suspense } from 'react';
import Link from 'next/link';
import { PlpProductCard } from 'components/product/plp-product-card';
import { PlpSortSelect } from 'components/plp-sort-select';

const ROOT_CATEGORY_ID = 'a3J2p0000035jt3EAA';

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  const [products, categories] = await Promise.all([
    getProductsByCategories({
      categories: [{ categoryId: params.collection, categoryName: '' }],
      sortKey,
      reverse,
      pageSize: 50,
    }),
    getCategories(),
  ]);

  const isRoot = params.collection === ROOT_CATEGORY_ID;
  const currentCategory = categories.find((c) => c.categoryId === params.collection);
  const categoryLabel = isRoot ? 'Browse All' : (currentCategory?.categoryName ?? 'Products');

  return (
    <div className="bg-[#f8f7f7] min-h-screen">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#edecec]">
        <div className="px-12 py-3">
          <nav className="flex items-center gap-2 text-[12px] text-[#665c5c]">
            <Link href="/" className="hover:text-[#00573f] transition-colors">
              Home
            </Link>
            <span className="text-[#a59c9c]">/</span>
            {!isRoot && (
              <>
                <Link href={`/search/${ROOT_CATEGORY_ID}`} className="hover:text-[#00573f] transition-colors">
                  Browse shop
                </Link>
                <span className="text-[#a59c9c]">/</span>
              </>
            )}
            <span className="text-[#1b1818] font-bold">{categoryLabel}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#edecec]">
        <div className="px-12 py-6">
          <div
            className="w-full bg-gradient-to-r from-[#00573f] to-[#007a59] rounded-lg flex items-center px-8"
            style={{ height: 136 }}
          >
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-[1px] opacity-70">
                {isRoot ? 'All Products' : 'Category'}
              </p>
              <h1 className="text-white text-[28px] font-bold leading-[36px] mt-1">
                {categoryLabel}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main: sidebar + results ─────────────────────────────── */}
      <div className="flex px-12 py-8 gap-6 items-start">

        {/* Left sidebar – 233 px (matching Figma) */}
        <aside className="hidden lg:block shrink-0" style={{ width: 233 }}>
          <div className="bg-white border border-[#edecec]">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-[#edecec]">
              <p className="text-[12px] font-bold text-[#1b1818] uppercase tracking-[0.5px]">
                Categories
              </p>
            </div>

            {/* All products link */}
            <Link
              href={`/search/${ROOT_CATEGORY_ID}`}
              className={`flex items-center justify-between px-4 py-2 text-[13px] leading-[20px] transition-colors ${
                isRoot
                  ? 'bg-[#00573f] text-white font-bold'
                  : 'text-[#665c5c] hover:bg-[#f8f7f7] hover:text-[#1b1818]'
              }`}
            >
              <span>All Products</span>
            </Link>

            {/* Category links */}
            {categories.map((cat) => (
              <Link
                key={cat.categoryId}
                href={`/search/${cat.categoryId}`}
                className={`flex items-center justify-between px-4 py-2 text-[13px] leading-[20px] border-t border-[#f3f1f1] transition-colors ${
                  params.collection === cat.categoryId
                    ? 'bg-[#00573f] text-white font-bold'
                    : 'text-[#665c5c] hover:bg-[#f8f7f7] hover:text-[#1b1818]'
                }`}
              >
                <span>{cat.categoryName}</span>
                {cat.numberOfProducts != null && cat.numberOfProducts > 0 && (
                  <span
                    className={`text-[11px] ${params.collection === cat.categoryId ? 'opacity-70' : 'opacity-50'}`}
                  >
                    {cat.numberOfProducts}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </aside>

        {/* Results area */}
        <div className="flex-1 min-w-0">

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

          {/* Empty state */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-[#edecec]">
              <img src="/images/Bond_DocumentTableSearchIcon.svg" alt="" className="h-16 w-16 opacity-20" />
              <p className="text-[#665c5c] text-[14px]">No products found in this category.</p>
              <Link
                href={`/search/${ROOT_CATEGORY_ID}`}
                className="text-[12px] font-bold text-[#00573f] underline hover:text-[#004530]"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              {/* Product grid – 3 columns, 24 px gap (matches Figma: 289×458 cards, 3 per row) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <PlpProductCard key={product.handle} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center gap-4 mt-10 pb-6">
                <p className="text-[13px] text-[#665c5c]">
                  Showing{' '}
                  <span className="font-bold text-[#1b1818]">{products.length}</span>{' '}
                  products
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
