import { z } from "zod";

/**
 * Schema isolado do arquivo "use server": Next.js so permite exportar
 * funcoes async dali. Exportar o objeto Zod no mesmo modulo derruba a
 * Server Action em runtime (igual ao login-schema.ts).
 */
export const atualizarMoradorSchema = z.object({
  id: z.string().uuid(),
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
});

export type AtualizarMoradorInput = z.infer<typeof atualizarMoradorSchema>;
