// The API works in integer cents. Reais only exist in the interface, and the
// conversion is done on strings so a float never touches the amount.

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

export function centsToInput(cents: number): string {
  const reais = Math.trunc(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${reais},${rest}`;
}

const WITH_THOUSANDS = /^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/;
const PLAIN_COMMA = /^(\d+)(?:,(\d{1,2}))?$/;
const PLAIN_DOT = /^(\d+)\.(\d{1,2})$/;

// Accepts what people type for a price: "45", "45,5", "45,50", "1.234,56",
// "45.50" or with "R$". Returns null when it is not a non-negative amount.
export function parseReaisToCents(input: string): number | null {
  const text = input.replace(/R\$/i, '').replace(/\s/g, '');
  const match =
    WITH_THOUSANDS.exec(text) ?? PLAIN_COMMA.exec(text) ?? PLAIN_DOT.exec(text);
  if (!match) return null;

  const reais = match[1].replaceAll('.', '');
  const cents = (match[2] ?? '').padEnd(2, '0');
  return Number(reais) * 100 + Number(cents);
}
