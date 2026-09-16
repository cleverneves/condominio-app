import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { OccurrenceComments } from "@/components/occurrence-comments";
import { getSessionProfile } from "@/lib/auth/session";
import { formatarDataHora } from "@/lib/formatters";
import {
  OCCURRENCE_CATEGORY_LABELS,
  OCCURRENCE_LOCATION_LABELS,
} from "@/lib/ocorrencia";
import { getOcorrenciaDetalhe } from "@/lib/occurrences/queries";
import { OcorrenciaAcoes } from "./_components/ocorrencia-acoes";

/** Spec 06 - detalhe da ocorrencia do morador (Regra 8: so a propria). */
export default async function DetalheOcorrenciaPage(
  props: PageProps<"/ocorrencias/[id]">
) {
  const { id } = await props.params;
  const occurrenceId = Number(id);
  if (!Number.isInteger(occurrenceId)) notFound();

  const profile = await getSessionProfile();
  if (!profile) notFound();

  const ocorrencia = await getOcorrenciaDetalhe(occurrenceId);
  if (!ocorrencia || ocorrencia.author_id !== profile.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-headline-lg text-foreground">
            {ocorrencia.title}
          </h1>
          <StatusBadge status={ocorrencia.status} className="mt-1" />
        </div>
        <p className="text-body-sm text-muted-foreground">
          {OCCURRENCE_CATEGORY_LABELS[ocorrencia.category]} ·{" "}
          {OCCURRENCE_LOCATION_LABELS[ocorrencia.location]} · Aberta em{" "}
          {formatarDataHora(ocorrencia.opened_at)}
        </p>
      </div>

      <Card className="p-4">
        <p className="text-body-md whitespace-pre-wrap text-foreground">
          {ocorrencia.details}
        </p>
      </Card>

      {ocorrencia.imagens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {ocorrencia.imagens.map((imagem) => (
            <a
              key={imagem.id}
              href={imagem.url}
              target="_blank"
              rel="noreferrer"
              className="block size-24 shrink-0 overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagem.url}
                alt="Imagem da ocorrência"
                className="size-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <OcorrenciaAcoes
        occurrenceId={ocorrencia.id}
        status={ocorrencia.status}
      />

      <Separator />

      <OccurrenceComments
        occurrenceId={ocorrencia.id}
        comentarios={ocorrencia.comentarios}
        currentUserId={profile.id}
      />
    </div>
  );
}
