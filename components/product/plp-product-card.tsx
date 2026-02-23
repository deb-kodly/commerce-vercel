'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addItem } from 'components/cart/actions';
import { useCart } from 'components/cart/cart-context';
import { Product } from 'lib/sfdc';

export function PlpProductCard({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultVariant = product.variants?.[0];
  const price = product.priceRange?.minVariantPrice;
  const isAvailable = product.availableForSale && !!defaultVariant;

  const currencySymbol = price?.currencyCode === 'GBP' ? '£' : (price?.currencyCode === 'USD' ? '$' : '€');
  const priceAmount = price ? Number(price.amount).toFixed(2) : null;

  const tags = product.tags?.slice(0, 3) ?? [];
  const variantTitle = defaultVariant?.title && defaultVariant.title !== 'Default Title' ? defaultVariant.title : null;

  const handleAdd = () => {
    if (!defaultVariant || !isAvailable) return;
    setError(null);
    startTransition(async () => {
      addCartItem(defaultVariant, product);
      const result = await addItem(null, defaultVariant.id);
      if (result) setError(result);
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col gap-3 h-full">

      {/* ── Image area ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 items-center w-full">

        {/* Bookmark / save icon (top right) */}
        <div className="flex justify-end w-full">
          <button
            type="button"
            className="opacity-30 hover:opacity-60 transition-opacity"
            aria-label="Save for later"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1b1818" strokeWidth="1.5">
              <path d="M5 4h14v17l-7-4-7 4V4z" />
            </svg>
          </button>
        </div>

        {/* Product image: 156×156 px, object-contain */}
        <Link
          href={`/product/${product.handle}`}
          className="block relative rounded-md overflow-hidden shrink-0"
          style={{ width: 156, height: 156 }}
        >
          {product.featuredImage?.url ? (
            <Image
              src={product.featuredImage.url}
              alt={product.title}
              fill
              className="object-contain"
              sizes="156px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f8f7f7]">
              <img src="/images/Bond_DocumentTableSearchIcon.svg" alt="" className="h-12 w-12 opacity-20" />
            </div>
          )}
        </Link>

        {/* Category tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center w-full">
            {/* Brand indicator dot (dark green) */}
            <div className="bg-[#00573f] rounded-sm shrink-0" style={{ width: 20, height: 20 }} />
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#f8f7f7] text-[#665c5c] text-[10px] font-bold uppercase px-1 rounded-sm leading-[14px] flex items-center"
                style={{ height: 20 }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full flex-1">

        {/* Product name */}
        <div className="flex flex-col gap-0.5">
          <Link href={`/product/${product.handle}`} className="group">
            <p className="text-[18px] font-bold leading-[24px] text-[#1b1818] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-[#00573f] transition-colors">
              {product.title}
            </p>
          </Link>
          {product.description && (
            <p className="text-[12px] leading-[18px] text-[#665c5c] overflow-hidden text-ellipsis whitespace-nowrap">
              {product.description}
            </p>
          )}
        </div>

        {/* Format chip (variant title) */}
        {variantTitle && (
          <div className="flex gap-1 flex-wrap">
            <span
              className="border border-[#1b1818] text-[12px] font-bold text-[#1b1818] flex items-center px-3 rounded-full whitespace-nowrap"
              style={{ height: 28 }}
            >
              {variantTitle}
            </span>
          </div>
        )}

        {/* Price */}
        {priceAmount && (
          <div className="flex items-baseline gap-0.5">
            <span className="text-[14px] font-bold leading-[19px] text-[#1b1818]">{currencySymbol}</span>
            <span className="text-[18px] font-bold leading-[24px] text-[#1b1818]">{priceAmount}</span>
          </div>
        )}
      </div>

      {/* ── Actions: quantity + Add button ──────────────────── */}
      <div className="flex gap-2 w-full" style={{ height: 40 }}>

        {/* Quantity selector */}
        <div
          className="flex flex-1 items-center justify-between border border-[#1b1818] rounded-md px-4 gap-2"
          style={{ opacity: isAvailable ? 1 : 0.3 }}
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!isAvailable || quantity <= 1}
            className="text-[#1b1818] text-[18px] leading-none hover:opacity-60 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-[18px] font-bold text-[#1b1818] text-center min-w-[20px]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={!isAvailable}
            className="text-[#1b1818] text-[18px] leading-none hover:opacity-60 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!isAvailable || isPending}
          className="flex-1 bg-[#1b1818] text-white text-[16px] font-bold uppercase tracking-[0.16px] rounded-md hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPending ? '...' : isAvailable ? 'Add' : 'N/A'}
        </button>
      </div>

      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  );
}
