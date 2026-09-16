"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyRoundIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ROLE_LABELS } from "@/lib/perfil";

import { alternarStatusMoradorAction } from "../_actions/alternar-status";
import type { Morador } from "../_data-access/get-moradores";
import { MoradorFormDialog } from "./morador-form-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

const PAGE_SIZE = 8;

type FiltroStatus = "todos" | "ativos" | "inativos";

function iniciaisDoNome(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Spec 02/03 - lista de moradores em cards de alta densidade (secao
 * 10.4 do PRD), com busca, filtro por acesso, paginacao discreta e as
 * acoes do administrativo (cadastrar, editar, redefinir senha,
 * desativar/reativar).
 */
export function MoradoresContent({ moradores }: { moradores: Morador[] }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [pagina, setPagina] = useState(1);

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    morador?: Morador;
  }>({ open: false, mode: "create" });

  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    morador?: Morador;
  }>({ open: false });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    morador?: Morador;
  }>({ open: false });
  const [alternandoStatus, setAlternandoStatus] = useState(false);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return moradores.filter((morador) => {
      if (filtroStatus === "ativos" && !morador.is_active) return false;
      if (filtroStatus === "inativos" && morador.is_active) return false;

      if (!termo) return true;

      const unidade = `${morador.bloco ?? ""} ${morador.apartamento ?? ""}`;
      return (
        morador.full_name.toLowerCase().includes(termo) ||
        morador.email.toLowerCase().includes(termo) ||
        unidade.toLowerCase().includes(termo)
      );
    });
  }, [moradores, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice(
    (paginaAtual - 1) * PAGE_SIZE,
    paginaAtual * PAGE_SIZE
  );

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function handleFiltroStatusChange(valor: string) {
    if (valor) {
      setFiltroStatus(valor as FiltroStatus);
      setPagina(1);
    }
  }

  function abrirCriacao() {
    setFormDialog({ open: true, mode: "create", morador: undefined });
  }

  function abrirEdicao(morador: Morador) {
    setFormDialog({ open: true, mode: "edit", morador });
  }

  function abrirRedefinirSenha(morador: Morador) {
    setPasswordDialog({ open: true, morador });
  }

  async function reativar(morador: Morador) {
    const result = await alternarStatusMoradorAction({
      id: morador.id,
      is_active: true,
    });
    if (!result.success) {
      toast.error(result.message ?? "Não foi possível reativar o acesso.");
      return;
    }
    toast.success(result.message ?? "Acesso reativado.");
  }

  async function confirmarDesativacao() {
    if (!statusDialog.morador) return;
    setAlternandoStatus(true);
    const result = await alternarStatusMoradorAction({
      id: statusDialog.morador.id,
      is_active: false,
    });
    setAlternandoStatus(false);

    if (!result.success) {
      toast.error(result.message ?? "Não foi possível desativar o acesso.");
      return;
    }
    toast.success(result.message ?? "Acesso desativado.");
    setStatusDialog({ open: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg text-foreground">Moradores</h1>
        <p className="text-body-md text-muted-foreground">
          Cadastro, edição e acesso dos moradores do condomínio.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(event) => handleBuscaChange(event.target.value)}
              placeholder="Buscar por nome, e-mail ou unidade"
              className="pl-9"
            />
          </div>

          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={filtroStatus}
            onValueChange={handleFiltroStatusChange}
          >
            <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
            <ToggleGroupItem value="ativos">Ativos</ToggleGroupItem>
            <ToggleGroupItem value="inativos">Inativos</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Button onClick={abrirCriacao} className="shrink-0">
          <PlusIcon />
          Novo morador
        </Button>
      </div>

      {paginados.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum morador encontrado</EmptyTitle>
            <EmptyDescription>
              {moradores.length === 0
                ? "Cadastre o primeiro morador do condomínio."
                : "Ajuste a busca ou o filtro de acesso."}
            </EmptyDescription>
          </EmptyHeader>
          {moradores.length === 0 && (
            <EmptyContent>
              <Button onClick={abrirCriacao}>
                <PlusIcon />
                Novo morador
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {paginados.map((morador) => (
            <Card
              key={morador.id}
              className="flex flex-row items-center gap-4 p-3 sm:p-4"
            >
              <Avatar size="lg" className="shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {iniciaisDoNome(morador.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-label-lg text-foreground">
                    {morador.full_name}
                  </span>
                  <Badge variant="outline">{ROLE_LABELS[morador.role]}</Badge>
                  <Badge variant={morador.is_active ? "default" : "secondary"}>
                    {morador.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <span className="truncate text-body-sm text-muted-foreground">
                  Bloco {morador.bloco} · Apto {morador.apartamento} ·{" "}
                  {morador.email}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="shrink-0">
                    <MoreVerticalIcon />
                    <span className="sr-only">Ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => abrirEdicao(morador)}>
                    <PencilIcon />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => abrirRedefinirSenha(morador)}
                  >
                    <KeyRoundIcon />
                    Redefinir senha
                  </DropdownMenuItem>
                  {morador.is_active ? (
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setStatusDialog({ open: true, morador })}
                    >
                      <PowerIcon />
                      Desativar acesso
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => reativar(morador)}>
                      <PowerIcon />
                      Reativar acesso
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))}

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-2">
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
      )}

      <MoradorFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        morador={formDialog.morador}
        onOpenChange={(open) => setFormDialog((atual) => ({ ...atual, open }))}
      />

      <ResetPasswordDialog
        open={passwordDialog.open}
        morador={passwordDialog.morador}
        onOpenChange={(open) =>
          setPasswordDialog((atual) => ({ ...atual, open }))
        }
      />

      <AlertDialog
        open={statusDialog.open}
        onOpenChange={(open) =>
          setStatusDialog((atual) => ({ ...atual, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar acesso</AlertDialogTitle>
            <AlertDialogDescription>
              {statusDialog.morador
                ? `${statusDialog.morador.full_name} não poderá mais entrar no sistema. O histórico de ocorrências continua disponível e o acesso pode ser reativado depois.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={alternandoStatus}
              onClick={(event) => {
                event.preventDefault();
                confirmarDesativacao();
              }}
            >
              {alternandoStatus ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
