"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "./login-schema";

export interface LoginResult {
  error: string;
}

const MENSAGEM_CREDENCIAIS_INVALIDAS =
  "E-mail ou senha incorretos. Verifique e tente novamente.";
const MENSAGEM_CONTA_DESATIVADA =
  "Acesso desativado. Fale com a administração do condomínio.";

/**
 * Spec 01 - login. Nao revela se o e-mail existe (credenciais invalidas
 * sempre recebem a mesma mensagem generica); a unica exceçao e a conta
 * desativada, que informa exatamente isso (Regra 1, 2, 7).
 */
export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? MENSAGEM_CREDENCIAIS_INVALIDAS,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: MENSAGEM_CREDENCIAIS_INVALIDAS };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: MENSAGEM_CREDENCIAIS_INVALIDAS };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: MENSAGEM_CONTA_DESATIVADA };
  }

  redirect(profile.role === "administrativo" ? "/dashboard" : "/ocorrencias");
}
