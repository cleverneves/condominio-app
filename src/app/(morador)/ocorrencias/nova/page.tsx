import { OcorrenciaForm } from "../_components/ocorrencia-form";

/** Spec 04 - abertura de ocorrencia (Regra 9: sempre nasce Pendente). */
export default function NovaOcorrenciaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-foreground">Abrir ocorrência</h1>
        <p className="text-body-md text-muted-foreground">
          Descreva o que aconteceu para a administração acompanhar.
        </p>
      </div>

      <OcorrenciaForm mode="create" />
    </div>
  );
}
