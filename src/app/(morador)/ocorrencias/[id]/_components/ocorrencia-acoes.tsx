"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon, XIcon } from "lucide-react";

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
import { moradorPodeCancelar, moradorPodeEditar } from "@/lib/ocorrencia";
import { cancelarOcorrenciaAction } from "@/lib/occurrences/actions";
import type { OccurrenceStatus } from "@/lib/supabase/database.types";

/**
 * Spec 07 - Regra 10/11: editar e cancelar so aparecem enquanto a
 * ocorrencia esta Pendente, e so para o proprio autor (a pagina que usa
 * este componente ja garante isso ao carregar o detalhe).
 */
export function OcorrenciaAcoes({
  occurrenceId,
  status,
}: {
  occurrenceId: number;
  status: OccurrenceStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  if (!moradorPodeEditar(status) && !moradorPodeCancelar(status)) {
    return null;
  }

  async function confirmarCancelamento() {
    setCancelando(true);
    const result = await cancelarOcorrenciaAction(occurrenceId);
    setCancelando(false);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível cancelar.");
      return;
    }

    toast.success(result.message ?? "Ocorrência cancelada.");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {moradorPodeEditar(status) && (
        <Button asChild variant="outline">
          <Link href={`/ocorrencias/${occurrenceId}/editar`}>
            <PencilIcon />
            Editar
          </Link>
        </Button>
      )}

      {moradorPodeCancelar(status) && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <XIcon />
              Cancelar ocorrência
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar ocorrência</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. A ocorrência ficará marcada
                como Cancelada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={cancelando}
                onClick={(event) => {
                  event.preventDefault();
                  confirmarCancelamento();
                }}
              >
                {cancelando ? "Cancelando..." : "Confirmar cancelamento"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
