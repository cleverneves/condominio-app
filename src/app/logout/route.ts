import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Spec 01 - encerra a sessao (rota, nao Server Component: e a unica forma
 * de mutar o cookie fora de uma Server Action) e volta ao login. Tambem
 * serve de rede de seguranca quando a sessao existe mas o perfil nao e
 * mais valido (desativado/apagado), evitando loop entre "/" e /login.
 */
async function signOutAndRedirect(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const motivo = url.searchParams.get("motivo");
  const loginUrl = new URL("/login", request.url);
  if (motivo === "desativado") {
    loginUrl.searchParams.set("motivo", "desativado");
  }

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}
