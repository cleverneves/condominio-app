import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { createMockSupabase, makeProfile } from "@/test/mocks/supabase";
import { expectRedirect } from "@/test/redirect";
import { getSessionProfile, requireAdmin, requireMorador } from "./session";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);

function mockClient(supabase: ReturnType<typeof createMockSupabase>) {
  createClientMock.mockResolvedValue(
    supabase as unknown as Awaited<ReturnType<typeof createClient>>
  );
}

describe("getSessionProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna null quando nao ha usuario autenticado", async () => {
    mockClient(createMockSupabase({ user: null }));
    await expect(getSessionProfile()).resolves.toBeNull();
  });

  it("retorna null quando o perfil nao existe", async () => {
    mockClient(createMockSupabase({ user: { id: "user-1" }, profile: null }));
    await expect(getSessionProfile()).resolves.toBeNull();
  });

  it("retorna null quando a conta esta desativada", async () => {
    mockClient(
      createMockSupabase({
        user: { id: "user-1" },
        profile: makeProfile({ is_active: false }),
      })
    );
    await expect(getSessionProfile()).resolves.toBeNull();
  });

  it("retorna o perfil quando a sessao e a conta estao ativas", async () => {
    const profile = makeProfile({ role: "proprietario" });
    mockClient(createMockSupabase({ user: { id: profile.id }, profile }));
    await expect(getSessionProfile()).resolves.toEqual(profile);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona para logout quando nao ha sessao valida", async () => {
    mockClient(createMockSupabase({ user: null }));
    await expectRedirect(() => requireAdmin(), "/logout?motivo=desativado");
  });

  it("devolve morador autenticado para /ocorrencias", async () => {
    mockClient(
      createMockSupabase({
        user: { id: "morador-1" },
        profile: makeProfile({ id: "morador-1", role: "proprietario" }),
      })
    );
    await expectRedirect(() => requireAdmin(), "/ocorrencias");
  });

  it("retorna o perfil do administrativo", async () => {
    const profile = makeProfile({
      id: "admin-1",
      role: "administrativo",
      bloco: null,
      apartamento: null,
    });
    mockClient(createMockSupabase({ user: { id: profile.id }, profile }));
    await expect(requireAdmin()).resolves.toEqual(profile);
  });
});

describe("requireMorador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona para logout quando nao ha sessao valida", async () => {
    mockClient(createMockSupabase({ user: null }));
    await expectRedirect(() => requireMorador(), "/logout?motivo=desativado");
  });

  it("devolve administrativo autenticado para /dashboard", async () => {
    mockClient(
      createMockSupabase({
        user: { id: "admin-1" },
        profile: makeProfile({
          id: "admin-1",
          role: "administrativo",
          bloco: null,
          apartamento: null,
        }),
      })
    );
    await expectRedirect(() => requireMorador(), "/dashboard");
  });

  it("retorna o perfil do proprietario", async () => {
    const profile = makeProfile({ role: "proprietario" });
    mockClient(createMockSupabase({ user: { id: profile.id }, profile }));
    await expect(requireMorador()).resolves.toEqual(profile);
  });

  it("retorna o perfil do inquilino", async () => {
    const profile = makeProfile({ id: "inq-1", role: "inquilino" });
    mockClient(createMockSupabase({ user: { id: profile.id }, profile }));
    await expect(requireMorador()).resolves.toEqual(profile);
  });
});
