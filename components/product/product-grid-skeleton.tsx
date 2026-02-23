export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-4 flex flex-col gap-3"
          style={{ height: 458 }}
        >
          {/* Bookmark */}
          <div className="flex justify-end">
            <div className="w-6 h-6 bg-[#edecec] rounded animate-pulse" />
          </div>

          {/* Image */}
          <div
            className="mx-auto bg-[#edecec] rounded-md animate-pulse"
            style={{ width: 156, height: 156 }}
          />

          {/* Tags */}
          <div className="flex gap-1 items-center">
            <div className="bg-[#edecec] rounded-sm animate-pulse" style={{ width: 20, height: 20 }} />
            <div className="bg-[#edecec] rounded-sm animate-pulse h-5 w-14" />
            <div className="bg-[#edecec] rounded-sm animate-pulse h-5 w-10" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="bg-[#edecec] rounded animate-pulse h-5 w-3/4" />
            <div className="bg-[#edecec] rounded animate-pulse h-4 w-1/2" />
          </div>

          {/* Price */}
          <div className="bg-[#edecec] rounded animate-pulse h-6 w-16 mt-auto" />

          {/* Actions */}
          <div className="flex gap-2" style={{ height: 40 }}>
            <div className="flex-1 bg-[#edecec] rounded-md animate-pulse" />
            <div className="flex-1 bg-[#edecec] rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="hidden lg:block shrink-0 bg-white border border-[#edecec]" style={{ width: 233 }}>
      <div className="px-4 py-3 border-b border-[#edecec]">
        <div className="bg-[#edecec] rounded animate-pulse h-3 w-20" />
      </div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2 border-t border-[#f3f1f1]">
          <div className="bg-[#edecec] rounded animate-pulse h-4" style={{ width: `${55 + (i * 17) % 40}%` }} />
          <div className="bg-[#edecec] rounded animate-pulse h-3 w-4" />
        </div>
      ))}
    </div>
  );
}

export function ResultsAreaSkeleton() {
  return (
    <>
      {/* Sort / count bar skeleton */}
      <div className="flex items-center justify-between mb-6 bg-white border border-[#edecec] px-4 py-3">
        <div className="bg-[#edecec] rounded animate-pulse h-4 w-24" />
        <div className="bg-[#edecec] rounded animate-pulse h-8 w-36" />
      </div>

      <ProductGridSkeleton count={12} />
    </>
  );
}
