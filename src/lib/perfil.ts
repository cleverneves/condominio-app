import type { Role } from "@/lib/supabase/database.types";

export const ROLE_LABELS: Record<Role, string> = {
  administrativo: "Funcionário administrativo",
  proprietario: "Proprietário",
  inquilino: "Inquilino",
};

/** Regra 2 - proprietario e inquilino sao "morador", com as mesmas permissoes. */
export function isMorador(role: Role): boolean {
  return role === "proprietario" || role === "inquilino";
}

export const NOME_CONDOMINIO =
  process.env.NEXT_PUBLIC_CONDOMINIO_NOME ?? "Residencial";
