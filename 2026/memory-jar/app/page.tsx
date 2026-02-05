"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { noteColors, type MemoryNote } from "@/data/notes";
import { pickOne } from "@/lib/utils";
import { AudioToggle } from "@/components/AudioToggle";
import { ConfettiCanvas, type ConfettiHandle } from "@/components/ConfettiCanvas";
import { Jar } from "@/components/Jar";
import { Modal } from "@/components/Modal";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export default function HomePage() {
  const [baseNotes, setBaseNotes] = useState<MemoryNote[]>([]);
  const [finalNote, setFinalNote] = useState<MemoryNote | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const initialWishes = baseNotes;
  const totalCount = initialWishes.length;
  const readCount = initialWishes.filter((note) => readIds.has(note.id)).length;
  const fillPercent = totalCount > 0 ? Math.min(Math.max(readCount / totalCount, 0), 1) : 0;
  const unlockedFinal = totalCount > 0 && readCount === totalCount;
  const visibleWishes = useMemo(
    () => [...initialWishes, ...(unlockedFinal && finalNote ? [finalNote] : [])],
    [initialWishes, finalNote, unlockedFinal]
  );
  const [showBubbles, setShowBubbles] = useState(false);
  const [finalJustUnlocked, setFinalJustUnlocked] = useState(false);
  const [activeNote, setActiveNote] = useState<MemoryNote | null>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const prevUnlockedRef = useRef<boolean | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showFinalFx, setShowFinalFx] = useState(false);
  const [hasPlayedFinalFx, setHasPlayedFinalFx] = useState(false);
  const [stopMainMusicSignal, setStopMainMusicSignal] = useState(0);
  const [finalAudioNonce, setFinalAudioNonce] = useState(0);

  // Celebrate on first load.
  useEffect(() => {
    confettiRef.current?.burst();
  }, []);

  useEffect(() => {
    const loadWishes = async () => {
      try {
        const response = await fetch("./wishes.txt");
        if (!response.ok) {
          console.error("Wishes file not found. Expected ./wishes.txt in the deployed folder.");
          return;
        }
        const text = await response.text();
        const lines = text.split("\n");
        const parsed: Array<{ author: string; message: string }> = [];
        let currentAuthor = "";
        let currentMessage: string[] = [];
        let inMessage = false;

        const flush = () => {
          if (currentAuthor && currentMessage.length > 0) {
            parsed.push({
              author: currentAuthor,
              message: currentMessage.join("\n").trim(),
            });
          }
          currentAuthor = "";
          currentMessage = [];
          inMessage = false;
        };

        for (const rawLine of lines) {
          const line = rawLine.replace(/\r$/, "");
          if (line.toLowerCase().startsWith("name:")) {
            flush();
            currentAuthor = line.replace(/name:/i, "").trim();
            continue;
          }
          if (line.toLowerCase().startsWith("message:")) {
            inMessage = true;
            continue;
          }
          if (inMessage) {
            currentMessage.push(line);
          }
        }
        flush();

        const finalEntryIndex = parsed.findIndex(
          (entry) =>
            entry.author === "Huỳnh Tiên" && entry.message.includes("Best wishes for you")
        );
        const finalEntry = finalEntryIndex >= 0 ? parsed[finalEntryIndex] : null;
        const baseEntries =
          finalEntryIndex >= 0 ? parsed.filter((_, idx) => idx !== finalEntryIndex) : parsed;

        const notes = baseEntries.map((entry, index) => ({
          id: `wish-${index + 1}`,
          author: entry.author,
          message: entry.message,
          colorVariant: noteColors[index % noteColors.length],
        })) as MemoryNote[];

        setBaseNotes(notes.filter((note) => note.message));

        if (finalEntry?.message) {
          setFinalNote({
            id: "wish-final",
            author: finalEntry.author,
            message: finalEntry.message,
            colorVariant: noteColors[notes.length % noteColors.length],
          });
        }
      } catch {
        // If wishes can't load, keep the jar empty.
        setBaseNotes([]);
      }
    };
    loadWishes();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("memory-jar-read-ids", JSON.stringify(Array.from(readIds)));
    } catch {
      // ignore storage errors
    }
  }, [readIds]);

  const openWish = (note: MemoryNote) => {
    setReadIds((prev) => {
      if (prev.has(note.id)) return prev;
      const next = new Set(prev);
      next.add(note.id);
      return next;
    });
    setActiveNote(note);
    confettiRef.current?.burst();
    if (note.id === "wish-final" && !hasPlayedFinalFx && !prefersReducedMotion) {
      setShowFinalFx(true);
      setHasPlayedFinalFx(true);
      window.setTimeout(() => setShowFinalFx(false), 3000);
    }
    if (note.id === "wish-final") {
      setStopMainMusicSignal((prev) => prev + 1);
      setFinalAudioNonce((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (totalCount === 0) return;
    if (prevUnlockedRef.current === null) {
      prevUnlockedRef.current = unlockedFinal;
      return;
    }
    if (!prevUnlockedRef.current && unlockedFinal) {
      setShowBubbles(true);
      setFinalJustUnlocked(true);
      const timer = window.setTimeout(() => setShowBubbles(false), 2000);
      const finalTimer = window.setTimeout(() => setFinalJustUnlocked(false), 1200);
      prevUnlockedRef.current = unlockedFinal;
      return () => {
        window.clearTimeout(timer);
        window.clearTimeout(finalTimer);
      };
    }
    prevUnlockedRef.current = unlockedFinal;
    return undefined;
  }, [totalCount, unlockedFinal]);

  const unreadNotes = visibleWishes.filter((note) => !readIds.has(note.id));

  const pickRandomNote = () => {
    const pool = unreadNotes.length > 0 ? unreadNotes : visibleWishes;
    const chosen = pickOne(pool);
    if (chosen) openWish(chosen);
  };

  return (
    <main className="relative min-h-screen px-5 py-8 sm:px-10">
      <ConfettiCanvas ref={confettiRef} />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">Memory Jar</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Happy Birthday, bro 🎂</h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <AudioToggle stopSignal={stopMainMusicSignal} />
            <button
              type="button"
              onClick={pickRandomNote}
              className="min-h-[44px] rounded-full border border-rose/50 bg-rose/40 px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:scale-[1.02]"
            >
              Pick a random wish
            </button>
          </div>
        </header>

        <p className="text-xs italic text-ink/60">
          Tap the names to read the wish, or press “Pick a random wish” for a surprise. Open all
          wishes to see the final surprise at the end. You can also drag wishes around inside the
          jar to make them easier to open.
        </p>

        <div className="relative w-full">
          <Jar
            notes={visibleWishes}
            readIds={readIds}
            onOpenNote={openWish}
            fillPercent={fillPercent}
            showBubbles={showBubbles}
            finalJustUnlocked={finalJustUnlocked}
          />
          {process.env.NODE_ENV === "development" && (
            <button
              type="button"
              onClick={() => {
                setReadIds(new Set());
                setActiveNote(null);
                try {
                  window.localStorage.removeItem("memory-jar-read-ids");
                } catch {
                  // ignore
                }
              }}
              className="mx-auto mt-4 min-h-[44px] rounded-full border border-rose/40 bg-white/70 px-4 py-2 text-sm text-ink/70 shadow-soft"
            >
              Reset progress
            </button>
          )}
        </div>
      </section>

      {activeNote && (
        <Modal
          isOpen={Boolean(activeNote)}
          title={activeNote.author}
          onClose={() => {
            setActiveNote(null);
            setFinalAudioNonce((prev) => (activeNote?.id === "wish-final" ? prev + 1 : prev));
          }}
        >
          <div>
            {activeNote.date && (
              <p className="text-xs uppercase tracking-widest text-ink/50">{activeNote.date}</p>
            )}
            <p className="text-base leading-relaxed whitespace-pre-line">{activeNote.message}</p>
          </div>
        </Modal>
      )}

      {activeNote?.id === "wish-final" && (
        <iframe
          key={`final-audio-${finalAudioNonce}`}
          src="https://www.youtube.com/embed/S7KA4tQ483o?start=10&controls=0&autoplay=1&mute=0"
          title="Final wish audio"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="fixed -left-[9999px] top-0 h-[1px] w-[1px] opacity-0 pointer-events-none"
        />
      )}

      {showFinalFx && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 32 }).map((_, index) => (
            <span
              key={`final-bubble-${index}`}
              className="absolute rounded-full blur-[1px]"
              style={{
                left: `${(index * 7) % 100}%`,
                bottom: `-${10 + (index % 6) * 8}%`,
                width: `${8 + (index % 5) * 6}px`,
                height: `${8 + (index % 5) * 6}px`,
                background:
                  index % 3 === 0
                    ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(244,114,182,0.6) 55%)"
                    : index % 3 === 1
                      ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(251,113,133,0.6) 55%)"
                      : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(52,211,153,0.6) 55%)",
                animation: `finalBubble ${2400 + index * 30}ms ease-out ${index * 40}ms forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div className="birthday-icons fixed inset-0 z-0" aria-hidden="true" />

      <footer className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-ink/60">
        <span>© 2026 by tienhuynh-tn · Supported by ChatGPT & Codex</span>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/tienhuynh-tn"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile"
            className="rounded-full p-1 transition hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48l-.02-1.7c-2.78.62-3.37-1.2-3.37-1.2-.46-1.2-1.12-1.52-1.12-1.52-.92-.65.07-.64.07-.64 1.02.07 1.56 1.08 1.56 1.08.9 1.6 2.36 1.14 2.94.87.09-.68.35-1.14.64-1.4-2.22-.26-4.56-1.15-4.56-5.12 0-1.13.39-2.05 1.02-2.77-.1-.26-.44-1.3.1-2.71 0 0 .84-.28 2.75 1.06a9.3 9.3 0 0 1 5 0c1.9-1.34 2.74-1.06 2.74-1.06.54 1.41.2 2.45.1 2.71.64.72 1.02 1.64 1.02 2.77 0 3.98-2.34 4.85-4.57 5.11.36.32.68.95.68 1.92l-.01 2.85c0 .26.18.59.68.48A10.1 10.1 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/tienhuynh-tn/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn profile"
            className="rounded-full p-1 transition hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M6.94 8.5H4.2V20h2.74V8.5zM5.57 4.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM20 20h-2.74v-5.9c0-1.41-.03-3.22-1.96-3.22-1.96 0-2.26 1.54-2.26 3.12V20H10.3V8.5h2.63v1.57h.04c.37-.7 1.27-1.44 2.62-1.44 2.8 0 3.32 1.87 3.32 4.3V20z" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
