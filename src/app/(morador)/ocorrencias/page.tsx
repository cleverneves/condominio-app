import { getMinhasOcorrencias } from "./_data-access/get-minhas-ocorrencias";
import { OcorrenciasList } from "./_components/ocorrencias-list";

/** Spec 05 - lista das ocorrencias do morador logado (Regra 8). */
export default async function MinhasOcorrenciasPage() {
  const ocorrencias = await getMinhasOcorrencias();

  return <OcorrenciasList ocorrencias={ocorrencias} />;
}
