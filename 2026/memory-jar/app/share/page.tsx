import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Jar - Happy Birthday Bảo Trâm",
  description: "A jar full of birthday memories waiting to be opened.",
  openGraph: {
    title: "Memory Jar - Happy Birthday Bảo Trâm",
    description: "A jar full of birthday memories waiting to be opened.",
  },
};

export default function SharePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">Memory Jar</p>
        <h1 className="text-3xl font-semibold">Happy Birthday, Bảo Trâm 🎂</h1>
        <p className="text-base text-ink/80">
          A jar full of birthday memories waiting to be opened.
        </p>
      </div>
    </main>
  );
}
