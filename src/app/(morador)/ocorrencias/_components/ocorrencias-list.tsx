"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { StatusBadge } from "@/components/status-badge";
import { formatarData } from "@/lib/formatters";
import {
  OCCURRENCE_CATEGORY_LABELS,
  OCCURRENCE_STATUSES,
  OCCURRENCE_STATUS_LABELS,
} from "@/lib/ocorrencia";
import type { OccurrenceStatus } from "@/lib/supabase/database.types";
import type { OcorrenciaRow } from "../_data-access/get-minhas-ocorrencias";

type FiltroStatus = "todas" | OccurrenceStatus;

/**
 * Spec 05 - lista das ocorrencias do morador, com chips-pilula de status
 * (com contagem, mesmo espirito do dashboard administrativo - secao
 * 10.4 do PRD) e o padrao de item (titulo, categoria, data, badge).
 */
export function OcorrenciasList({
  ocorrencias,
}: {
  ocorrencias: OcorrenciaRow[];
}) {
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");

  const contagens = useMemo(() => {
    const base: Record<FiltroStatus, number> = {
      todas: ocorrencias.length,
      pendente: 0,
      em_andamento: 0,
      resolvida: 0,
      cancelada: 0,
    };
    for (const ocorrencia of ocorrencias) {
      base[ocorrencia.status] += 1;
    }
    return base;
  }, [ocorrencias]);

  const filtradas = useMemo(() => {
    if (filtro === "todas") return ocorrencias;
    return ocorrencias.filter((ocorrencia) => ocorrencia.status === filtro);
  }, [ocorrencias, filtro]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-lg text-foreground">
            Minhas ocorrências
          </h1>
          <p className="text-body-md text-muted-foreground">
            Acompanhe o andamento dos chamados que você abriu.
          </p>
        </div>
        <Button asChild className="hidden shrink-0 sm:inline-flex">
          <Link href="/ocorrencias/nova">
            <PlusIcon />
            Abrir ocorrência
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FiltroChip
          label="Todas"
          count={contagens.todas}
          ativo={filtro === "todas"}
          onClick={() => setFiltro("todas")}
        />
        {OCCURRENCE_STATUSES.map((status) => (
          <FiltroChip
            key={status}
            label={undefined}
            status={status}
            count={contagens[status]}
            ativo={filtro === status}
            onClick={() => setFiltro(status)}
          />
        ))}
      </div>

      {filtradas.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma ocorrência por aqui</EmptyTitle>
            <EmptyDescription>
              {ocorrencias.length === 0
                ? "Você ainda não abriu nenhuma ocorrência."
                : "Nenhuma ocorrência com esse status."}
            </EmptyDescription>
          </EmptyHeader>
          {ocorrencias.length === 0 && (
            <EmptyContent>
              <Button asChild>
                <Link href="/ocorrencias/nova">
                  <PlusIcon />
                  Abrir ocorrência
                </Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((ocorrencia) => (
            <Link key={ocorrencia.id} href={`/ocorrencias/${ocorrencia.id}`}>
              <Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:bg-muted/40">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-label-lg text-foreground">
                    {ocorrencia.title}
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {OCCURRENCE_CATEGORY_LABELS[ocorrencia.category]} ·{" "}
                    {formatarData(ocorrencia.opened_at)}
                  </span>
                </div>
                <StatusBadge status={ocorrencia.status} />
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltroChip({
  label,
  status,
  count,
  ativo,
  onClick,
}: {
  label?: string;
  status?: OccurrenceStatus;
  count: number;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors " +
        (ativo
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary")
      }
    >
      {status ? OCCURRENCE_STATUS_LABELS[status] : label}
      <span
        className={
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold " +
          (ativo ? "bg-white/20" : "bg-muted text-muted-foreground")
        }
      >
        {count}
      </span>
    </button>
  );
}
