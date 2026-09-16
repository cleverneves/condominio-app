"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, LogOutIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/moradores", label: "Moradores", icon: UsersIcon },
] as const;

/**
 * Spec 01 - itens de navegacao do admin (Dashboard, Moradores, Sair).
 * `variant="sidebar"` empilha (usado no rail/coluna); `variant="mobile"`
 * fica em linha, para a barra compacta em telas < 768px.
 */
export function AdminNavLinks({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        variant === "sidebar"
          ? "flex flex-col gap-1 px-3"
          : "flex flex-1 items-center justify-around gap-1"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              variant === "sidebar"
                ? "px-3 py-2 md:justify-center xl:justify-start"
                : "flex-col gap-0.5 px-3 py-1.5 text-xs",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className={variant === "sidebar" ? "hidden xl:inline" : ""}>
              {item.label}
            </span>
          </Link>
        );
      })}
      {variant === "mobile" && (
        <form action="/logout" method="post" className="contents">
          <button
            type="submit"
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOutIcon className="size-5 shrink-0" />
            <span>Sair</span>
          </button>
        </form>
      )}
    </nav>
  );
}
