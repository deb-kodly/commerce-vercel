import Link from 'next/link';
import { Suspense } from 'react';
import { getCategories, getProductFilters, getCategorySfid } from 'lib/sfdc';
import { ROOT_CATEGORY_ID } from 'lib/constants';
import { PlpFilters } from './plp-filters';

interface PlpSidebarProps {
  collection: string;
  isRoot: boolean;
  searchTerm?: string;
}

const HIDDEN_FILTER_NAMES = new Set(['Promotions', 'Group']);

/** Skeleton shown while filters are streaming in */
function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[100, 80, 90].map((w, i) => (
        <div key={i} className="bg-white border border-[#edecec]">
          <div className="px-4 py-3 border-b border-[#edecec]">
            <div className="bg-[#edecec] rounded animate-pulse h-3" style={{ width: `${w}%` }} />
          </div>
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3 px-4 py-2 border-t border-[#f3f1f1]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#edecec] animate-pulse shrink-0" />
              <div className="bg-[#edecec] rounded animate-pulse h-4 flex-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Async server component — fetches filters independently so categories render first */
async function PlpFiltersServer({
  collection,
  isRoot,
  searchTerm,
}: PlpSidebarProps) {
  let rawFilters;
  if (searchTerm?.trim()) {
    rawFilters = await getProductFilters({ categories: [], searchTerm });
  } else {
    const sfid = isRoot ? undefined : await getCategorySfid(collection);
    const cat = isRoot
      ? await getCategories(ROOT_CATEGORY_ID)
      : [{ categoryId: collection, sfid: sfid ?? collection, categoryName: '' }];
    rawFilters = await getProductFilters({ categories: cat });
  }

  const specFilters = rawFilters.filter((f) => !HIDDEN_FILTER_NAMES.has(f.sfdcName));
  if (specFilters.length === 0) return null;

  return (
    <Suspense fallback={null}>
      <PlpFilters availableFilters={specFilters} />
    </Suspense>
  );
}

export async function PlpSidebar({ collection, isRoot, searchTerm }: PlpSidebarProps) {
  // Only fetch categories here — fast, unblocks sidebar render immediately.
  // Filters are fetched in PlpFiltersServer below and stream in separately.
  const categories = await getCategories(ROOT_CATEGORY_ID);

  return (
    <aside
      className="hidden lg:flex lg:flex-col shrink-0 gap-4 sticky top-8 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d4cfcf] hover:[&::-webkit-scrollbar-thumb]:bg-[#a59c9c]"
      style={{ width: 233, maxHeight: 'calc(100vh - 4rem)', scrollbarWidth: 'thin', scrollbarColor: '#d4cfcf transparent' }}
    >
      {/* Categories — renders as soon as getCategories resolves */}
      <div className="bg-white border border-[#edecec]">
        <div className="px-4 py-3 border-b border-[#edecec]">
          <p className="text-[12px] font-bold text-[#1b1818] uppercase tracking-[0.5px]">
            Categories
          </p>
        </div>

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

        {categories.map((cat) => (
          <Link
            key={cat.categoryId}
            href={`/search/${cat.categoryId}`}
            className={`flex items-center justify-between px-4 py-2 text-[13px] leading-[20px] border-t border-[#f3f1f1] transition-colors ${
              collection === cat.categoryId
                ? 'bg-[#00573f] text-white font-bold'
                : 'text-[#665c5c] hover:bg-[#f8f7f7] hover:text-[#1b1818]'
            }`}
          >
            <span>{cat.categoryName}</span>
          </Link>
        ))}
      </div>

      {/* Filters — stream in independently; skeleton shown while /findfilters resolves */}
      <Suspense fallback={<FiltersSkeleton />}>
        <PlpFiltersServer collection={collection} isRoot={isRoot} searchTerm={searchTerm} />
      </Suspense>
    </aside>
  );
}
