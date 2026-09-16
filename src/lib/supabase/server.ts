import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente Supabase para Server Components, Server Actions e Route
 * Handlers. Usa o cookie store do Next.js para ler/gravar a sessao.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de dentro de um Server Component (sem permissao de
            // escrever cookie): o proxy.ts ja atualiza a sessao a cada
            // requisicao, entao e seguro ignorar aqui.
          }
        },
      },
    }
  );
}
