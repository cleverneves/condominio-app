import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { CREDENCIAIS_VALIDAS, createMockSupabase } from "@/test/mocks/supabase";
import { expectRedirect } from "@/test/redirect";
import { loginAction } from "./login";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);

const MENSAGEM_CREDENCIAIS_INVALIDAS =
  "E-mail ou senha incorretos. Verifique e tente novamente.";
const MENSAGEM_CONTA_DESATIVADA =
  "Acesso desativado. Fale com a administração do condomínio.";

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona administrativo ativo para /dashboard e nao chama signOut", async () => {
    const supabase = createMockSupabase({
      signInUser: { id: "admin-1" },
      profile: { role: "administrativo", is_active: true },
    });
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expectRedirect(() => loginAction(CREDENCIAIS_VALIDAS), "/dashboard");
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("redireciona proprietario ativo para /ocorrencias", async () => {
    const supabase = createMockSupabase({
      signInUser: { id: "morador-1" },
      profile: { role: "proprietario", is_active: true },
    });
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expectRedirect(
      () => loginAction(CREDENCIAIS_VALIDAS),
      "/ocorrencias"
    );
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("redireciona inquilino ativo para /ocorrencias", async () => {
    const supabase = createMockSupabase({
      signInUser: { id: "morador-2" },
      profile: { role: "inquilino", is_active: true },
    });
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expectRedirect(
      () => loginAction(CREDENCIAIS_VALIDAS),
      "/ocorrencias"
    );
  });

  it("recusa conta desativada, informa exatamente isso e encerra a sessao", async () => {
    const supabase = createMockSupabase({
      signInUser: { id: "morador-1" },
      profile: { role: "proprietario", is_active: false },
    });
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(loginAction(CREDENCIAIS_VALIDAS)).resolves.toEqual({
      error: MENSAGEM_CONTA_DESATIVADA,
    });
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("recusa usuario autenticado sem perfil com mensagem generica e signOut", async () => {
    const supabase = createMockSupabase({
      signInUser: { id: "orfao-1" },
      profile: null,
    });
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(loginAction(CREDENCIAIS_VALIDAS)).resolves.toEqual({
      error: MENSAGEM_CREDENCIAIS_INVALIDAS,
    });
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("usa a mesma mensagem generica para senha errada e para erro inesperado do Auth", async () => {
    const senhaErrada = createMockSupabase({
      signInError: { message: "Invalid login credentials" },
    });
    createClientMock.mockResolvedValue(
      senhaErrada as unknown as Awaited<ReturnType<typeof createClient>>
    );
    const resultadoSenha = await loginAction(CREDENCIAIS_VALIDAS);

    const erroServico = createMockSupabase({
      signInError: { message: "Too many requests" },
    });
    createClientMock.mockResolvedValue(
      erroServico as unknown as Awaited<ReturnType<typeof createClient>>
    );
    const resultadoServico = await loginAction(CREDENCIAIS_VALIDAS);

    expect(resultadoSenha.error).toBe(MENSAGEM_CREDENCIAIS_INVALIDAS);
    expect(resultadoServico.error).toBe(MENSAGEM_CREDENCIAIS_INVALIDAS);
    expect(senhaErrada.auth.signOut).not.toHaveBeenCalled();
    expect(erroServico.auth.signOut).not.toHaveBeenCalled();
  });
});
