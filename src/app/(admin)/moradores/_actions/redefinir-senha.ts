"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaInput,
} from "./redefinir-senha-schema";

export interface RedefinirSenhaResult {
  success: boolean;
  message?: string;
}

/**
 * Spec 03 - "esqueci a senha" nao existe para o morador (Regra 18): so o
 * administrativo redefine, aqui, e informa a nova senha por fora do
 * sistema.
 */
export async function redefinirSenhaAction(
  input: RedefinirSenhaInput
): Promise<RedefinirSenhaResult> {
  await requireAdmin();

  const parsed = redefinirSenhaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Senha inválida.",
    };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(
    parsed.data.id,
    { password: parsed.data.password }
  );

  if (error) {
    return {
      success: false,
      message: "Não foi possível redefinir a senha. Tente novamente.",
    };
  }

  return { success: true, message: "Senha redefinida com sucesso." };
}
