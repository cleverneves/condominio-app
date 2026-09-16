"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_OCCURRENCE_IMAGES,
  OCCURRENCE_CATEGORIES,
  OCCURRENCE_CATEGORY_LABELS,
  OCCURRENCE_LOCATIONS,
  OCCURRENCE_LOCATION_LABELS,
  validateOccurrenceImages,
} from "@/lib/ocorrencia";
import type {
  OccurrenceCategory,
  OccurrenceLocation,
} from "@/lib/supabase/database.types";
import {
  abrirOcorrenciaAction,
  editarOcorrenciaAction,
} from "@/lib/occurrences/actions";
import type { OcorrenciaImagem } from "@/lib/occurrences/queries";

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Informe um título com pelo menos 3 caracteres.")
    .max(200, "Título muito longo (máximo 200 caracteres)."),
  details: z.string().trim().min(10, "Descreva o que aconteceu."),
  category: z.enum(
    OCCURRENCE_CATEGORIES as [OccurrenceCategory, ...OccurrenceCategory[]],
    { message: "Selecione uma categoria." }
  ),
  location: z.enum(
    OCCURRENCE_LOCATIONS as [OccurrenceLocation, ...OccurrenceLocation[]],
    { message: "Selecione um local." }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface OcorrenciaFormProps {
  mode: "create" | "edit";
  ocorrenciaId?: number;
  valoresIniciais?: Partial<FormValues>;
  imagensExistentes?: OcorrenciaImagem[];
}

/**
 * Spec 04/07 - formulario de abertura/edicao de ocorrencia: titulo,
 * detalhes, categoria, local e ate 3 imagens (Regra 13/14/15). Reutilizado
 * pelas rotas /ocorrencias/nova e /ocorrencias/[id] (editar).
 */
export function OcorrenciaForm({
  mode,
  ocorrenciaId,
  valoresIniciais,
  imagensExistentes = [],
}: OcorrenciaFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [novosArquivos, setNovosArquivos] = useState<File[]>([]);
  const [imagensRemovidas, setImagensRemovidas] = useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: valoresIniciais?.title ?? "",
      details: valoresIniciais?.details ?? "",
      category: valoresIniciais?.category,
      location: valoresIniciais?.location,
    },
  });

  const imagensVisiveis = imagensExistentes.filter(
    (imagem) => !imagensRemovidas.includes(imagem.id)
  );
  const totalImagens = imagensVisiveis.length + novosArquivos.length;

  function adicionarArquivos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    const novos = Array.from(lista);
    const combinados = [...novosArquivos, ...novos];

    if (imagensVisiveis.length + combinados.length > MAX_OCCURRENCE_IMAGES) {
      toast.error(`Você pode ter no máximo ${MAX_OCCURRENCE_IMAGES} imagens.`);
      return;
    }

    const validacao = validateOccurrenceImages(combinados);
    if (!validacao.valid) {
      toast.error("Envie apenas imagens JPEG ou PNG de até 5 MB cada.");
      return;
    }

    setNovosArquivos(combinados);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removerNovoArquivo(indice: number) {
    setNovosArquivos((atual) => atual.filter((_, i) => i !== indice));
  }

  function removerImagemExistente(id: number) {
    setImagensRemovidas((atual) => [...atual, id]);
  }

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("details", values.details);
    formData.set("category", values.category);
    formData.set("location", values.location);
    if (mode === "edit" && ocorrenciaId) {
      formData.set("id", String(ocorrenciaId));
    }
    for (const file of novosArquivos) {
      formData.append("images", file);
    }
    for (const id of imagensRemovidas) {
      formData.append("removeImageId", String(id));
    }

    const result =
      mode === "create"
        ? await abrirOcorrenciaAction(formData)
        : await editarOcorrenciaAction(formData);

    if (!result.success) {
      if (result.errors) {
        for (const [field, message] of Object.entries(result.errors)) {
          form.setError(field as keyof FormValues, { message });
        }
      }
      if (result.message) toast.error(result.message);
      return;
    }

    toast.success(result.message ?? "Feito.");
    router.push(`/ocorrencias/${result.occurrenceId ?? ocorrenciaId}`);
  }

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.title || undefined}>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input
            id="title"
            placeholder="Ex.: Vazamento no corredor do 3º andar"
            aria-invalid={!!errors.title}
            {...form.register("title")}
          />
          {errors.title && (
            <FieldDescription>{errors.title.message}</FieldDescription>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.category || undefined}>
            <FieldLabel>Categoria</FieldLabel>
            <Select
              value={form.watch("category")}
              onValueChange={(value) =>
                form.setValue("category", value as OccurrenceCategory, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-invalid={!!errors.category}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {OCCURRENCE_CATEGORIES.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {OCCURRENCE_CATEGORY_LABELS[categoria]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <FieldDescription>{errors.category.message}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.location || undefined}>
            <FieldLabel>Local</FieldLabel>
            <Select
              value={form.watch("location")}
              onValueChange={(value) =>
                form.setValue("location", value as OccurrenceLocation, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-invalid={!!errors.location}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {OCCURRENCE_LOCATIONS.map((local) => (
                  <SelectItem key={local} value={local}>
                    {OCCURRENCE_LOCATION_LABELS[local]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <FieldDescription>{errors.location.message}</FieldDescription>
            )}
          </Field>
        </div>

        <Field data-invalid={!!errors.details || undefined}>
          <FieldLabel htmlFor="details">Detalhes</FieldLabel>
          <Textarea
            id="details"
            rows={5}
            placeholder="Descreva o que aconteceu, quando notou e outros detalhes úteis."
            aria-invalid={!!errors.details}
            {...form.register("details")}
          />
          {errors.details && (
            <FieldDescription>{errors.details.message}</FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel>Imagens (opcional)</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {imagensVisiveis.map((imagem) => (
              <div
                key={imagem.id}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagem.url}
                  alt="Imagem da ocorrência"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removerImagemExistente(imagem.id)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}

            {novosArquivos.map((file, indice) => (
              <div
                key={`${file.name}-${indice}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removerNovoArquivo(indice)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}

            {totalImagens < MAX_OCCURRENCE_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted/50"
              >
                <ImagePlusIcon className="size-5" />
                <span className="text-xs">Adicionar</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(event) => adicionarArquivos(event.target.files)}
          />
          <FieldDescription>
            JPEG ou PNG, até 5 MB cada, no máximo {MAX_OCCURRENCE_IMAGES}{" "}
            imagens.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Card className="flex-row items-center justify-end gap-2 border-none bg-transparent p-0 shadow-none">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Abrir ocorrência"
              : "Salvar alterações"}
        </Button>
      </Card>
    </form>
  );
}
