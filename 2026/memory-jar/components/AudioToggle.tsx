"use client";

type AudioToggleProps = {
  playing: boolean;
  onToggle: () => void;
};

export function AudioToggle({ playing, onToggle }: AudioToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="min-h-[44px] rounded-full border border-rose/50 bg-white/70 px-4 py-2 text-sm font-medium shadow-soft transition hover:scale-[1.02]"
        aria-pressed={playing}
        aria-label={playing ? "Pause background audio" : "Play background audio"}
      >
        <span className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
          >
            {playing ? (
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
          {playing ? "Pause" : "Play music"}
        </span>
      </button>
    </div>
  );
}
