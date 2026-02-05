"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type ConfettiHandle = {
  burst: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
};

const COLORS = ["#F8B3B8", "#FFD7C2", "#FFF5E9", "#B7E4C7", "#FCD5CE"];

export const ConfettiCanvas = forwardRef<ConfettiHandle>(function ConfettiCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useImperativeHandle(ref, () => ({
    burst() {
      if (prefersReducedMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas;
      const originX = width / 2;
      const originY = height * 0.2;
      const nextParticles: Particle[] = [];
      for (let i = 0; i < 80; i += 1) {
        nextParticles.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * -6 - 2,
          color: COLORS[i % COLORS.length],
          life: 120 + Math.random() * 40,
        });
      }
      particlesRef.current = nextParticles;
      start();
    },
  }));

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  const start = () => {
    if (rafRef.current) return;
    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 1;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 10);
      }
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
    />
  );
});
