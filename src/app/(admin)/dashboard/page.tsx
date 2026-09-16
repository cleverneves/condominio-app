import { requireAdmin } from "@/lib/auth/session";
import { getOcorrenciasAdmin } from "./_data-access/get-ocorrencias";
import { DashboardContent } from "./_components/dashboard-content";

/** Spec 08 - dashboard administrativo: metricas, fila e filtros. */
export default async function DashboardPage() {
  const admin = await requireAdmin();
  const ocorrencias = await getOcorrenciasAdmin();

  const blocos = Array.from(
    new Set(
      ocorrencias
        .map((ocorrencia) => ocorrencia.autor?.bloco)
        .filter((bloco): bloco is string => Boolean(bloco))
    )
  ).sort();

  return (
    <DashboardContent
      ocorrencias={ocorrencias}
      blocos={blocos}
      adminId={admin.id}
    />
  );
}
