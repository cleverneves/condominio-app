import { requireMorador } from "@/lib/auth/session";
import { NOME_CONDOMINIO, ROLE_LABELS } from "@/lib/perfil";
import { MoradorNavLinks } from "./_components/morador-nav-links";

/**
 * Spec 01 - shell da area do morador: sem sidebar, navegacao direta
 * (abrir ocorrencia / minhas ocorrencias) inline no topo em telas >=768px
 * e em barra inferior persistente no mobile (secao 10.4 do PRD).
 */
export default async function MoradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireMorador();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex flex-col leading-tight">
          <span className="text-headline-sm text-primary">CondoResolve</span>
          <span className="text-body-sm text-muted-foreground">
            {NOME_CONDOMINIO}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-label-lg leading-tight text-foreground">
              {profile.full_name}
            </p>
            <p className="text-body-sm leading-tight text-muted-foreground">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
          <div className="hidden md:flex">
            <MoradorNavLinks variant="inline" />
          </div>
          <form action="/logout" method="post" className="md:hidden">
            <button
              type="submit"
              className="text-body-sm font-medium text-muted-foreground hover:text-accent-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 xl:p-8">{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-10 md:hidden">
        <MoradorNavLinks variant="bar" />
      </div>
    </div>
  );
}
