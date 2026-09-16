"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction } from "../_actions/login";
import { loginSchema, type LoginInput } from "../_actions/login-schema";

export function LoginForm({ mensagemInicial }: { mensagemInicial?: string }) {
  const [serverError, setServerError] = useState<string | undefined>(
    mensagemInicial
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      {serverError && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={!!emailError || undefined}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={!!emailError}
            {...form.register("email")}
          />
          {emailError && <FieldDescription>{emailError}</FieldDescription>}
        </Field>

        <Field data-invalid={!!passwordError || undefined}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            {...form.register("password")}
          />
          {passwordError && (
            <FieldDescription>{passwordError}</FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-body-sm text-center text-muted-foreground">
        Esqueceu a senha? Procure a administração do condomínio — o sistema não
        envia e-mail de recuperação.
      </p>
    </form>
  );
}
