"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "Wu8NeFXaoOc";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type AudioToggleProps = {
  stopSignal?: number;
};

export function AudioToggle({ stopSignal }: AudioToggleProps) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "0",
          width: "0",
          videoId: VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: VIDEO_ID,
            playsinline: 1,
          },
        });
      }
      return;
    }

    if (!document.getElementById("yt-iframe-api")) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: VIDEO_ID,
          playsinline: 1,
        },
      });
    };
  }, []);

  const toggle = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pauseVideo();
      setPlaying(false);
    } else {
      player.playVideo();
      setPlaying(true);
    }
  };

  const stop = () => {
    const player = playerRef.current;
    if (!player) return;
    player.pauseVideo();
    setPlaying(false);
  };

  useEffect(() => {
    if (stopSignal === undefined) return;
    stop();
  }, [stopSignal]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
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
      <div ref={containerRef} className="h-0 w-0 overflow-hidden opacity-0" aria-hidden="true" />
    </div>
  );
}
