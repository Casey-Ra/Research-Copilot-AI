import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Research Copilot AI",
  description:
    "A production-style document intelligence app for grounded search, chat, and summaries.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.className}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_#06131f_0%,_#0b1724_40%,_#f5f7fb_40%,_#f5f7fb_100%)] text-slate-950">
          <Navbar />
          <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col px-6 pb-16 pt-8 sm:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
