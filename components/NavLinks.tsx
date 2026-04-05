"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type NavLinksProps = {
  links: Array<{
    href: string;
    label: string;
  }>;
};

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-[rgba(47,103,218,0.22)] text-white"
                : "text-slate-300 hover:bg-white/8 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
