const dataHoraFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dataCompletaFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarData(iso: string): string {
  return dataHoraFormatter.format(new Date(iso));
}

export function formatarDataHora(iso: string): string {
  return dataCompletaFormatter.format(new Date(iso));
}
