import { z } from "zod";

/**
 * Spec 01 - schema do login isolado num modulo sem "use server": um
 * arquivo com essa diretiva so pode exportar funcoes async (todo export
 * e tratado como Server Action), entao um objeto Zod exportado dali
 * chega corrompido no client component (loginSchema virava uma
 * referencia de acao, nao o schema real) e o zodResolver falha em
 * runtime com "Invalid input: not a Zod schema".
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
