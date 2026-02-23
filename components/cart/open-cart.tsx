import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function OpenCart({
  className,
  quantity,
  totalAmount,
  currencyCode
}: {
  className?: string;
  quantity?: number;
  totalAmount?: string;
  currencyCode?: string;
}) {
  const formattedTotal =
    totalAmount && currencyCode
      ? new Intl.NumberFormat('en-EU', { style: 'currency', currency: currencyCode }).format(
          Number(totalAmount)
        )
      : null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative text-[#665c5c] hover:text-black">
        <ShoppingCartIcon
          className={clsx('h-[30px] w-[30px] transition-all ease-in-out hover:scale-110', className)}
        />
        {quantity ? (
          <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#00573f] text-xs font-bold text-white">
            {quantity}
          </div>
        ) : null}
      </div>
      {formattedTotal && (
        <span className="hidden lg:block text-sm font-bold whitespace-nowrap text-[#1b1818]">{formattedTotal}</span>
      )}
    </div>
  );
}
