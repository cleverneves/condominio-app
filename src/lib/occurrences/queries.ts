import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import type { Database, Role } from "@/lib/supabase/database.types";

export type OcorrenciaRow = Database["public"]["Tables"]["occurrences"]["Row"];

export interface AutorResumo {
  full_name: string;
  role: Role;
  bloco: string | null;
  apartamento: string | null;
}

export interface OcorrenciaComAutor extends OcorrenciaRow {
  autor: AutorResumo | null;
}

export interface OcorrenciaImagem {
  id: number;
  position: number;
  url: string;
}

export interface OcorrenciaComentario {
  id: number;
  body: string;
  created_at: string;
  author_id: string;
  autor_nome: string;
  autor_role: Role;
}

export interface OcorrenciaDetalhe extends OcorrenciaRow {
  autor: (AutorResumo & { email: string }) | null;
  imagens: OcorrenciaImagem[];
  comentarios: OcorrenciaComentario[];
}

/**
 * Spec 05 - ocorrencias do morador logado (Regra 8: so as proprias).
 * RLS ja restringe, mas o filtro explicito evita depender so dela.
 */
export async function getMinhasOcorrencias(): Promise<OcorrenciaRow[]> {
  const profile = await getSessionProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occurrences")
    .select("*")
    .eq("author_id", profile.id)
    .order("opened_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar suas ocorrências.");
  }

  return data ?? [];
}

/**
 * Spec 08 - todas as ocorrencias do condominio, com dados do autor
 * (nome, tipo, bloco/apartamento atuais - Regra 17) para o dashboard
 * administrativo. Filtros de status/categoria/bloco sao aplicados no
 * cliente (lista nao vira relatorio - secao 10 do PRD).
 */
export async function getOcorrenciasAdmin(): Promise<OcorrenciaComAutor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("occurrences")
    .select(
      "*, autor:profiles!occurrences_author_id_fkey(full_name, role, bloco, apartamento)"
    )
    .order("opened_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as ocorrências.");
  }

  return (data ?? []) as unknown as OcorrenciaComAutor[];
}

/**
 * Spec 06/08 - detalhe completo de uma ocorrencia: dados, autor, imagens
 * (URL assinada - bucket privado) e comentarios. RLS de cada tabela
 * garante que so quem pode ver a ocorrencia recebe algo aqui.
 */
export async function getOcorrenciaDetalhe(
  id: number
): Promise<OcorrenciaDetalhe | null> {
  const supabase = await createClient();

  const { data: occurrence, error } = await supabase
    .from("occurrences")
    .select(
      "*, autor:profiles!occurrences_author_id_fkey(full_name, role, bloco, apartamento, email)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !occurrence) return null;

  const { data: imagensRaw } = await supabase
    .from("occurrence_images")
    .select("id, position, storage_path")
    .eq("occurrence_id", id)
    .order("position", { ascending: true });

  const imagens: OcorrenciaImagem[] = await Promise.all(
    (imagensRaw ?? []).map(async (img) => {
      const { data: signed } = await supabase.storage
        .from("ocorrencia-imagens")
        .createSignedUrl(img.storage_path, 60 * 10);
      return {
        id: img.id,
        position: img.position,
        url: signed?.signedUrl ?? "",
      };
    })
  );

  const { data: comentariosRaw } = await supabase
    .from("occurrence_comments")
    .select(
      "id, body, created_at, author_id, autor:profiles!occurrence_comments_author_id_fkey(full_name, role)"
    )
    .eq("occurrence_id", id)
    .order("created_at", { ascending: true });

  type ComentarioRaw = {
    id: number;
    body: string;
    created_at: string;
    author_id: string;
    autor: { full_name: string; role: Role } | null;
  };

  const comentarios: OcorrenciaComentario[] = (
    (comentariosRaw ?? []) as unknown as ComentarioRaw[]
  ).map((comentario) => ({
    id: comentario.id,
    body: comentario.body,
    created_at: comentario.created_at,
    author_id: comentario.author_id,
    autor_nome: comentario.autor?.full_name ?? "—",
    autor_role: comentario.autor?.role ?? "proprietario",
  }));

  return {
    ...(occurrence as unknown as OcorrenciaComAutor & {
      autor: (AutorResumo & { email: string }) | null;
    }),
    imagens,
    comentarios,
  };
}
