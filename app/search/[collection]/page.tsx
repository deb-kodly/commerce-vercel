import { defaultSort, sorting, ROOT_CATEGORY_ID } from 'lib/constants';
import { Suspense } from 'react';
import Link from 'next/link';
import { ProductsGridServer } from 'components/product/products-grid-server';
import { ResultsAreaSkeleton, SidebarSkeleton } from 'components/product/product-grid-skeleton';
import { CategoryLabelServer } from 'components/product/category-label-server';
import { PlpSidebar } from 'components/layout/plp-sidebar';

/**
 * PLP page — no data fetching here.
 *
 * The page shell (breadcrumb structure, hero shell, layout) renders and streams
 * immediately. Each async section (category name, sidebar, product grid) is wrapped
 * in its own Suspense boundary so they populate independently as they resolve.
 *
 * React's cache() on getCategories() ensures the single API call is shared across
 * CategoryLabelServer, PlpSidebar, and ProductsGridServer within one render.
 */
export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ]);

  const { sort, q: searchTerm, price: priceFilter, f: filtersParam } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const isRoot = params.collection === ROOT_CATEGORY_ID;

  return (
    <div className="bg-[#f8f7f7] min-h-screen">

      {/* ── Breadcrumb — static structure renders instantly ───────── */}
      <div className="bg-white border-b border-[#edecec]">
        <div className="px-12 py-3">
          <nav className="flex items-center gap-2 text-[12px] text-[#665c5c]">
            <Link href="/" className="hover:text-[#00573f] transition-colors">
              Home
            </Link>
            <span className="text-[#a59c9c]">/</span>
            {isRoot ? (
              <span className="text-[#1b1818] font-bold">Browse All</span>
            ) : (
              <>
                <Link href={`/search/${ROOT_CATEGORY_ID}`} className="hover:text-[#00573f] transition-colors">
                  Browse shop
                </Link>
                <span className="text-[#a59c9c]">/</span>
                <Suspense fallback={<span className="inline-block h-4 w-20 rounded bg-[#edecec] animate-pulse" />}>
                  <span className="text-[#1b1818] font-bold">
                    <CategoryLabelServer collection={params.collection} />
                  </span>
                </Suspense>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* ── Hero banner — green shell renders instantly, label streams ── */}
      <div className="bg-white border-b border-[#edecec]">
        <div className="px-12 py-6">
          <div
            className="w-full bg-gradient-to-r from-[#00573f] to-[#007a59] rounded-lg flex items-center px-8"
            style={{ height: 136 }}
          >
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-[1px] opacity-70">
                {searchTerm ? 'Search Results' : isRoot ? 'All Products' : 'Category'}
              </p>
              {searchTerm ? (
                <h1 className="text-white text-[28px] font-bold leading-[36px] mt-1">&quot;{searchTerm}&quot;</h1>
              ) : isRoot ? (
                <h1 className="text-white text-[28px] font-bold leading-[36px] mt-1">Browse All</h1>
              ) : (
                <Suspense
                  fallback={<div className="mt-1 h-9 w-48 rounded bg-white/20 animate-pulse" />}
                >
                  <h1 className="text-white text-[28px] font-bold leading-[36px] mt-1">
                    <CategoryLabelServer collection={params.collection} />
                  </h1>
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main: sidebar + results ───────────────────────────────────── */}
      <div className="flex px-12 py-8 gap-6 items-start">
        <Suspense fallback={<SidebarSkeleton />}>
          <PlpSidebar collection={params.collection} isRoot={isRoot} searchTerm={searchTerm} />
        </Suspense>
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ResultsAreaSkeleton />}>
            <ProductsGridServer
              collection={params.collection}
              isRoot={isRoot}
              sortKey={sortKey}
              reverse={reverse}
              searchTerm={searchTerm}
              priceFilter={priceFilter}
              filtersParam={filtersParam}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
