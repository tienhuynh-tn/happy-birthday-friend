"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type ModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(
      "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
    );
    const first = focusable?.[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && focusable && focusable.length > 0) {
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          "relative z-50 w-full max-w-lg rounded-[36px] bg-[#FFF9F2] p-6 shadow-[0_18px_50px_-20px_rgba(59,47,47,0.5)]" +
          (prefersReducedMotion ? "" : " motion-safe:animate-[card_260ms_ease-out]")
        }
      >
        <div className="absolute inset-0 rounded-[36px] border border-white/80 bg-gradient-to-br from-white/70 via-transparent to-white/30" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                🎉
              </span>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid min-h-[40px] min-w-[40px] place-items-center rounded-full border border-rose/40 bg-white/70 text-ink/70 transition hover:text-ink active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-ink/90">{children}</div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink/60">
            <span aria-hidden="true">✨</span>
            <span>Happy Birthday</span>
            <span aria-hidden="true">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
