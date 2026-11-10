"use client";

import Image from "next/image";
import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const arrow =
  "absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-glass text-on-hot shadow-pop transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-brand";

/**
 * Instagram-style carousel: arrows only where there's a slide to go to, swipe on touch, arrow
 * keys when focused. The owner draws the "2/5" counter (InstagramEmbed puts it top-right).
 */
export function Carousel({
  slides,
  index,
  onIndex,
  label,
}: {
  slides: string[];
  index: number;
  onIndex: (i: number) => void;
  label: string;
}) {
  const startX = useRef<number | null>(null);
  const go = (i: number) => onIndex(Math.max(0, Math.min(slides.length - 1, i)));
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      className="group/carousel relative aspect-[4/5] w-full touch-pan-y overflow-hidden bg-media outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div
            key={src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
            className="relative h-full w-full shrink-0"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="340px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {index > 0 ? (
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className={cn(arrow, "left-2.5")}
        >
          <CaretLeft className="size-4" />
        </button>
      ) : null}
      {index < slides.length - 1 ? (
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className={cn(arrow, "right-2.5")}
        >
          <CaretRight className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
