import { vi } from "vitest";
import type { Profile } from "@/lib/auth/session";

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    role: "proprietario",
    full_name: "Ana Silva",
    email: "ana@example.com",
    phone: "11999999999",
    bloco: "A",
    apartamento: "101",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export interface MockSupabaseOptions {
  user?: { id: string } | null;
  signInUser?: { id: string } | null;
  signInError?: { message: string } | null;
  profile?: Pick<Profile, "role" | "is_active"> | Profile | null;
}

export function createMockSupabase(options: MockSupabaseOptions = {}) {
  const signInWithPassword = vi.fn(async () => ({
    data: { user: options.signInUser ?? null },
    error: options.signInError ?? null,
  }));
  const signOut = vi.fn(async () => ({ error: null }));
  const getUser = vi.fn(async () => ({
    data: { user: options.user ?? null },
    error: null,
  }));
  const maybeSingle = vi.fn(async () => ({
    data: options.profile ?? null,
    error: null,
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    auth: { signInWithPassword, signOut, getUser },
    from,
  };
}

export const CREDENCIAIS_VALIDAS = {
  email: "ana@example.com",
  password: "secret12",
};
