"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { redefinirSenhaAction } from "../_actions/redefinir-senha";
import type { Morador } from "../_data-access/get-moradores";

const schema = z.object({
  password: z
    .string()
    .min(6, "A nova senha precisa ter pelo menos 6 caracteres."),
});

type FormValues = z.infer<typeof schema>;

/**
 * Spec 03 - Regra 18: sem e-mail de recuperacao. O administrativo digita
 * a nova senha temporaria aqui e informa ao morador por fora do sistema.
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  morador,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  morador?: Morador;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ password: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: FormValues) {
    if (!morador) return;
    const result = await redefinirSenhaAction({
      id: morador.id,
      password: values.password,
    });

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível redefinir a senha.");
      return;
    }

    toast.success(result.message ?? "Senha redefinida com sucesso.");
    onOpenChange(false);
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            {morador
              ? `Defina a nova senha de ${morador.full_name} e informe a ele por fora do sistema.`
              : "Defina a nova senha e informe ao morador por fora do sistema."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
            <Input
              id="new-password"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            {errors.password && (
              <FieldDescription>{errors.password.message}</FieldDescription>
            )}
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Redefinir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
