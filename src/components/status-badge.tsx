import { cn } from "@/lib/utils";
import { OCCURRENCE_STATUS_LABELS } from "@/lib/ocorrencia";
import type { OccurrenceStatus } from "@/lib/supabase/database.types";

/** Secao 10.3 do PRD - cores exatas por status; nao usar o papel Urgente. */
const STATUS_CLASSNAMES: Record<OccurrenceStatus, string> = {
  pendente:
    "bg-status-pendente-bg text-status-pendente-fg border-status-pendente-border",
  em_andamento:
    "bg-status-em-andamento-bg text-status-em-andamento-fg border-status-em-andamento-border",
  resolvida:
    "bg-status-resolvida-bg text-status-resolvida-fg border-status-resolvida-border",
  cancelada:
    "bg-status-cancelada-bg text-status-cancelada-fg border-status-cancelada-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OccurrenceStatus;
  className?: string;
}) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASSNAMES[status],
        className
      )}
    >
      {OCCURRENCE_STATUS_LABELS[status]}
    </span>
  );
}
