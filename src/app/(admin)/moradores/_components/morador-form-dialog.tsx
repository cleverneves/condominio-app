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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { criarMoradorAction } from "../_actions/criar-morador";
import { atualizarMoradorAction } from "../_actions/atualizar-morador";
import type { Morador } from "../_data-access/get-moradores";

function buildFormSchema(mode: "create" | "edit") {
  return z.object({
    role: z.enum(["proprietario", "inquilino"], {
      message: "Selecione o tipo do morador.",
    }),
    full_name: z.string().trim().min(3, "Informe o nome completo."),
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail.")
      .email("Informe um e-mail válido."),
    phone: z.string().trim().min(8, "Informe um telefone válido."),
    bloco: z.string().trim().min(1, "Informe o bloco."),
    apartamento: z.string().trim().min(1, "Informe o apartamento."),
    password:
      mode === "create"
        ? z
            .string()
            .min(6, "A senha temporária precisa ter pelo menos 6 caracteres.")
        : z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

function valoresIniciais(morador?: Morador): FormValues {
  return {
    role: morador?.role === "inquilino" ? "inquilino" : "proprietario",
    full_name: morador?.full_name ?? "",
    email: morador?.email ?? "",
    phone: morador?.phone ?? "",
    bloco: morador?.bloco ?? "",
    apartamento: morador?.apartamento ?? "",
    password: "",
  };
}

/**
 * Spec 02/03 - formulario de cadastro/edicao de morador, em modal
 * (nivel 3, sombra `shadow-elevation-3` do Dialog). O tipo (proprietario |
 * inquilino) usa o mesmo toggle-group do resto do produto.
 */
export function MoradorFormDialog({
  open,
  onOpenChange,
  mode,
  morador,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  morador?: Morador;
}) {
  const schema = buildFormSchema(mode);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(morador),
  });

  useEffect(() => {
    if (open) {
      form.reset(valoresIniciais(morador));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, morador]);

  async function onSubmit(values: FormValues) {
    const result =
      mode === "create"
        ? await criarMoradorAction({
            ...values,
            password: values.password ?? "",
          })
        : await atualizarMoradorAction({ ...values, id: morador!.id });

    if (!result.success) {
      if (result.errors) {
        for (const [field, message] of Object.entries(result.errors)) {
          if (message) {
            form.setError(field as keyof FormValues, { message });
          }
        }
      }
      toast.error(
        result.message ?? "Não foi possível salvar. Tente novamente."
      );
      return;
    }

    toast.success(result.message ?? "Feito.");
    onOpenChange(false);
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo morador" : "Editar morador"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Defina uma senha temporária e informe ao morador por fora do sistema."
              : "Atualize os dados cadastrais do morador."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={0}
                value={form.watch("role")}
                onValueChange={(value) => {
                  if (value) {
                    form.setValue(
                      "role",
                      value as "proprietario" | "inquilino"
                    );
                  }
                }}
                className="w-full"
              >
                <ToggleGroupItem value="proprietario" className="flex-1">
                  Proprietário
                </ToggleGroupItem>
                <ToggleGroupItem value="inquilino" className="flex-1">
                  Inquilino
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            <Field data-invalid={!!errors.full_name || undefined}>
              <FieldLabel htmlFor="full_name">Nome completo</FieldLabel>
              <Input
                id="full_name"
                aria-invalid={!!errors.full_name}
                {...form.register("full_name")}
              />
              {errors.full_name && (
                <FieldDescription>{errors.full_name.message}</FieldDescription>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.bloco || undefined}>
                <FieldLabel htmlFor="bloco">Bloco</FieldLabel>
                <Input
                  id="bloco"
                  aria-invalid={!!errors.bloco}
                  {...form.register("bloco")}
                />
                {errors.bloco && (
                  <FieldDescription>{errors.bloco.message}</FieldDescription>
                )}
              </Field>
              <Field data-invalid={!!errors.apartamento || undefined}>
                <FieldLabel htmlFor="apartamento">Apartamento</FieldLabel>
                <Input
                  id="apartamento"
                  aria-invalid={!!errors.apartamento}
                  {...form.register("apartamento")}
                />
                {errors.apartamento && (
                  <FieldDescription>
                    {errors.apartamento.message}
                  </FieldDescription>
                )}
              </Field>
            </div>

            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              {errors.email && (
                <FieldDescription>{errors.email.message}</FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.phone || undefined}>
              <FieldLabel htmlFor="phone">Telefone</FieldLabel>
              <Input
                id="phone"
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              {errors.phone && (
                <FieldDescription>{errors.phone.message}</FieldDescription>
              )}
            </Field>

            {mode === "create" && (
              <Field data-invalid={!!errors.password || undefined}>
                <FieldLabel htmlFor="password">Senha temporária</FieldLabel>
                <Input
                  id="password"
                  type="text"
                  autoComplete="off"
                  aria-invalid={!!errors.password}
                  {...form.register("password")}
                />
                {errors.password ? (
                  <FieldDescription>{errors.password.message}</FieldDescription>
                ) : (
                  <FieldDescription>
                    Informe essa senha ao morador por fora do sistema.
                  </FieldDescription>
                )}
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
