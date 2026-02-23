import Image from 'next/image';
import Link from 'next/link';
import { Suspense, lazy } from 'react';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';
import { AccountDropdown } from './AccountDropdown';

const LazyCartModal = lazy(() => import('components/cart/modal'));

export async function Navbar({
  isGuestUser,
  userName,
}: {
  isGuestUser: boolean | null;
  userName: string | null;
}) {

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top banner: #00573f, white text, 12px DroidSans Bold, py-1 px-2, centered */}
      <div className="bg-[#00573f] text-white text-center text-[12px] font-bold leading-[18px] py-1 px-2">
        Discover the superiority of Natures Menu products
      </div>

      {/* Main header: white, border-b #edecec, h-80px, px-48px */}
      <nav className="bg-white border-b border-[#edecec] flex items-center h-20 px-12">

        {/* Mobile hamburger */}
        <div className="block flex-none md:hidden mr-3">
          <Suspense fallback={null}>
            <MobileMenu categories={[]} />
          </Suspense>
        </div>

        {/* LEFT: Logo + nav entries (Browse Shop, Promos, categories, Search) */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Logo: 97×63px */}
          <Link href="/" prefetch={true} className="shrink-0">
            <Image
              src="/images/Bond_Logo.png"
              alt="Affinity Pet Care"
              width={97}
              height={63}
              priority
              className="object-contain cursor-pointer"
            />
          </Link>

          {/* Nav entries — stretch to full header height, each item h-20 px-3 */}
          <div className="hidden md:flex items-stretch h-20">
            <Link
              href="/search/ALL_UK"
              prefetch={true}
              className="flex items-center h-20 px-3 text-[14px] font-bold uppercase tracking-[0.14px] text-[#665c5c] hover:text-black whitespace-nowrap"
            >
              Browse Shop
            </Link>

            {/* Promos */}
            <Link
              href="#"
              className="flex items-center h-20 px-3 text-[14px] font-bold uppercase tracking-[0.14px] text-[#665c5c] hover:text-black hover:bg-[#f8f7f7] whitespace-nowrap"
            >
              Promos
            </Link>

            {/* Search bar — part of the left nav cluster per Figma, w-264px */}
            <div className="hidden lg:flex items-center h-20 px-3">
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>
          </div>
        </div>

        {/* RIGHT: Knowledge Centre | Account | Divider | Cart */}
        <div className="flex items-stretch ml-auto h-full">

          {/* Knowledge Centre: w-160px, gap-4px, 12px Bold, #665c5c */}
          <Link
            href="#"
            className="hidden lg:flex items-center gap-1 w-40 h-full px-3 text-[12px] font-bold leading-[18px] text-[#665c5c] hover:text-black whitespace-nowrap"
          >
            <img src="/images/Bond_KnowledgeCentreIcon.svg" alt="" className="h-6 w-6 shrink-0" />
            Knowledge Centre
          </Link>

          {/* Account dropdown */}
          <AccountDropdown isGuestUser={isGuestUser} userName={userName} />

          {/* Vertical divider: 35px */}
          <div className="hidden lg:flex items-center">
            <div className="w-px h-[35px] bg-[#d6d1d1]" />
          </div>

          {/* Cart */}
          <div className="flex items-center hover:bg-[#f8f7f7] px-4 py-2 gap-1">
            <Suspense fallback={<div className="h-[30px] w-[30px]" />}>
              <LazyCartModal />
            </Suspense>
          </div>
        </div>

      </nav>
    </header>
  );
}
