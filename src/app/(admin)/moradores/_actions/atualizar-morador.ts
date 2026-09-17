"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  atualizarMoradorSchema,
  type AtualizarMoradorInput,
} from "./atualizar-morador-schema";

export interface AtualizarMoradorResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof AtualizarMoradorInput, string>>;
}

/**
 * Spec 03 - edicao de cadastro pelo administrativo. E-mail so muda em
 * auth.users e em public.profiles juntos, para os dois nunca ficarem
 * dessincronizados.
 */
export async function atualizarMoradorAction(
  input: AtualizarMoradorInput
): Promise<AtualizarMoradorResult> {
  await requireAdmin();

  const parsed = atualizarMoradorSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors: AtualizarMoradorResult["errors"] = {};
    for (const key of Object.keys(
      fieldErrors
    ) as (keyof AtualizarMoradorInput)[]) {
      errors[key] = fieldErrors[key]?.[0];
    }
    return { success: false, errors };
  }

  const { id, role, full_name, email, phone, bloco, apartamento } = parsed.data;

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", id)
    .maybeSingle();

  if (atual && atual.email !== email) {
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      id,
      { email, email_confirm: true }
    );
    if (authError) {
      const jaExiste = /already.*registered|email_exists/i.test(
        authError.message ?? authError.code ?? ""
      );
      return {
        success: false,
        message: jaExiste
          ? "Já existe um morador cadastrado com este e-mail."
          : "Não foi possível atualizar o e-mail. Tente novamente.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role, full_name, email, phone, bloco, apartamento })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: "Não foi possível salvar as alterações. Tente novamente.",
    };
  }

  revalidatePath("/moradores");
  return { success: true, message: "Cadastro atualizado com sucesso." };
}
