import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Copilot AI",
  description: "Upload documents, find evidence, ask questions, and save notes.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="ui-shell text-slate-950">
          <Navbar />
          <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col px-5 pb-16 pt-8 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
