import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { createMockSupabase } from "@/test/mocks/supabase";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);

describe("GET /logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encerra a sessao e redireciona para /login", async () => {
    const supabase = createMockSupabase();
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const response = await GET(new Request("http://localhost:3000/logout"));

    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login"
    );
  });

  it("propaga apenas motivo=desativado para /login", async () => {
    const supabase = createMockSupabase();
    createClientMock.mockResolvedValue(
      supabase as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const desativado = await GET(
      new Request("http://localhost:3000/logout?motivo=desativado")
    );
    expect(desativado.headers.get("location")).toBe(
      "http://localhost:3000/login?motivo=desativado"
    );

    const outro = await GET(
      new Request(
        "http://localhost:3000/logout?motivo=x&next=https://evil.example"
      )
    );
    expect(outro.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
