import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const getUser = vi.fn();
const createServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => createServerClient(...args),
}));

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    createServerClient.mockImplementation(
      (
        _url: string,
        _key: string,
        options: {
          cookies: {
            setAll: (
              cookies: {
                name: string;
                value: string;
                options?: Record<string, unknown>;
              }[]
            ) => void;
          };
        }
      ) => ({
        auth: {
          getUser: async () => {
            await options.cookies.setAll?.([]);
            return getUser();
          },
        },
      })
    );
  });

  it("redireciona rota interna sem sessao para /login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    for (const path of ["/dashboard", "/ocorrencias"]) {
      const response = await proxy(makeRequest(path));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    }
  });

  it("deixa passar /login e /logout sem sessao", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    for (const path of ["/login", "/logout"]) {
      const response = await proxy(makeRequest(path));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("redireciona usuario autenticado de /login para /", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await proxy(makeRequest("/login"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("deixa passar rota interna com sessao", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await proxy(makeRequest("/dashboard"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("grava cookies renovados na response devolvida", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    createServerClient.mockImplementation(
      (
        _url: string,
        _key: string,
        options: {
          cookies: {
            setAll: (
              cookies: {
                name: string;
                value: string;
                options?: { path?: string };
              }[]
            ) => void;
          };
        }
      ) => ({
        auth: {
          getUser: async () => {
            options.cookies.setAll([
              {
                name: "sb-access-token",
                value: "token-renovado",
                options: { path: "/" },
              },
            ]);
            return { data: { user: { id: "user-1" } } };
          },
        },
      })
    );

    const response = await proxy(makeRequest("/dashboard"));
    expect(response.cookies.get("sb-access-token")?.value).toBe(
      "token-renovado"
    );
  });
});
