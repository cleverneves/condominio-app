"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatarDataHora } from "@/lib/formatters";
import { comentarOcorrenciaAction } from "@/lib/occurrences/actions";
import type { OcorrenciaComentario } from "@/lib/occurrences/queries";

/**
 * Spec 10 - Regra 16: comentarios em qualquer status, imutaveis depois
 * de enviados. Compartilhado entre a area do morador (detalhe da propria
 * ocorrencia) e a gaveta de detalhe do administrativo (Spec 08/09).
 */
export function OccurrenceComments({
  occurrenceId,
  comentarios,
  currentUserId,
}: {
  occurrenceId: number;
  comentarios: OcorrenciaComentario[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarComentario() {
    const corpo = texto.trim();
    if (!corpo) return;

    setEnviando(true);
    const result = await comentarOcorrenciaAction(occurrenceId, corpo);
    setEnviando(false);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível enviar o comentário.");
      return;
    }

    setTexto("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-label-lg text-foreground">
        Comentários {comentarios.length > 0 && `(${comentarios.length})`}
      </h2>

      <div className="flex flex-col gap-3">
        {comentarios.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">
            Nenhum comentário ainda.
          </p>
        ) : (
          comentarios.map((comentario) => (
            <div
              key={comentario.id}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-label-sm text-foreground">
                  {comentario.autor_nome}
                  {comentario.author_id === currentUserId && " (você)"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatarDataHora(comentario.created_at)}
                </span>
              </div>
              <p className="text-body-sm whitespace-pre-wrap text-foreground">
                {comentario.body}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
        />
        <Button
          onClick={enviarComentario}
          disabled={enviando || !texto.trim()}
          className="self-end"
        >
          <SendIcon />
          {enviando ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </div>
  );
}
