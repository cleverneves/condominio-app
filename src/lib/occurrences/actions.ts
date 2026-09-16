"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, requireAdmin } from "@/lib/auth/session";
import {
  getOcorrenciaDetalhe,
  type OcorrenciaDetalhe,
} from "@/lib/occurrences/queries";
import {
  ADMIN_STATUS_TRANSITIONS,
  OCCURRENCE_CATEGORIES,
  OCCURRENCE_LOCATIONS,
  extensaoDoArquivo,
  moradorPodeCancelar,
  moradorPodeEditar,
  validateOccurrenceImages,
} from "@/lib/ocorrencia";
import type {
  OccurrenceCategory,
  OccurrenceLocation,
  OccurrenceStatus,
} from "@/lib/supabase/database.types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const camposOcorrenciaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Informe um título com pelo menos 3 caracteres.")
    .max(200, "Título muito longo (máximo 200 caracteres)."),
  details: z.string().trim().min(10, "Descreva o que aconteceu."),
  category: z.enum(
    OCCURRENCE_CATEGORIES as [OccurrenceCategory, ...OccurrenceCategory[]],
    {
      message: "Selecione uma categoria.",
    }
  ),
  location: z.enum(
    OCCURRENCE_LOCATIONS as [OccurrenceLocation, ...OccurrenceLocation[]],
    {
      message: "Selecione um local.",
    }
  ),
});

export interface OcorrenciaActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  occurrenceId?: number;
}

function parseCampos(formData: FormData) {
  return camposOcorrenciaSchema.safeParse({
    title: formData.get("title"),
    details: formData.get("details"),
    category: formData.get("category"),
    location: formData.get("location"),
  });
}

function errosDoZod(error: z.ZodError): Record<string, string> {
  const fieldErrors = error.flatten().fieldErrors;
  const errors: Record<string, string> = {};
  for (const key of Object.keys(fieldErrors)) {
    const message = fieldErrors[key as keyof typeof fieldErrors]?.[0];
    if (message) errors[key] = message;
  }
  return errors;
}

function coletarImagens(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((valor): valor is File => valor instanceof File && valor.size > 0);
}

async function enviarImagens(
  supabase: SupabaseServerClient,
  occurrenceId: number,
  files: File[],
  posicoes: number[]
) {
  for (let indice = 0; indice < files.length; indice++) {
    const file = files[indice];
    const position = posicoes[indice];
    const path = `${occurrenceId}/${position}.${extensaoDoArquivo(file.type)}`;

    const { error: uploadError } = await supabase.storage
      .from("ocorrencia-imagens")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) throw new Error("upload_failed");

    const { error: insertError } = await supabase
      .from("occurrence_images")
      .insert({ occurrence_id: occurrenceId, storage_path: path, position });
    if (insertError) throw new Error("insert_failed");
  }
}

/** Spec 04 - abertura de ocorrencia pelo morador (Regra 9: sempre nasce Pendente). */
export async function abrirOcorrenciaAction(
  formData: FormData
): Promise<OcorrenciaActionResult> {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "administrativo") {
    return { success: false, message: "Sem permissão para abrir ocorrência." };
  }

  const parsed = parseCampos(formData);
  if (!parsed.success) {
    return { success: false, errors: errosDoZod(parsed.error) };
  }

  const arquivos = coletarImagens(formData);
  const validacao = validateOccurrenceImages(arquivos);
  if (!validacao.valid) {
    return {
      success: false,
      message: "Envie no máximo 3 imagens JPEG ou PNG de até 5 MB cada.",
    };
  }

  const supabase = await createClient();
  const { data: occurrence, error } = await supabase
    .from("occurrences")
    .insert({
      author_id: profile.id,
      title: parsed.data.title,
      details: parsed.data.details,
      category: parsed.data.category,
      location: parsed.data.location,
      author_bloco: profile.bloco ?? "",
      author_apartamento: profile.apartamento ?? "",
    })
    .select("id")
    .single();

  if (error || !occurrence) {
    return {
      success: false,
      message: "Não foi possível abrir a ocorrência. Tente novamente.",
    };
  }

  if (arquivos.length > 0) {
    try {
      const posicoes = arquivos.map((_, indice) => indice + 1);
      await enviarImagens(supabase, occurrence.id, arquivos, posicoes);
    } catch {
      revalidatePath("/ocorrencias");
      return {
        success: true,
        occurrenceId: occurrence.id,
        message:
          "Ocorrência aberta, mas houve um problema ao enviar as imagens.",
      };
    }
  }

  revalidatePath("/ocorrencias");
  return {
    success: true,
    occurrenceId: occurrence.id,
    message: "Ocorrência aberta com sucesso.",
  };
}

/** Spec 07 - edicao (Regra 11: so o autor, so enquanto Pendente). */
export async function editarOcorrenciaAction(
  formData: FormData
): Promise<OcorrenciaActionResult> {
  const profile = await getSessionProfile();
  if (!profile) return { success: false, message: "Sessão expirada." };

  const idBruto = formData.get("id");
  const id = typeof idBruto === "string" ? Number(idBruto) : NaN;
  if (!Number.isInteger(id)) {
    return { success: false, message: "Ocorrência inválida." };
  }

  const parsed = parseCampos(formData);
  if (!parsed.success) {
    return { success: false, errors: errosDoZod(parsed.error) };
  }

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("occurrences")
    .select("id, author_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!atual || atual.author_id !== profile.id) {
    return { success: false, message: "Ocorrência não encontrada." };
  }
  if (!moradorPodeEditar(atual.status)) {
    return {
      success: false,
      message: "Só é possível editar enquanto a ocorrência está Pendente.",
    };
  }

  const removerIds = formData
    .getAll("removeImageId")
    .map((valor) => Number(valor))
    .filter((valor) => Number.isInteger(valor));

  const { data: imagensAtuais } = await supabase
    .from("occurrence_images")
    .select("id, position, storage_path")
    .eq("occurrence_id", id)
    .order("position", { ascending: true });

  const paraRemover = (imagensAtuais ?? []).filter((imagem) =>
    removerIds.includes(imagem.id)
  );
  const restantes = (imagensAtuais ?? []).filter(
    (imagem) => !removerIds.includes(imagem.id)
  );

  const novosArquivos = coletarImagens(formData);
  if (restantes.length + novosArquivos.length > 3) {
    return {
      success: false,
      message: "A ocorrência pode ter no máximo 3 imagens.",
    };
  }
  const validacao = validateOccurrenceImages(novosArquivos);
  if (!validacao.valid) {
    return {
      success: false,
      message: "Envie no máximo 3 imagens JPEG ou PNG de até 5 MB cada.",
    };
  }

  const { error: updateError } = await supabase
    .from("occurrences")
    .update({
      title: parsed.data.title,
      details: parsed.data.details,
      category: parsed.data.category,
      location: parsed.data.location,
    })
    .eq("id", id);

  if (updateError) {
    return {
      success: false,
      message: "Não foi possível salvar as alterações. Tente novamente.",
    };
  }

  if (paraRemover.length > 0) {
    await supabase.storage
      .from("ocorrencia-imagens")
      .remove(paraRemover.map((imagem) => imagem.storage_path));
    await supabase
      .from("occurrence_images")
      .delete()
      .in(
        "id",
        paraRemover.map((imagem) => imagem.id)
      );
  }

  if (novosArquivos.length > 0) {
    try {
      const posicoesOcupadas = new Set(
        restantes.map((imagem) => imagem.position)
      );
      const posicoesDisponiveis = [1, 2, 3].filter(
        (posicao) => !posicoesOcupadas.has(posicao)
      );
      await enviarImagens(supabase, id, novosArquivos, posicoesDisponiveis);
    } catch {
      revalidatePath(`/ocorrencias/${id}`);
      return {
        success: true,
        occurrenceId: id,
        message:
          "Ocorrência atualizada, mas houve um problema ao enviar as novas imagens.",
      };
    }
  }

  revalidatePath(`/ocorrencias/${id}`);
  revalidatePath("/ocorrencias");
  return { success: true, occurrenceId: id, message: "Ocorrência atualizada." };
}

/** Spec 07 - Regra 10: so o autor cancela, so enquanto Pendente. */
export async function cancelarOcorrenciaAction(
  id: number
): Promise<OcorrenciaActionResult> {
  const profile = await getSessionProfile();
  if (!profile) return { success: false, message: "Sessão expirada." };

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("occurrences")
    .select("author_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!atual || atual.author_id !== profile.id) {
    return { success: false, message: "Ocorrência não encontrada." };
  }
  if (!moradorPodeCancelar(atual.status)) {
    return {
      success: false,
      message: "Só é possível cancelar enquanto a ocorrência está Pendente.",
    };
  }

  const { error } = await supabase
    .from("occurrences")
    .update({ status: "cancelada" })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: "Não foi possível cancelar. Tente novamente.",
    };
  }

  revalidatePath(`/ocorrencias/${id}`);
  revalidatePath("/ocorrencias");
  return { success: true, message: "Ocorrência cancelada." };
}

/** Spec 10 - Regra 16: comentario em qualquer status, autor da ocorrencia ou administrativo. */
export async function comentarOcorrenciaAction(
  occurrenceId: number,
  body: string
): Promise<OcorrenciaActionResult> {
  const profile = await getSessionProfile();
  if (!profile) return { success: false, message: "Sessão expirada." };

  const texto = body.trim();
  if (texto.length < 1) {
    return { success: false, message: "Escreva um comentário." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("occurrence_comments").insert({
    occurrence_id: occurrenceId,
    author_id: profile.id,
    body: texto,
  });

  if (error) {
    return {
      success: false,
      message: "Não foi possível enviar o comentário. Tente novamente.",
    };
  }

  revalidatePath(`/ocorrencias/${occurrenceId}`);
  revalidatePath("/dashboard");
  return { success: true, message: "Comentário enviado." };
}

/**
 * Spec 10 - Regra 16 (revisada, decisao "questiona"): o proprio autor
 * apaga (soft delete) o comentario que escreveu, em qualquer status da
 * ocorrencia, sem janela de tempo. Nunca apaga o de outro - o filtro
 * por author_id abaixo e reforcado pela RLS/trigger da migration 00009.
 */
export async function apagarComentarioAction(
  occurrenceId: number,
  commentId: number
): Promise<OcorrenciaActionResult> {
  const profile = await getSessionProfile();
  if (!profile) return { success: false, message: "Sessão expirada." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("occurrence_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("occurrence_id", occurrenceId)
    .eq("author_id", profile.id)
    .is("deleted_at", null);

  if (error) {
    return {
      success: false,
      message: "Não foi possível apagar o comentário. Tente novamente.",
    };
  }

  revalidatePath(`/ocorrencias/${occurrenceId}`);
  revalidatePath("/dashboard");
  return { success: true, message: "Comentário apagado." };
}

/**
 * Spec 08 - detalhe buscado a partir de um clique na lista (sem navegar
 * de pagina, ja que a gaveta/modal precisa dos dados no cliente). RLS de
 * cada tabela ja restringe o retorno a quem pode ver a ocorrencia.
 */
export async function getOcorrenciaDetalheAction(
  occurrenceId: number
): Promise<OcorrenciaDetalhe | null> {
  return getOcorrenciaDetalhe(occurrenceId);
}

/** Spec 09 - Regra 12: so o administrativo, nas transicoes permitidas. */
export async function mudarStatusOcorrenciaAction(
  occurrenceId: number,
  novoStatus: OccurrenceStatus
): Promise<OcorrenciaActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("occurrences")
    .select("status")
    .eq("id", occurrenceId)
    .maybeSingle();

  if (!atual) return { success: false, message: "Ocorrência não encontrada." };

  if (!ADMIN_STATUS_TRANSITIONS[atual.status].includes(novoStatus)) {
    return {
      success: false,
      message: "Essa transição de status não é permitida.",
    };
  }

  const { error } = await supabase
    .from("occurrences")
    .update({ status: novoStatus })
    .eq("id", occurrenceId);

  if (error) {
    return {
      success: false,
      message: "Não foi possível mudar o status. Tente novamente.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/ocorrencias/${occurrenceId}`);
  return { success: true, message: "Status atualizado." };
}
