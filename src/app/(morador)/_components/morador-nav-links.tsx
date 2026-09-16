"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardListIcon, LogOutIcon, PlusCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/ocorrencias",
    label: "Minhas ocorrências",
    icon: ClipboardListIcon,
    exact: true,
  },
  {
    href: "/ocorrencias/nova",
    label: "Abrir ocorrência",
    icon: PlusCircleIcon,
    exact: true,
  },
] as const;

/**
 * Spec 01 - navegacao da area do morador: abrir ocorrencia e minhas
 * ocorrencias (+ sair). `variant="bar"` fica fixa no rodape em mobile
 * (<768px, secao 10.4 do PRD); `variant="inline"` fica no topo em telas
 * maiores (sem sidebar para o morador).
 */
export function MoradorNavLinks({ variant }: { variant: "bar" | "inline" }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        variant === "bar"
          ? "flex items-center justify-around gap-1 border-t border-border bg-card px-2 py-2"
          : "flex items-center gap-2"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-full text-sm font-medium transition-colors",
              variant === "bar"
                ? "flex-col gap-0.5 px-4 py-1 text-xs"
                : "px-4 py-2",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {variant === "inline" && (
        <form action="/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"
          >
            <LogOutIcon className="size-4 shrink-0" />
            Sair
          </button>
        </form>
      )}
    </nav>
  );
}
