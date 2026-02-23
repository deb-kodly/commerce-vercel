export default function OpenCart({
  quantity,
  totalAmount,
  currencyCode,
}: {
  quantity?: number;
  totalAmount?: string;
  currencyCode?: string;
}) {
  const formattedTotal =
    totalAmount && currencyCode && Number(totalAmount) > 0
      ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(
          Number(totalAmount)
        )
      : null;

  return (
    <div className="flex items-center gap-2">
      {/* Cart icon with badge */}
      <div className="relative">
        <img
          src="/images/Bond_CartIcon.svg"
          alt="Cart"
          style={{ width: 18.77, height: 19.31, flexShrink: 0, overflow: 'visible', objectFit: 'cover' }}
        />
        {quantity ? (
          <div className="absolute -top-2 -right-2 flex min-w-[18px] h-[18px] px-[3px] items-center justify-center rounded-full bg-[#00573f] text-[10px] font-bold text-white leading-none">
            {quantity > 99 ? '99+' : quantity}
          </div>
        ) : null}
      </div>

      {/* Total */}
      {formattedTotal && (
        <span className="hidden lg:block text-[13px] font-bold whitespace-nowrap text-[#1b1818]">
          {formattedTotal}
        </span>
      )}
    </div>
  );
}
