'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const deliveryLocations = [
  { id: '1', name: 'Shop_Address_1', active: true },
  { id: '2', name: 'Shop_Address_2 with very long name', active: false },
  { id: '3', name: 'Shop_Address_3', active: false },
  { id: '4', name: 'Shop_Address_4', active: false },
];

const menuItems = [
  { label: 'My account', href: '/account' },
  { label: 'Orders & Invoices', href: '/orders' },
  { label: 'Reorder', href: '/reorder' },
  { label: 'My lists', href: '/lists' },
  { label: 'Help Centre', href: '/help' },
  { label: 'FAQS', href: '/faqs' },
];

export function AccountDropdown({
  isGuestUser,
  userName,
}: {
  isGuestUser: boolean | null;
  userName: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => router.push('/login');

  const handleLogout = async () => {
    setIsOpen(false);
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      router.replace('/login');
      router.refresh();
    }
  };

  if (isGuestUser) {
    return (
      <div className="flex items-center self-stretch px-3 gap-1">
        <button
          aria-label="Log In"
          onClick={handleSignIn}
          className="flex items-center gap-1 text-[#665c5c] text-[12px] font-bold leading-[18px] hover:text-black whitespace-nowrap font-droidsans"
        >
          <img src="/images/Bond_AccountIcon.svg" alt="" className="h-6 w-6 shrink-0" />
          <span className="hidden lg:block">Log In</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative flex items-center self-stretch px-3 gap-1 transition-colors ${isOpen ? 'bg-[#f8f7f7]' : 'bg-white'}`}
    >
      {/* Trigger */}
      <button
        aria-label="My Account"
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1 text-[#665c5c] text-[12px] font-bold leading-[18px] hover:text-black max-w-[130px] font-droidsans"
      >
        <img src="/images/Bond_AccountIcon.svg" alt="" className="h-6 w-6 shrink-0" />
        <span className="hidden lg:block truncate">{userName || 'My Account'}</span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 top-full w-[232px] bg-white rounded-b-[4px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] z-50 overflow-hidden font-droidsans">

          {/* Section 1: Navigation links */}
          <ul>
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center h-8 px-4 text-[14px] leading-[19px] text-[#1b1818] hover:bg-[#f5f5f5]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="h-px bg-[#edecec]" />

          {/* Section 2: Switch Delivery Location */}
          <div className="py-2">
            <p className="px-4 py-1 text-[10px] font-bold leading-[14px] uppercase text-[#a59c9c]">
              Switch Delivery Location
            </p>
            {deliveryLocations.map((loc) =>
              loc.active ? (
                <div key={loc.id} className="flex items-center gap-2 px-4 py-1">
                  <img src="/images/Bond_StoreIcon_Active.svg" alt="" className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate text-[12px] font-bold leading-[18px] text-[#0d5740]">
                    {loc.name}
                  </span>
                  <img src="/images/Bond_GreenCheckIcon.svg" alt="" className="h-4 w-4 shrink-0" />
                </div>
              ) : (
                <div key={loc.id} className="flex items-center gap-2 px-4 py-1 hover:bg-[#f5f5f5] cursor-pointer">
                  <img src="/images/Bond_StoreIcon.svg" alt="" className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate text-[12px] leading-[18px] text-[#665c5c]">
                    {loc.name}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#edecec]" />

          {/* Section 3: Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 h-8 px-4 w-full text-[14px] leading-[19px] text-[#00573f] hover:bg-[#f5f5f5]"
            >
              Log out
              <img src="/images/Bond_LogoutIcon.svg" alt="" className="h-5 w-5 shrink-0" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
