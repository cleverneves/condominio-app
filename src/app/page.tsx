import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";

/**
 * Spec 01 - ponto neutro de redirecionamento: nunca renderiza UI propria.
 * Sem sessao valida -> limpa e volta ao login. Com sessao -> area do
 * perfil (administrativo ou morador).
 */
export default async function RootPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/logout?motivo=desativado");
  }

  if (profile.role === "administrativo") {
    redirect("/dashboard");
  }

  redirect("/ocorrencias");
}
