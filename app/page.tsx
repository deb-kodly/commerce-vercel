import { PromoCarousel } from 'components/promo-carousel';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Salesforce.',
  openGraph: {
    type: 'website'
  }
};

export default function HomePage() {
  return (
    <>
      {/* ── Promo Image Carousel ──────────────────────────────────────────── */}
      <PromoCarousel />

      {/* ── How to make an order ─────────────────────────────────────────── */}
      <section className="bg-white px-12 py-16">
        <h2 className="text-center text-[28px] font-bold leading-[38px] text-[#1b1818] mb-12">
          How to make an order
        </h2>

        <div className="flex flex-col md:flex-row items-stretch gap-8 max-w-5xl mx-auto">

          {/* Card 1: Add by SKU */}
          <div className="flex flex-col items-center text-center flex-1 gap-5">
            <div className="flex items-center justify-center h-20 w-20">
              <img
                src="/images/Bond_DocumentTableSearchIcon.svg"
                alt="Add by SKU"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h3 className="text-[16px] font-bold leading-[22px] text-[#1b1818]">
              Add by SKU just in your cart
            </h3>
            <p className="text-[14px] leading-[20px] text-[#665c5c] flex-1">
              Add products to your cart by SKU, name or barcode, then go straight to the Checkout.
            </p>
            <a
              href="/cart"
              className="inline-block bg-[#1b1818] text-white text-[12px] font-bold leading-[18px] uppercase tracking-[0.12px] px-8 py-3 hover:bg-black transition-colors"
            >
              Go to Cart
            </a>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#edecec] self-stretch" />

          {/* Card 2: Upload CSV */}
          <div className="flex flex-col items-center text-center flex-1 gap-5">
            <div className="flex items-center justify-center h-20 w-20">
              <img
                src="/images/Bond_CSVIcon.svg"
                alt="Upload CSV"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h3 className="text-[16px] font-bold leading-[22px] text-[#1b1818]">
              Upload a .CSV file
            </h3>
            <p className="text-[14px] leading-[20px] text-[#665c5c] flex-1">
              Order large of products downloading the template, then add your quantities and upload it.
            </p>
            <a
              href="#"
              className="inline-block bg-[#1b1818] text-white text-[12px] font-bold leading-[18px] uppercase tracking-[0.12px] px-8 py-3 hover:bg-black transition-colors"
            >
              Upload .CSV
            </a>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#edecec] self-stretch" />

          {/* Card 3: Browse shop */}
          <div className="flex flex-col items-center text-center flex-1 gap-5">
            <div className="flex items-center justify-center h-20 w-20">
              <img
                src="/images/Bond_AddShoppingCart.svg"
                alt="Browse shop"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h3 className="text-[16px] font-bold leading-[22px] text-[#1b1818]">
              Browse shop
            </h3>
            <p className="text-[14px] leading-[20px] text-[#665c5c] flex-1">
              Take a look at our range of products and add them to your cart. Check out our latest offers!
            </p>
            <a
              href="/"
              className="inline-block bg-[#1b1818] text-white text-[12px] font-bold leading-[18px] uppercase tracking-[0.12px] px-8 py-3 hover:bg-black transition-colors"
            >
              Go Shopping
            </a>
          </div>

        </div>
      </section>
    </>
  );
}
