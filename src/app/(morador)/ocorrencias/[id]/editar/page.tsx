import { notFound, redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { moradorPodeEditar } from "@/lib/ocorrencia";
import { getOcorrenciaDetalhe } from "@/lib/occurrences/queries";
import { OcorrenciaForm } from "../../_components/ocorrencia-form";

/** Spec 07 - Regra 11: so o autor edita, e so enquanto Pendente. */
export default async function EditarOcorrenciaPage(
  props: PageProps<"/ocorrencias/[id]/editar">
) {
  const { id } = await props.params;
  const occurrenceId = Number(id);
  if (!Number.isInteger(occurrenceId)) notFound();

  const profile = await getSessionProfile();
  if (!profile) notFound();

  const ocorrencia = await getOcorrenciaDetalhe(occurrenceId);
  if (!ocorrencia || ocorrencia.author_id !== profile.id) notFound();
  if (!moradorPodeEditar(ocorrencia.status)) {
    redirect(`/ocorrencias/${occurrenceId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-foreground">Editar ocorrência</h1>
        <p className="text-body-md text-muted-foreground">
          Altere os dados enquanto a ocorrência estiver Pendente.
        </p>
      </div>

      <OcorrenciaForm
        mode="edit"
        ocorrenciaId={ocorrencia.id}
        valoresIniciais={{
          title: ocorrencia.title,
          details: ocorrencia.details,
          category: ocorrencia.category,
          location: ocorrencia.location,
        }}
        imagensExistentes={ocorrencia.imagens}
      />
    </div>
  );
}
