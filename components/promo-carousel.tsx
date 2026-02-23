'use client';

import { useCallback, useEffect, useState } from 'react';

// ─── Configuration ────────────────────────────────────────────────────────────
// Add your carousel images to /public/carousel/ and list the filenames here.
// Supported formats: .jpg, .jpeg, .png, .webp
const SLIDES: string[] = [
  '/carousel/UK PROMO NATURES MENU.jpg',
  '/carousel/UK PROMO NATURES.jpg',
  '/carousel/BANNER PRUEBA UK (2).png',
  '/carousel/DD4050.png',
  '/carousel/DD4060 HORIZONTAL NUEVO DTO.png',
  '/carousel/DD4065 HORIZONTAL.png',
  '/carousel/DD4068 HORIZONTAL NUEVO DTO.png',
  '/carousel/DD4069 HORIZONTAL.png',
  '/carousel/DD4071 HORIZONTAL.png',
  '/carousel/DD4072 HORIZONTAL.png',
  '/carousel/DD4073 HORIZONTAL.png',
];

const AUTO_PLAY_MS = 4000;
// ─────────────────────────────────────────────────────────────────────────────

export function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  // Track which slide indices failed to load so we can hide them
  const [failed, setFailed] = useState<Set<number>>(new Set());

  const visibleSlides = SLIDES.filter((_, i) => !failed.has(i));

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + Math.max(visibleSlides.length, 1)) % Math.max(visibleSlides.length, 1)),
    [visibleSlides.length]
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % Math.max(visibleSlides.length, 1)),
    [visibleSlides.length]
  );

  useEffect(() => {
    if (paused || visibleSlides.length <= 1) return;
    const t = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [paused, next, visibleSlides.length]);

  // Reset current index if it goes out of bounds after failures
  useEffect(() => {
    if (visibleSlides.length > 0 && current >= visibleSlides.length) {
      setCurrent(0);
    }
  }, [visibleSlides.length, current]);

  // Don't render anything if no slides loaded successfully
  if (SLIDES.length === 0 || (failed.size === SLIDES.length)) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{ minHeight: '320px', height: '42vw', maxHeight: '640px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        {/* Slides */}
        {SLIDES.map((src, i) => {
          if (failed.has(i)) return null;
          const visibleIndex = SLIDES.slice(0, i + 1).filter((_, j) => !failed.has(j)).length - 1;
          return (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                visibleIndex === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Using <img> instead of next/image — avoids optimization-layer errors for user-supplied files */}
              <img
                src={src}
                alt={`Promo slide ${i + 1}`}
                className="h-full w-full object-contain"
                onError={() => setFailed((prev) => new Set([...prev, i]))}
              />
            </div>
          );
        })}

        {/* Arrows — only show when there is more than one visible slide */}
        {visibleSlides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 shadow hover:bg-white transition"
            >
              <img src="/images/ShopX_LeftArrow.svg" alt="" className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 shadow hover:bg-white transition"
            >
              <img src="/images/ShopX_RightArrow.svg" alt="" className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots — only show when more than one slide */}
        {visibleSlides.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {visibleSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
