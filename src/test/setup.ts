import { vi } from "vitest";

/**
 * Lote /login: unitario com mock. Fora deste lote (sem E2E, sem UI, sem
 * banco): cookie renovado de ponta a ponta, JWT residual apos desativar, RLS.
 */

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
