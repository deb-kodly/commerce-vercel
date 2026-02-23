'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ROOT_CATEGORY_ID } from 'lib/constants';

interface Suggestion {
  id: string;
  title: string;
  handle: string;
  sku: string;
  description?: string;
}

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions with 300ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      if (!open && suggestions.length > 0) setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigateToProduct(suggestions[activeIndex].handle);
      } else {
        navigateToSearch();
      }
    }
  }

  function navigateToProduct(handle: string) {
    setOpen(false);
    router.push(`/product/${handle}`);
  }

  function navigateToSearch() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search/${ROOT_CATEGORY_ID}?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className="relative w-[240px]">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search by SKU, product name..."
          autoComplete="off"
          className="w-full rounded border border-[#d6d1d1] bg-white pl-3 pr-9 py-1 text-[12px] leading-[18px] text-[#1b1818] placeholder:text-[#a59c9c] focus:border-[#00573f] focus:outline-none focus:ring-1 focus:ring-[#00573f]"
        />
        <button
          type="button"
          onClick={navigateToSearch}
          className="absolute right-2 top-0 flex h-full items-center"
          aria-label="Search"
        >
          {loading ? (
            <span className="h-4 w-4 rounded-full border-2 border-[#00573f] border-t-transparent animate-spin block" />
          ) : (
            <img src="/images/Bond_SearchIcon.svg" alt="" className="h-6 w-6" />
          )}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#edecec] shadow-lg rounded overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => navigateToProduct(s.handle)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                i === activeIndex ? 'bg-[#f0faf6]' : 'hover:bg-[#f8f7f7]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#1b1818] truncate">{s.title}</p>
                {s.sku && <p className="text-[11px] text-[#665c5c]">SKU: {s.sku}</p>}
              </div>
            </button>
          ))}

          <button
            type="button"
            onMouseDown={navigateToSearch}
            className="w-full flex items-center gap-2 px-3 py-2 border-t border-[#edecec] text-[12px] text-[#00573f] font-bold hover:bg-[#f0faf6] transition-colors"
          >
            <img src="/images/Bond_SearchIcon.svg" alt="" className="h-4 w-4" />
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="relative w-[240px]">
      <input
        placeholder="Search by SKU, product name..."
        className="w-full rounded border border-[#d6d1d1] bg-white pl-3 pr-9 py-1 text-[12px] leading-[18px] text-[#1b1818] placeholder:text-[#a59c9c]"
        disabled
      />
      <div className="absolute right-2 top-0 flex h-full items-center pointer-events-none">
        <img src="/images/Bond_SearchIcon.svg" alt="" className="h-6 w-6" />
      </div>
    </div>
  );
}
