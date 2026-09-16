"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/status-badge";
import { OccurrenceComments } from "@/components/occurrence-comments";
import { formatarDataHora } from "@/lib/formatters";
import {
  ADMIN_STATUS_TRANSITIONS,
  OCCURRENCE_CATEGORY_LABELS,
  OCCURRENCE_LOCATION_LABELS,
  OCCURRENCE_STATUS_LABELS,
} from "@/lib/ocorrencia";
import { ROLE_LABELS } from "@/lib/perfil";
import {
  getOcorrenciaDetalheAction,
  mudarStatusOcorrenciaAction,
} from "@/lib/occurrences/actions";
import type { OcorrenciaDetalhe } from "@/lib/occurrences/queries";
import type { OccurrenceStatus } from "@/lib/supabase/database.types";

function iniciaisDoNome(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Spec 08/09 - gaveta de detalhe da ocorrencia (nivel 3, overlay escuro
 * suave), aberta a partir de um clique na fila do dashboard. Busca o
 * detalhe no cliente (sem navegar de pagina) e permite ao administrativo
 * mudar o status nas transicoes permitidas (Regra 12) e comentar.
 */
export function OcorrenciaDetalheSheet({
  occurrenceId,
  open,
  onOpenChange,
  adminId,
}: {
  occurrenceId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminId: string;
}) {
  const [detalhe, setDetalhe] = useState<OcorrenciaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState(false);

  useEffect(() => {
    if (!open || !occurrenceId) {
      setDetalhe(null);
      return;
    }

    let ativo = true;
    setCarregando(true);
    getOcorrenciaDetalheAction(occurrenceId).then((resultado) => {
      if (ativo) {
        setDetalhe(resultado);
        setCarregando(false);
      }
    });
    return () => {
      ativo = false;
    };
  }, [open, occurrenceId]);

  async function atualizarStatus(status: OccurrenceStatus) {
    if (!detalhe) return;
    setMudandoStatus(true);
    const result = await mudarStatusOcorrenciaAction(detalhe.id, status);
    setMudandoStatus(false);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível mudar o status.");
      return;
    }

    toast.success(result.message ?? "Status atualizado.");
    setDetalhe((atual) => (atual ? { ...atual, status } : atual));
  }

  const transicoes = detalhe ? ADMIN_STATUS_TRANSITIONS[detalhe.status] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {carregando && (
          <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        )}

        {!carregando && detalhe && (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3 pr-8">
                <SheetTitle className="text-headline-sm">
                  {detalhe.title}
                </SheetTitle>
                <StatusBadge status={detalhe.status} />
              </div>
              <SheetDescription>
                {OCCURRENCE_CATEGORY_LABELS[detalhe.category]} ·{" "}
                {OCCURRENCE_LOCATION_LABELS[detalhe.location]} · Aberta em{" "}
                {formatarDataHora(detalhe.opened_at)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {detalhe.autor
                      ? iniciaisDoNome(detalhe.autor.full_name)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-label-lg text-foreground">
                    {detalhe.autor?.full_name ?? "Morador"}
                  </span>
                  <span className="truncate text-body-sm text-muted-foreground">
                    Bloco {detalhe.author_bloco} · Apto{" "}
                    {detalhe.author_apartamento} ·{" "}
                    {detalhe.autor ? ROLE_LABELS[detalhe.autor.role] : ""}
                  </span>
                </div>
              </div>

              <p className="text-body-md whitespace-pre-wrap text-foreground">
                {detalhe.details}
              </p>

              {detalhe.imagens.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {detalhe.imagens.map((imagem) => (
                    <a
                      key={imagem.id}
                      href={imagem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block size-20 shrink-0 overflow-hidden rounded-lg border border-border"
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

              {transicoes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-label-sm text-muted-foreground">
                    Mudar status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {transicoes.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant="outline"
                        disabled={mudandoStatus}
                        onClick={() => atualizarStatus(status)}
                      >
                        {OCCURRENCE_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <OccurrenceComments
                occurrenceId={detalhe.id}
                comentarios={detalhe.comentarios}
                currentUserId={adminId}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
