import { z } from "zod";

/**
 * Schema isolado do arquivo "use server": Next.js so permite exportar
 * funcoes async dali. Exportar o objeto Zod no mesmo modulo derruba a
 * Server Action em runtime (igual ao login-schema.ts).
 */
export const redefinirSenhaSchema = z.object({
  id: z.string().uuid(),
  password: z
    .string()
    .min(6, "A nova senha precisa ter pelo menos 6 caracteres."),
});

export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
