"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { formatarData } from "@/lib/formatters";
import {
  OCCURRENCE_CATEGORIES,
  OCCURRENCE_CATEGORY_LABELS,
  OCCURRENCE_STATUSES,
  OCCURRENCE_STATUS_LABELS,
} from "@/lib/ocorrencia";
import { ROLE_LABELS } from "@/lib/perfil";
import type { OccurrenceStatus } from "@/lib/supabase/database.types";
import type { OcorrenciaComAutor } from "../_data-access/get-ocorrencias";
import { OcorrenciaDetalheSheet } from "./ocorrencia-detalhe-sheet";

const PAGE_SIZE = 8;
type FiltroStatus = "todas" | OccurrenceStatus;

function iniciaisDoNome(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function DashboardContent({
  ocorrencias,
  blocos,
  adminId,
}: {
  ocorrencias: OcorrenciaComAutor[];
  blocos: string[];
  adminId: string;
}) {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroBloco, setFiltroBloco] = useState<string>("todos");
  const [pagina, setPagina] = useState(1);
  const [sheetOcorrenciaId, setSheetOcorrenciaId] = useState<number | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

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
    return ocorrencias.filter((ocorrencia) => {
      if (filtroStatus !== "todas" && ocorrencia.status !== filtroStatus) {
        return false;
      }
      if (
        filtroCategoria !== "todas" &&
        ocorrencia.category !== filtroCategoria
      ) {
        return false;
      }
      if (filtroBloco !== "todos" && ocorrencia.autor?.bloco !== filtroBloco) {
        return false;
      }
      return true;
    });
  }, [ocorrencias, filtroStatus, filtroCategoria, filtroBloco]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice(
    (paginaAtual - 1) * PAGE_SIZE,
    paginaAtual * PAGE_SIZE
  );

  function selecionarStatus(valor: FiltroStatus) {
    setFiltroStatus(valor);
    setPagina(1);
  }

  function selecionarCategoria(valor: string) {
    setFiltroCategoria(valor);
    setPagina(1);
  }

  function selecionarBloco(valor: string) {
    setFiltroBloco(valor);
    setPagina(1);
  }

  function abrirDetalhe(id: number) {
    setSheetOcorrenciaId(id);
    setSheetOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-foreground">Dashboard</h1>
        <p className="text-body-md text-muted-foreground">
          Visão geral das ocorrências do condomínio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Card className="col-span-2 flex-col gap-1 border-none bg-primary p-4 text-primary-foreground shadow-elevation-2 sm:col-span-1">
          <span className="text-body-sm text-primary-foreground/80">Total</span>
          <span className="text-stat-metric text-primary-foreground">
            {contagens.todas}
          </span>
        </Card>
        {OCCURRENCE_STATUSES.map((status) => (
          <Card key={status} className="flex-col gap-1 p-4">
            <span className="text-body-sm text-muted-foreground">
              {OCCURRENCE_STATUS_LABELS[status]}
            </span>
            <span className="text-headline-lg text-foreground">
              {contagens[status]}
            </span>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-card p-4 shadow-elevation-1">
        <div className="flex flex-col gap-3">
          <span className="text-label-lg text-foreground">
            Fila operacional de ocorrências
          </span>

          <div className="flex flex-wrap gap-2">
            <FiltroChip
              label="Todas"
              count={contagens.todas}
              ativo={filtroStatus === "todas"}
              onClick={() => selecionarStatus("todas")}
            />
            {OCCURRENCE_STATUSES.map((status) => (
              <FiltroChip
                key={status}
                label={OCCURRENCE_STATUS_LABELS[status]}
                count={contagens[status]}
                ativo={filtroStatus === status}
                onClick={() => selecionarStatus(status)}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={filtroCategoria} onValueChange={selecionarCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {OCCURRENCE_CATEGORIES.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {OCCURRENCE_CATEGORY_LABELS[categoria]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroBloco} onValueChange={selecionarBloco}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Bloco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os blocos</SelectItem>
                {blocos.map((bloco) => (
                  <SelectItem key={bloco} value={bloco}>
                    Bloco {bloco}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginadas.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhuma ocorrência encontrada</EmptyTitle>
              <EmptyDescription>
                Ajuste os filtros para ver outras ocorrências.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {paginadas.map((ocorrencia) => (
              <button
                key={ocorrencia.id}
                type="button"
                onClick={() => abrirDetalhe(ocorrencia.id)}
                className="text-left"
              >
                <Card className="flex flex-row items-center gap-3 p-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:p-4">
                  <Avatar size="lg" className="hidden shrink-0 sm:flex">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {ocorrencia.autor
                        ? iniciaisDoNome(ocorrencia.autor.full_name)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-label-lg text-foreground">
                        {ocorrencia.title}
                      </span>
                      {ocorrencia.autor && (
                        <Badge
                          variant="outline"
                          className="hidden sm:inline-flex"
                        >
                          {ROLE_LABELS[ocorrencia.autor.role]}
                        </Badge>
                      )}
                    </div>
                    <span className="truncate text-body-sm text-muted-foreground">
                      {ocorrencia.autor?.full_name ?? "Morador"} · Bloco{" "}
                      {ocorrencia.author_bloco} · Apto{" "}
                      {ocorrencia.author_apartamento} ·{" "}
                      {OCCURRENCE_CATEGORY_LABELS[ocorrencia.category]} ·{" "}
                      {formatarData(ocorrencia.opened_at)}
                    </span>
                  </div>

                  <StatusBadge
                    status={ocorrencia.status}
                    className="shrink-0"
                  />
                </Card>
              </button>
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-body-sm text-muted-foreground">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={paginaAtual <= 1}
                onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
              >
                <ChevronLeftIcon />
                <span className="sr-only">Página anterior</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={paginaAtual >= totalPaginas}
                onClick={() =>
                  setPagina((atual) => Math.min(totalPaginas, atual + 1))
                }
              >
                <ChevronRightIcon />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <OcorrenciaDetalheSheet
        occurrenceId={sheetOcorrenciaId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        adminId={adminId}
      />
    </div>
  );
}

function FiltroChip({
  label,
  count,
  ativo,
  onClick,
}: {
  label: string;
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
      {label}
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
