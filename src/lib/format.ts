const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrencyFromCents(cents: number) {
  return brlFormatter.format(cents / 100);
}

export function formatDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const mappedParts = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${mappedParts.day}/${mappedParts.month}/${mappedParts.year} ${mappedParts.hour}:${mappedParts.minute}:${mappedParts.second}`;
}
