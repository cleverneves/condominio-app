import type {
  OccurrenceCategory,
  OccurrenceLocation,
  OccurrenceStatus,
} from "@/lib/supabase/database.types";

/** Regra 13 - categorias fixas (nao cadastraveis). */
export const OCCURRENCE_CATEGORIES: readonly OccurrenceCategory[] = [
  "reclamacao",
  "obra",
  "importunacao",
  "hidraulica",
  "eletrica",
];

export const OCCURRENCE_CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  reclamacao: "Reclamação",
  obra: "Obra",
  importunacao: "Importunação",
  hidraulica: "Hidráulica",
  eletrica: "Elétrica",
};

/** Regra 14 - locais fixos (nao cadastraveis). */
export const OCCURRENCE_LOCATIONS: readonly OccurrenceLocation[] = [
  "apartamento",
  "area_comum",
  "praca",
  "garagem",
  "portaria",
];

export const OCCURRENCE_LOCATION_LABELS: Record<OccurrenceLocation, string> = {
  apartamento: "Apartamento",
  area_comum: "Área comum",
  praca: "Praça",
  garagem: "Garagem",
  portaria: "Portaria",
};

/** Regra 9 - os quatro (e somente quatro) status do produto. */
export const OCCURRENCE_STATUSES: readonly OccurrenceStatus[] = [
  "pendente",
  "em_andamento",
  "resolvida",
  "cancelada",
];

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  resolvida: "Resolvida",
  cancelada: "Cancelada",
};

/**
 * Regra 12 - transicoes permitidas ao administrativo a partir do status
 * atual. Resolvida/Cancelada: lista vazia (nao oferece nada).
 */
export const ADMIN_STATUS_TRANSITIONS: Record<
  OccurrenceStatus,
  OccurrenceStatus[]
> = {
  pendente: ["em_andamento", "resolvida", "cancelada"],
  em_andamento: ["resolvida", "cancelada"],
  resolvida: [],
  cancelada: [],
};

/** Regra 10/11 - o autor so edita/cancela a propria ocorrencia Pendente. */
export function moradorPodeEditar(status: OccurrenceStatus): boolean {
  return status === "pendente";
}

export function moradorPodeCancelar(status: OccurrenceStatus): boolean {
  return status === "pendente";
}

/** Regra 15 - imagens: JPEG/PNG, at\u00e9 5 MB, no maximo 3 por ocorrencia. */
export const MAX_OCCURRENCE_IMAGES = 3;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export interface ImageValidationError {
  file: string;
  reason: "tipo" | "tamanho";
}

/**
 * Valida um conjunto de imagens contra a Regra 15. Nao falha silenciosamente:
 * retorna a lista de arquivos recusados e o motivo de cada um.
 */
export function validateOccurrenceImages(files: File[]): {
  valid: boolean;
  errors: ImageValidationError[];
} {
  const errors: ImageValidationError[] = [];

  if (files.length > MAX_OCCURRENCE_IMAGES) {
    return {
      valid: false,
      errors: files
        .slice(MAX_OCCURRENCE_IMAGES)
        .map((file) => ({ file: file.name, reason: "tamanho" as const })),
    };
  }

  for (const file of files) {
    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
      )
    ) {
      errors.push({ file: file.name, reason: "tipo" });
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push({ file: file.name, reason: "tamanho" });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function extensaoDoArquivo(mimeType: string): "jpg" | "png" {
  return mimeType === "image/png" ? "png" : "jpg";
}
