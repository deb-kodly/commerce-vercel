'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function LogoutButton({ isGuestUser }: { isGuestUser: boolean | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      router.replace('/login');
      router.refresh();
    } else {
      console.log('Logout failed');
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return isGuestUser ? (
    <button
      aria-label="Log In"
      onClick={handleSignIn}
      className="flex items-center gap-1.5 text-[#665c5c] text-xs font-bold hover:text-black"
    >
      <UserIcon className="h-5 w-5 shrink-0" />
      <span className="hidden lg:block whitespace-nowrap">Log In</span>
    </button>
  ) : (
    <button
      aria-label="My Account / Logout"
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-[#665c5c] text-xs font-bold hover:text-black max-w-[180px]"
    >
      <UserIcon className="h-5 w-5 shrink-0" />
      <span className="hidden lg:block truncate">My Account</span>
    </button>
  );
}
