"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid(),
  is_active: z.boolean(),
});

export interface AlternarStatusResult {
  success: boolean;
  message?: string;
}

/**
 * Spec 03 - desativar/reativar acesso (Regra 7). O historico de
 * ocorrencias do morador continua visivel para o administrativo. O
 * trigger `profiles_revoke_sessions_on_deactivate` apaga as sessoes no
 * Auth; a RLS recusa escrita enquanto o access token nao expira.
 */
export async function alternarStatusMoradorAction(
  input: z.infer<typeof schema>
): Promise<AlternarStatusResult> {
  await requireAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Requisição inválida." };
  }

  const supabase = await createClient();
  const { data: alvo } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!alvo || alvo.role === "administrativo") {
    return {
      success: false,
      message: "Não foi possível atualizar o acesso do morador.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: parsed.data.is_active })
    .eq("id", parsed.data.id)
    .in("role", ["proprietario", "inquilino"]);

  if (error) {
    return {
      success: false,
      message: "Não foi possível atualizar o acesso do morador.",
    };
  }

  revalidatePath("/moradores");
  return {
    success: true,
    message: parsed.data.is_active ? "Acesso reativado." : "Acesso desativado.",
  };
}
