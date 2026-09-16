import { LogOutIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { NOME_CONDOMINIO, ROLE_LABELS } from "@/lib/perfil";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminNavLinks } from "./_components/admin-nav-links";

function iniciaisDoNome(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Spec 01 - shell administrativo: sidebar fixa 260px (>=1280px), trilho de
 * icones 72px (768-1279px) e barra compacta no rodape em mobile
 * (secao 10.4 do PRD). So renderiza para o funcionario administrativo.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="hidden md:flex md:w-18 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar xl:w-65">
        <div className="flex h-16 items-center justify-center gap-2 border-b border-sidebar-border px-3 xl:justify-start xl:px-5">
          <span className="text-headline-sm font-bold text-sidebar-primary">
            CR
          </span>
          <div className="hidden flex-col xl:flex">
            <span className="text-label-lg leading-tight text-sidebar-foreground">
              CondoResolve
            </span>
            <span className="text-body-sm leading-tight text-muted-foreground">
              {NOME_CONDOMINIO}
            </span>
          </div>
        </div>

        <div className="mt-4 hidden px-6 xl:block">
          <span className="text-label-sm text-muted-foreground">MENU</span>
        </div>

        <div className="mt-2">
          <AdminNavLinks variant="sidebar" />
        </div>

        <div className="mt-auto border-t border-sidebar-border p-3">
          <form action="/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:justify-center xl:justify-start"
            >
              <LogOutIcon className="size-5 shrink-0" />
              <span className="hidden xl:inline">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <span className="text-headline-sm text-primary md:hidden">
            CondoResolve
          </span>
          <span className="hidden text-body-sm text-muted-foreground md:inline">
            {NOME_CONDOMINIO}
          </span>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-label-lg leading-tight text-foreground">
                {profile.full_name}
              </p>
              <p className="text-body-sm leading-tight text-muted-foreground">
                {ROLE_LABELS[profile.role]}
              </p>
            </div>
            <Avatar size="lg">
              <AvatarFallback className="bg-accent text-accent-foreground">
                {iniciaisDoNome(profile.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="border-b border-border bg-card px-2 py-1 md:hidden">
          <AdminNavLinks variant="mobile" />
        </div>

        <main className="flex-1 p-4 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
