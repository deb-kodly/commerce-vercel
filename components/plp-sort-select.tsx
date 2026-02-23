'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { sorting } from 'lib/constants';

export function PlpSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? '';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-[#665c5c] whitespace-nowrap">Sort by:</span>
      <select
        value={currentSort}
        onChange={handleChange}
        className="border border-[#d6d1d1] bg-white text-[12px] text-[#1b1818] py-1.5 pl-3 pr-8 focus:border-[#00573f] focus:outline-none appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23665c5c' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {sorting.map((item) => (
          <option key={item.slug ?? 'default'} value={item.slug ?? ''}>
            {item.title}
          </option>
        ))}
      </select>
    </div>
  );
}
