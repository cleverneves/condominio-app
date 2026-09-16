import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Morador = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Spec 02/03 - lista todos os moradores (proprietario | inquilino) do
 * condominio, ativos e inativos, ordenados por nome. RLS garante que
 * apenas o administrativo chega a executar esta query com sucesso
 * (profiles_select_self_or_admin).
 */
export async function getMoradores(): Promise<Morador[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["proprietario", "inquilino"])
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os moradores.");
  }

  return data ?? [];
}
