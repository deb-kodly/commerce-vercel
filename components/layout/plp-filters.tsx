'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductFilter } from 'lib/sfdc/types';

const PRICE_RANGES = [
  { label: 'Under £10', value: '0-10' },
  { label: '£10 – £25', value: '10-25' },
  { label: '£25 – £50', value: '25-50' },
  { label: 'Over £50', value: '50-99999' },
];

interface PlpFiltersProps {
  availableFilters: ProductFilter[];
}

/**
 * URL encoding: selected spec values are stored as
 *   ?f=SFID1:value1|SFID1:value2|SFID2:value3
 * Each "SFID:value" token is pipe-separated.
 */
function parseFilters(raw: string): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  if (!raw) return map;
  for (const token of raw.split('|')) {
    const idx = token.indexOf(':');
    if (idx === -1) continue;
    const sfid = token.slice(0, idx);
    const val = token.slice(idx + 1);
    if (!sfid || !val) continue;
    if (!map.has(sfid)) map.set(sfid, new Set());
    map.get(sfid)!.add(val);
  }
  return map;
}

function encodeFilters(map: Map<string, Set<string>>): string {
  const tokens: string[] = [];
  for (const [sfid, values] of map.entries()) {
    for (const val of values) {
      tokens.push(`${sfid}:${val}`);
    }
  }
  return tokens.join('|');
}

export function PlpFilters({ availableFilters }: PlpFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = parseFilters(searchParams.get('f') ?? '');
  const activePrice = searchParams.get('price') ?? '';

  function togglePrice(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activePrice === value) params.delete('price');
    else params.set('price', value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggle(sfid: string, value: string) {
    const next = new Map(selected);
    if (!next.has(sfid)) next.set(sfid, new Set());
    const vals = new Set(next.get(sfid)!);
    if (vals.has(value)) {
      vals.delete(value);
      if (vals.size === 0) next.delete(sfid);
      else next.set(sfid, vals);
    } else {
      vals.add(value);
      next.set(sfid, vals);
    }
    const params = new URLSearchParams(searchParams.toString());
    const encoded = encodeFilters(next);
    if (encoded) params.set('f', encoded);
    else params.delete('f');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearSpec(sfid: string) {
    const next = new Map(selected);
    next.delete(sfid);
    const params = new URLSearchParams(searchParams.toString());
    const encoded = encodeFilters(next);
    if (encoded) params.set('f', encoded);
    else params.delete('f');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <>
      {/* Price range filter */}
      <div className="bg-white border border-[#edecec]">
        <div className="px-4 py-3 border-b border-[#edecec] flex items-center justify-between">
          <p className="text-[12px] font-bold text-[#1b1818] uppercase tracking-[0.5px]">Price</p>
          {activePrice && (
            <button
              onClick={() => togglePrice(activePrice)}
              className="text-[11px] text-[#00573f] font-bold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col">
          {PRICE_RANGES.map((range, i) => {
            const isActive = activePrice === range.value;
            return (
              <button
                key={range.value}
                type="button"
                onClick={() => togglePrice(range.value)}
                className={`flex items-center gap-3 px-4 py-2 text-[13px] leading-[20px] transition-colors text-left ${
                  i > 0 ? 'border-t border-[#f3f1f1]' : ''
                } ${
                  isActive
                    ? 'bg-[#00573f] text-white font-bold'
                    : 'text-[#665c5c] hover:bg-[#f8f7f7] hover:text-[#1b1818]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    isActive ? 'border-white' : 'border-[#a59c9c]'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                </span>
                <span className="flex-1">{range.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {availableFilters.map((filter) => {
        const activeVals = selected.get(filter.sfid) ?? new Set<string>();
        return (
          <div key={filter.sfid} className="bg-white border border-[#edecec]">
            <div className="px-4 py-3 border-b border-[#edecec] flex items-center justify-between">
              <p className="text-[12px] font-bold text-[#1b1818] uppercase tracking-[0.5px]">
                {filter.sfdcName}
              </p>
              {activeVals.size > 0 && (
                <button
                  onClick={() => clearSpec(filter.sfid)}
                  className="text-[11px] text-[#00573f] font-bold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-col">
              {filter.specValues.map((sv) => {
                const isActive = activeVals.has(sv.value);
                return (
                  <button
                    key={sv.value}
                    type="button"
                    onClick={() => toggle(filter.sfid, sv.value)}
                    className={`flex items-center gap-3 px-4 py-2 text-[13px] leading-[20px] border-t border-[#f3f1f1] transition-colors text-left ${
                      isActive
                        ? 'bg-[#00573f] text-white font-bold'
                        : 'text-[#665c5c] hover:bg-[#f8f7f7] hover:text-[#1b1818]'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isActive ? 'border-white' : 'border-[#a59c9c]'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </span>
                    <span className="flex-1">{sv.value}</span>
                    {sv.count !== undefined && (
                      <span className={`text-[11px] ${isActive ? 'text-white/70' : 'text-[#a59c9c]'}`}>
                        ({sv.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
