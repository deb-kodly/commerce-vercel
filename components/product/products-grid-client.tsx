'use client';

import { useState } from 'react';
import { PlpProductCard } from './plp-product-card';
import type { Product } from 'lib/sfdc/types';

const PAGE_SIZE = 12;

export function ProductsGridClient({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {visible.map((product, i) => (
          <PlpProductCard key={product.handle} product={product} priority={i < 6} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 mt-10 pb-6">
        <p className="text-[13px] text-[#665c5c]">
          Showing{' '}
          <span className="font-bold text-[#1b1818]">{visible.length}</span>
          {' '}of{' '}
          <span className="font-bold text-[#1b1818]">{products.length}</span>{' '}
          {products.length === 1 ? 'product' : 'products'}
        </p>

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, products.length))}
            className="px-8 py-2.5 border border-[#1b1818] text-[13px] font-bold text-[#1b1818] rounded-md hover:bg-[#1b1818] hover:text-white transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </>
  );
}
