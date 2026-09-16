import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionProfile } from "@/lib/auth/session";
import { makeProfile } from "@/test/mocks/supabase";
import { expectRedirect } from "@/test/redirect";
import RootPage from "./page";

vi.mock("@/lib/auth/session", () => ({
  getSessionProfile: vi.fn(),
}));

const getSessionProfileMock = vi.mocked(getSessionProfile);

describe("RootPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona sessao invalida para /logout?motivo=desativado", async () => {
    getSessionProfileMock.mockResolvedValue(null);
    await expectRedirect(() => RootPage(), "/logout?motivo=desativado");
  });

  it("redireciona administrativo para /dashboard", async () => {
    getSessionProfileMock.mockResolvedValue(
      makeProfile({
        role: "administrativo",
        bloco: null,
        apartamento: null,
      })
    );
    await expectRedirect(() => RootPage(), "/dashboard");
  });

  it("redireciona morador para /ocorrencias", async () => {
    getSessionProfileMock.mockResolvedValue(makeProfile({ role: "inquilino" }));
    await expectRedirect(() => RootPage(), "/ocorrencias");
  });
});
