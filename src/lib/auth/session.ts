import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Perfil da sessao atual, ou null se nao houver sessao valida, o perfil
 * nao existir mais, ou a conta estiver desativada (Regra 7).
 */
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  return profile;
}

/**
 * Spec 01 - so deixa passar o funcionario administrativo. Sem sessao
 * valida -> /logout (limpa qualquer cookie orfao) -> /login. Morador
 * autenticado -> devolvido a area dele (Regra 3), sem sinalizar erro.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/logout?motivo=desativado");
  if (profile.role !== "administrativo") redirect("/ocorrencias");
  return profile;
}

/**
 * Spec 01 - so deixa passar morador (proprietario ou inquilino; mesmas
 * permissoes). Administrativo autenticado -> devolvido ao dashboard.
 */
export async function requireMorador(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/logout?motivo=desativado");
  if (profile.role === "administrativo") redirect("/dashboard");
  return profile;
}
