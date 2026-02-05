import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Jar",
  description: "Open the jar and read birthday memories.",
  openGraph: {
    title: "Memory Jar",
    description: "Open the jar and read birthday memories.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise-bg birthday-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
