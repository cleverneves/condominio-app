import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NOME_CONDOMINIO } from "@/lib/perfil";
import { LoginForm } from "./_components/login-form";

/**
 * Spec 01 - tela de acesso: card nivel 1, marca CondoResolve, sem sidebar.
 * O proxy.ts ja redireciona quem tiver sessao valida para fora desta rota.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const motivo = Array.isArray(params?.motivo)
    ? params.motivo[0]
    : params?.motivo;

  const mensagemInicial =
    motivo === "desativado"
      ? "Acesso desativado. Fale com a administração do condomínio."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-1 text-center">
          <span className="text-headline-lg text-primary">CondoResolve</span>
          <span className="text-body-md text-muted-foreground">
            {NOME_CONDOMINIO}
          </span>
        </div>

        <Card className="shadow-elevation-1">
          <CardHeader className="gap-1">
            <h1 className="text-headline-sm">Entrar</h1>
            <p className="text-body-sm text-muted-foreground">
              Use o e-mail e a senha informados pela administração.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm mensagemInicial={mensagemInicial} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
