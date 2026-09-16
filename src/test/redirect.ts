import { expect } from "vitest";

export async function expectRedirect(
  fn: () => Promise<unknown>,
  url: string
): Promise<void> {
  await expect(fn).rejects.toThrow(`NEXT_REDIRECT:${url}`);
}
