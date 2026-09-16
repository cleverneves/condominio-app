"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const criarMoradorSchema = z.object({
  role: z.enum(["proprietario", "inquilino"], {
    message: "Selecione o tipo do morador.",
  }),
  full_name: z.string().trim().min(3, "Informe o nome completo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  phone: z.string().trim().min(8, "Informe um telefone válido."),
  bloco: z.string().trim().min(1, "Informe o bloco."),
  apartamento: z.string().trim().min(1, "Informe o apartamento."),
  password: z
    .string()
    .min(6, "A senha temporária precisa ter pelo menos 6 caracteres."),
});

export type CriarMoradorInput = z.infer<typeof criarMoradorSchema>;

export interface CriarMoradorResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof CriarMoradorInput, string>>;
}

/**
 * Spec 02 - cadastro de morador pelo administrativo (Regra 5/6). Cria a
 * conta em auth.users (senha temporaria, sem e-mail de confirmacao) e o
 * perfil em public.profiles, nessa ordem, para nunca sobrar perfil "orfao".
 */
export async function criarMoradorAction(
  input: CriarMoradorInput
): Promise<CriarMoradorResult> {
  await requireAdmin();

  const parsed = criarMoradorSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors: CriarMoradorResult["errors"] = {};
    for (const key of Object.keys(fieldErrors) as (keyof CriarMoradorInput)[]) {
      errors[key] = fieldErrors[key]?.[0];
    }
    return { success: false, errors };
  }

  const { role, full_name, email, phone, bloco, apartamento, password } =
    parsed.data;

  const adminClient = createAdminClient();

  const { data: created, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !created.user) {
    const jaExiste =
      authError?.code === "email_exists" ||
      /already.*registered/i.test(authError?.message ?? "");
    return {
      success: false,
      message: jaExiste
        ? "Já existe um morador cadastrado com este e-mail."
        : "Não foi possível criar o acesso do morador. Tente novamente.",
    };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    role,
    full_name,
    email,
    phone,
    bloco,
    apartamento,
  });

  if (profileError) {
    // Sem perfil correspondente o login falha (Spec 01 exige profile
    // ativo) - desfaz o usuario recem-criado para nao deixar acesso orfao.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return {
      success: false,
      message:
        "Não foi possível salvar o cadastro do morador. Tente novamente.",
    };
  }

  revalidatePath("/moradores");
  return { success: true, message: "Morador cadastrado com sucesso." };
}
