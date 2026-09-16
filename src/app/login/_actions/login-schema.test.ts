import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginSchema } from "./login-schema";

describe("loginSchema", () => {
  it("e um schema Zod real (nao uma referencia de Server Action)", () => {
    expect(loginSchema).toBeInstanceOf(z.ZodObject);
    expect(
      loginSchema.safeParse({
        email: "ana@example.com",
        password: "secret12",
      }).success
    ).toBe(true);
  });
});
