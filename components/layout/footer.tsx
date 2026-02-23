import Image from 'next/image';
import Link from 'next/link';
import { Category } from 'lib/sfdc';

export default async function Footer({ categoriesPromise }: { categoriesPromise: Promise<Category[]> }) {
  return (
    <footer>
      {/* ── Section 1: Sitemap ─────────────────────────────────────────── */}
      {/* white bg, px-48px py-40px, gap-48px between columns */}
      <div className="bg-white flex flex-row gap-12 items-start px-12 py-10">

        {/* Col 1: Logo + phone */}
        <div className="flex flex-col gap-10 items-start flex-1 min-w-0">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-affinity.png"
              alt="Affinity Pet Care"
              width={104}
              height={64}
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/images/Bond_PhonePortal.svg" alt="" className="h-6 w-6 shrink-0" />
            <span className="text-[14px] leading-[19px] text-[#665c5c]">0800 018 3770</span>
          </div>
        </div>

        {/* Col 2: SHOP */}
        <div className="flex flex-col gap-4 items-start flex-1 min-w-0">
          <p className="text-[14px] font-bold uppercase tracking-[0.14px] text-[#665c5c]">Shop</p>
          <ul className="flex flex-col gap-3">
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Browse all</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Promos</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Cart</a></li>
          </ul>
        </div>

        {/* Col 3: MY PORTAL */}
        <div className="flex flex-col gap-4 items-start flex-1 min-w-0">
          <p className="text-[14px] font-bold uppercase tracking-[0.14px] text-[#665c5c]">My Portal</p>
          <ul className="flex flex-col gap-3">
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">My account</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Orders &amp; Invoices</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Reorder</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">My lists</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Help Centre</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">FAQS</a></li>
          </ul>
        </div>

        {/* Col 4: KNOWLEDGE CENTRE */}
        <div className="flex flex-col gap-4 items-start flex-1 min-w-0">
          <p className="text-[14px] font-bold uppercase tracking-[0.14px] text-[#665c5c]">Knowledge Centre</p>
          <ul className="flex flex-col gap-3">
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Advice</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">Education</a></li>
            <li><a href="#" className="text-[14px] leading-[19px] text-[#665c5c] hover:text-black">About us</a></li>
          </ul>
        </div>

      </div>

      {/* ── Section 2: Trust / Logos bar ───────────────────────────────── */}
      {/* #f8f7f7 bg, px-48px py-24px, gap-24px, centered */}
      <div className="bg-[#f8f7f7] flex items-center justify-center gap-6 px-12 py-6 flex-wrap">
        <img
          src="/images/Bond_Footer_1000_Logo.png"
          alt="1000 Companies to Inspire Britain"
          className="h-12 w-[72px] object-contain"
        />
        <img
          src="/images/Bond_Footer_Salsa_Logo.png"
          alt="SALSA"
          className="h-12 object-contain"
        />
        <div className="flex items-center gap-2">
          <img src="/images/Bond_Footer_Maestro_Logo.png"      alt="Maestro"       className="h-[18px] w-auto object-contain" />
          <img src="/images/Bond_Footer_MasterCard_Logo.png"   alt="Mastercard"    className="h-8 w-8 object-contain" />
          <img src="/images/Bond_Footer_Visa_Logo.png"         alt="Visa"          className="h-[10px] w-auto object-contain" />
          <img src="/images/Bond_Footer_VisaDebit_Logo.png"    alt="Visa Debit"    className="h-[22px] w-auto object-contain" />
          <img src="/images/Bond_Footer_VisaElectron_Logo.png" alt="Visa Electron" className="h-8 w-8 object-contain" />
        </div>
      </div>

      {/* ── Section 3: Legal bar ───────────────────────────────────────── */}
      {/* white bg, px-48px py-24px */}
      <div className="bg-white flex items-center px-12 py-6 gap-6">
        <p className="flex-1 text-center text-[14px] leading-[19px] text-[#1b1818]">
          {new Date().getFullYear()} &copy; All rights reserved
        </p>
        <div className="flex flex-1 items-center justify-end gap-6 flex-wrap">
          <a href="#" className="text-[12px] font-bold leading-[18px] text-[#665c5c] underline hover:text-black">Terms &amp; Conditions</a>
          <a href="#" className="text-[12px] font-bold leading-[18px] text-[#665c5c] underline hover:text-black">Privacy Policy</a>
          <a href="#" className="text-[12px] font-bold leading-[18px] text-[#665c5c] underline hover:text-black">Cookie Settings</a>
          <a href="#" className="text-[12px] font-bold leading-[18px] text-[#665c5c] underline hover:text-black">Cookie Policy</a>
        </div>
      </div>

    </footer>
  );
}
