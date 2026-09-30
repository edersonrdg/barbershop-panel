const BRAZILIAN_E164 = /^\+55(\d{2})(\d{4,5})(\d{4})$/;

// The API stores phones in E.164 (+5511987654321); people read them masked.
export function formatPhone(e164: string): string {
  const match = BRAZILIAN_E164.exec(e164);
  if (!match) return e164;
  const [, areaCode, prefix, suffix] = match;
  return `(${areaCode}) ${prefix}-${suffix}`;
}
