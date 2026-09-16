"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SendIcon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatarDataHora } from "@/lib/formatters";
import {
  apagarComentarioAction,
  comentarOcorrenciaAction,
} from "@/lib/occurrences/actions";
import type { OcorrenciaComentario } from "@/lib/occurrences/queries";

/**
 * Spec 10 - Regra 16 (revisada): comentarios em qualquer status, sem
 * edicao; o proprio autor pode apagar (soft delete) o que escreveu.
 * Compartilhado entre a area do morador (detalhe da propria ocorrencia)
 * e a gaveta de detalhe do administrativo (Spec 08/09).
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
  const [apagandoId, setApagandoId] = useState<number | null>(null);

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

  async function apagarComentario(commentId: number) {
    setApagandoId(commentId);
    const result = await apagarComentarioAction(occurrenceId, commentId);
    setApagandoId(null);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível apagar o comentário.");
      return;
    }

    toast.success(result.message ?? "Comentário apagado.");
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
          comentarios.map((comentario) => {
            const ehAutor = comentario.author_id === currentUserId;
            const apagado = comentario.deleted_at !== null;

            return (
              <div
                key={comentario.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-label-sm text-foreground">
                    {comentario.autor_nome}
                    {ehAutor && " (você)"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatarDataHora(comentario.created_at)}
                    </span>
                    {ehAutor && !apagado && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Apagar comentário"
                            disabled={apagandoId === comentario.id}
                          >
                            <Trash2Icon />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Apagar comentário
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. O comentário será
                              removido e não poderá ser recuperado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={apagandoId === comentario.id}
                              onClick={(event) => {
                                event.preventDefault();
                                apagarComentario(comentario.id);
                              }}
                            >
                              {apagandoId === comentario.id
                                ? "Apagando..."
                                : "Apagar comentário"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                {apagado ? (
                  <p className="text-body-sm italic text-muted-foreground">
                    Comentário removido.
                  </p>
                ) : (
                  <p className="text-body-sm whitespace-pre-wrap text-foreground">
                    {comentario.body}
                  </p>
                )}
              </div>
            );
          })
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
