"use client";

import { useEffect, useRef, useState } from "react";
import type { MemoryNote } from "@/data/notes";
import { hashString } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const GRADIENT_PRESETS = [
  "bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 border-rose-200 text-slate-700",
  "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-orange-200 text-slate-700",
  "bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border-emerald-200 text-slate-700",
  "bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 border-fuchsia-200 text-slate-700",
];

type JarProps = {
  notes: MemoryNote[];
  readIds: Set<string>;
  onOpenNote: (note: MemoryNote) => void;
  fillPercent: number;
  showBubbles: boolean;
  finalJustUnlocked: boolean;
};

export function Jar({
  notes,
  readIds,
  onOpenNote,
  fillPercent,
  showBubbles,
  finalJustUnlocked,
}: JarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const positionsRef = useRef<Record<string, { left: number; top: number; rotate: number }>>({});
  const [, setPositionsVersion] = useState(0);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const lastDragRef = useRef<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const taken: Array<{ left: number; top: number }> = Object.values(positionsRef.current).map(
      (pos) => ({ left: pos.left, top: pos.top })
    );
    const minGap = 18;

    const attemptPosition = (seed: number) => {
      const left = 6 + (seed % 72);
      const top = 14 + ((seed >> 3) % 60);
      return { left, top };
    };

    let changed = false;
    for (const note of notes) {
      if (!positionsRef.current[note.id]) {
        const hash = hashString(note.id);
        let candidate = attemptPosition(hash);
        let tries = 0;
        while (
          tries < 24 &&
          taken.some((pos) => Math.hypot(pos.left - candidate.left, pos.top - candidate.top) < minGap)
        ) {
          candidate = attemptPosition(hash + tries * 97);
          tries += 1;
        }
        taken.push(candidate);
        const rotate = ((hash >> 5) % 14) - 7;
        positionsRef.current[note.id] = { left: candidate.left, top: candidate.top, rotate };
        changed = true;
      }
    }
    if (changed) {
      setPositionsVersion((prev) => prev + 1);
    }
  }, [notes]);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const handlePointerDown = (id: string, event: React.PointerEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const current = positionsRef.current[id] ?? { left: 10, top: 10, rotate: 0 };
    const currentX = rect.left + (current.left / 100) * rect.width;
    const currentY = rect.top + (current.top / 100) * rect.height;
    dragRef.current = {
      id,
      offsetX: event.clientX - currentX,
      offsetY: event.clientY - currentY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 3) {
      drag.moved = true;
    }
    const rect = container.getBoundingClientRect();
    const nextX = event.clientX - drag.offsetX - rect.left;
    const nextY = event.clientY - drag.offsetY - rect.top;
    const left = clamp((nextX / rect.width) * 100, 6, 88);
    const top = clamp((nextY / rect.height) * 100, 12, 80);
    positionsRef.current[drag.id] = {
      ...(positionsRef.current[drag.id] ?? { rotate: 0 }),
      left,
      top,
    };
    setPositionsVersion((prev) => prev + 1);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.moved) {
      lastDragRef.current = dragRef.current.id;
    }
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]">
      <div className="relative mt-6">
        <div
          className="absolute left-1/2 top-0 z-30 h-16 w-44 -translate-x-1/2 -translate-y-8 rounded-[24px] bg-gradient-to-b from-rose/80 to-rose/40 shadow-[0_12px_20px_-10px_rgba(59,47,47,0.35)]"
          aria-hidden="true"
        >
          <div className="absolute inset-2 rounded-[20px] border border-white/70" />
          <div className="absolute inset-x-6 inset-y-3 rounded-full bg-white/45 blur-sm" />
        </div>

        <div className="absolute left-1/2 top-4 z-20 h-6 w-40 -translate-x-1/2 rounded-[18px] border border-white/60 bg-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.6)]" aria-hidden="true" />

        <div className="relative h-[420px] w-full overflow-hidden rounded-[48%] border border-white/60 bg-gradient-to-b from-white/75 via-jar/55 to-jar/20 shadow-[0_28px_60px_-40px_rgba(59,47,47,0.45)] backdrop-blur">
          <div className="pointer-events-none absolute inset-2 z-[4] rounded-[46%] border border-white/60" aria-hidden="true" />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[10] rounded-[44%] bg-gradient-to-t from-rose/70 via-peach/50 to-rose/20"
            style={{
              height: `${Math.min(Math.max(fillPercent, 0), 1) * 100}%`,
              transition: prefersReducedMotion ? "none" : "height 600ms ease-out",
            }}
            aria-hidden="true"
          >
          </div>
          <div className="pointer-events-none absolute inset-5 z-[10] rounded-[44%] bg-gradient-to-b from-white/25 via-transparent to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-5 z-[10] rounded-[44%] shadow-[inset_0_0_28px_rgba(255,255,255,0.35)]" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 h-10 w-4/5 -translate-x-1/2 rounded-[40px] bg-white/15 blur-md" aria-hidden="true" />
          <div className="pointer-events-none absolute right-8 top-12 h-36 w-4 rounded-full bg-white/55 blur-sm" aria-hidden="true" />

          <div ref={containerRef} className="absolute inset-[46px] z-[30] pointer-events-auto">
            {notes.map((note, index) => {
              const isRead = readIds.has(note.id);
              const isFinal = note.id === "wish-final";
              const presetIndex = hashString(note.id) % GRADIENT_PRESETS.length;
              const gradientClass = GRADIENT_PRESETS[presetIndex];
              const pos = isFinal
                ? { left: 50, top: 50, rotate: 0 }
                : positionsRef.current[note.id] ?? { left: 10, top: 10, rotate: 0 };
              return (
                <div
                  key={note.id}
                  className={
                    "absolute " +
                    (isFinal
                      ? "z-[35]" +
                        (finalJustUnlocked ? " motion-safe:animate-[final-pop_420ms_ease-out]" : "")
                      : "z-[30] motion-safe:animate-float")
                  }
                  style={{
                    left: `${pos.left}%`,
                    top: `${pos.top}%`,
                    animationDelay: `${index * 0.28}s`,
                  }}
                >
                  <button
                    type="button"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenNote(note);
                      }
                    }}
                    onPointerDown={(event) => handlePointerDown(note.id, event)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onClick={() => {
                      if (lastDragRef.current === note.id) {
                        lastDragRef.current = null;
                        return;
                      }
                      onOpenNote(note);
                    }}
                    className={
                      "touch-none cursor-pointer select-none rounded-md border-2 px-3 py-2 text-[11px] font-semibold min-h-[44px] " +
                      "transition-transform duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose/60 active:cursor-grabbing active:scale-[0.98] " +
                      (isRead && !isFinal
                        ? "opacity-65 saturate-75 shadow-none"
                        : "opacity-100") +
                      (isFinal
                        ? " bg-gradient-to-br from-amber-50 via-rose-50 to-emerald-50 border-amber-300 text-slate-800 ring-2 ring-emerald-200 shadow-lg scale-[1.18]"
                        : "") +
                      " " +
                      gradientClass
                    }
                    style={{
                      transform: isFinal
                        ? "translate(-50%, -50%)"
                        : `rotate(${pos.rotate}deg)`,
                    }}
                    aria-label={`Open note from ${note.author}`}
                  >
                    {isFinal ? "Huỳnh Tiên – a small gift 💚" : note.author}
                  </button>
                </div>
              );
            })}
          </div>

          {!prefersReducedMotion && showBubbles && (
            <div className="pointer-events-none absolute inset-6 z-[25]" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={`bubble-${index}`}
                  className="absolute rounded-full border border-white/40 bg-white/20"
                  style={{
                    left: `${8 + (index * 6) % 78}%`,
                    bottom: `${6 + (index % 5) * 6}%`,
                    width: `${6 + (index % 4) * 3}px`,
                    height: `${6 + (index % 4) * 3}px`,
                    animation: `bubble ${1800 + index * 60}ms ease-out ${index * 60}ms forwards`,
                    transform: `translateX(${(index % 3) - 1}px)`,
                  }}
                />
              ))}
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-2 z-[40] rounded-[46%] border border-white/70 bg-gradient-to-br from-white/20 via-transparent to-white/10"
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute -bottom-6 left-1/2 h-6 w-4/5 -translate-x-1/2 rounded-full bg-ink/10 blur-lg"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
