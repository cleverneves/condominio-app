import { z } from "zod";

/**
 * Schema isolado do arquivo "use server": Next.js so permite exportar
 * funcoes async dali. Exportar o objeto Zod no mesmo modulo derruba a
 * Server Action em runtime (igual ao login-schema.ts).
 */
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
