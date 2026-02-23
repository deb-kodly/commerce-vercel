'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addItem } from 'components/cart/actions';
import { useCart } from 'components/cart/cart-context';
import type { Product } from 'lib/sfdc/types';

export function PlpProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addCartItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const price = product.priceRange?.minVariantPrice;
  const isAvailable = product.availableForSale;

  const currencySymbol = price?.currencyCode === 'GBP' ? '£' : price?.currencyCode === 'USD' ? '$' : '€';
  const priceNumeric = price ? Number(price.amount) : 0;
  const priceAmount = priceNumeric > 0 ? priceNumeric.toFixed(2) : null;

  const basePriceNumeric = product.basePrice ? Number(product.basePrice.amount) : 0;
  const basePriceAmount = basePriceNumeric > priceNumeric ? basePriceNumeric.toFixed(2) : null;

  const tags = product.tags?.slice(0, 4) ?? [];

  // Format option label: "Pack: 12 x 85g" (only shown when pack data is available)
  const formatLabel = product.unitsPerBox && product.unitWeight
    ? `Pack: ${product.unitsPerBox} x ${product.unitWeight}`
    : product.unitsPerBox
    ? `Pack: ${product.unitsPerBox}`
    : null;

  // First promo name (if any)
  const firstPromo = product.promos ? Object.values(product.promos)[0] : null;

  const handleAdd = () => {
    if (!isAvailable) return;
    setError(null);
    startTransition(async () => {
      addCartItem(product, quantity);
      const result = await addItem(null, product.id, quantity);
      if (result) setError(result);
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col gap-3 h-full" style={{ border: '1px solid #f0eeee' }}>

      {/* ── Upper: bookmark row + image + tags ─────────────────── */}
      <div className="flex flex-col items-center w-full gap-3">

        {/* Promo badge (left) + Bookmark (right) */}
        <div className="flex justify-between items-center w-full">
          {firstPromo ? (
            <div
              className="flex items-center gap-1 rounded px-1"
              style={{ backgroundColor: '#FFEB84', height: 20 }}
            >
              <img src="/images/Bond_PromoIcon.svg" alt="" style={{ width: 12, height: 12 }} />
              <p className="text-[10px] font-bold text-[#1b1818] leading-none m-0 tracking-[0.2px]">
                {firstPromo}
              </p>
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="opacity-30 hover:opacity-60 transition-opacity"
            aria-label="Save for later"
          >
            <img src="/images/Bond_Bookmark.svg" alt="" style={{ width: 24, height: 24 }} />
          </button>
        </div>

        {/* Product image: 156×156 */}
        <Link
          href={`/product/${product.handle}`}
          className="block relative shrink-0"
          style={{ width: 156, height: 156 }}
        >
          {product.featuredImage?.url && !imgError ? (
            <Image
              src={product.featuredImage.url}
              alt={product.title}
              fill
              priority={priority}
              className="object-contain"
              sizes="156px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f8f7f7] rounded-md">
              <img
                src="/logo-affinity.png"
                alt=""
                style={{ width: 80, height: 'auto', objectFit: 'contain', opacity: 0.2 }}
              />
            </div>
          )}
        </Link>

        {/* Tags: brand colour dot + category tags — hidden until tags are available from API */}
        {(product.brandColor || tags.length > 0) && (
          <div className="flex gap-1 items-center w-full flex-wrap" style={{ minHeight: 20 }}>
            {product.brandColor && (
              <div
                className="rounded-sm shrink-0"
                style={{ width: 20, height: 20, backgroundColor: product.brandColor }}
              />
            )}
            {tags.map((tag) => (
              <div key={tag} className="bg-[#f8f7f7] rounded-sm flex items-center px-1" style={{ height: 20 }}>
                <p className="text-[#1b1818] text-[10px] font-bold leading-none m-0 uppercase tracking-[0.5px]">{tag}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Middle: name, subtitle, format, price ───────────────── */}
      <div className="flex flex-col gap-2 w-full flex-1">

        {/* Product name block: category label + main name + subtitle */}
        <div className="flex flex-col gap-0.5 w-full">
          {/* Small category label above (maps from description/subtitle) */}
          {product.description && (
            <p className="text-[12px] font-normal leading-[18px] text-[#1b1818] m-0">
              {product.description}
            </p>
          )}
          {/* Main product name */}
          <Link href={`/product/${product.handle}`} className="group">
            <h5
              className="text-[18px] font-bold leading-[24px] text-[#1b1818] m-0 group-hover:text-[#00573f] transition-colors"
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              } as React.CSSProperties}
              title={product.title}
            >
              {product.title}
            </h5>
          </Link>
          {/* Product type / tech line (e.g. "Snack", "Wet Food") */}
          {product.productType && (
            <p className="text-[12px] font-normal leading-[18px] m-0" style={{ color: '#665c5c' }}>
              {product.productType}
            </p>
          )}
        </div>

        {/* EAN / SKU row */}
        {(product.ean || product.sku) && (
          <div className="grid text-[10px] leading-[16px] gap-x-2" style={{ gridTemplateColumns: 'auto 1fr auto 1fr', color: '#a59c9c' }}>
            {product.ean && (
              <>
                <span>EAN</span>
                <span className="font-bold text-[#1b1818]">{product.ean}</span>
              </>
            )}
            {product.sku && (
              <>
                <span>SKU</span>
                <span className="font-bold text-[#1b1818]">{product.sku}</span>
              </>
            )}
          </div>
        )}

        {/* Format option — pill chip style */}
        {formatLabel && (
          <div className="flex">
            <span
              className="inline-flex items-center text-[12px] font-normal leading-[20px] text-[#1b1818]"
              style={{
                border: '1.5px solid #1b1818',
                borderRadius: 1000,
                height: 28,
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              {formatLabel}
            </span>
          </div>
        )}

        {/* Price */}
        {priceAmount && (
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-[18px] font-bold leading-[24px] text-[#1b1818]">
              {currencySymbol} {priceAmount}
            </span>
            {basePriceAmount && (
              <span className="text-[12px] font-normal leading-[18px] line-through" style={{ color: '#a59c9c' }}>
                {currencySymbol}{basePriceAmount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Lower: quantity + ADD ─────────────────────────────── */}
      <div className="flex items-center gap-2 w-full" style={{ height: 40 }}>

        {/* Quantity selector with circle buttons */}
        <div
          className="flex items-center justify-between flex-1 h-full rounded border border-[#1b1818] px-2"
          style={{ opacity: isAvailable ? 1 : 0.3 }}
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!isAvailable || quantity <= 1}
            className="flex items-center justify-center rounded-full border border-[#1b1818] text-[#1b1818] text-[16px] font-light hover:bg-[#1b1818] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Decrease quantity"
            style={{ width: 22, height: 22, lineHeight: 1, paddingBottom: 1 }}
          >
            −
          </button>
          <span className="text-[18px] font-bold leading-[24px] text-[#1b1818]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={!isAvailable}
            className="flex items-center justify-center rounded-full border border-[#1b1818] text-[#1b1818] text-[16px] font-light hover:bg-[#1b1818] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Increase quantity"
            style={{ width: 22, height: 22, lineHeight: 1, paddingBottom: 1 }}
          >
            +
          </button>
        </div>

        {/* ADD button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!isAvailable || isPending}
          className="flex items-center justify-center h-full rounded text-white text-[14px] font-bold tracking-[1px] uppercase transition-colors disabled:cursor-not-allowed"
          style={{ width: '49%', backgroundColor: !isAvailable ? '#a59c9c' : isPending ? '#665c5c' : '#1b1818' }}
        >
          {isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isAvailable ? (
            'ADD'
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}
