'use client';

import Form from 'next/form';
import { useSearchParams } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <Form action="/search" className="relative w-[240px]">
      <input
        key={searchParams?.get('q')}
        type="text"
        name="q"
        placeholder="Search by SKU, product name..."
        autoComplete="off"
        defaultValue={searchParams?.get('q') || ''}
        className="w-full rounded border border-[#d6d1d1] bg-white pl-3 pr-9 py-1 text-[12px] leading-[18px] text-[#1b1818] placeholder:text-[#a59c9c] focus:border-[#00573f] focus:outline-none focus:ring-1 focus:ring-[#00573f] cursor-not-allowed"
        disabled
      />
      <div className="absolute right-2 top-0 flex h-full items-center pointer-events-none">
        <img src="/images/Bond_SearchIcon.svg" alt="" className="h-6 w-6" />
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-[240px]">
      <input
        placeholder="Search by SKU, product name..."
        className="w-full rounded border border-[#d6d1d1] bg-white pl-3 pr-9 py-1 text-[12px] leading-[18px] text-[#1b1818] placeholder:text-[#a59c9c] cursor-not-allowed"
        disabled
      />
      <div className="absolute right-2 top-0 flex h-full items-center pointer-events-none">
        <img src="/images/Bond_SearchIcon.svg" alt="" className="h-6 w-6" />
      </div>
    </form>
  );
}
