import { getCurrencySymbolForCode } from "./currencySymbols";

export type Currency = string;

export type CurrencyInfo = {
  code: string;
  name: string;
  symbol: string;
};

export function getRate(
  from: Currency,
  to: Currency,
  rates: Record<string, number>,
): number {
  if (from === to) return 1;
  return rates[to] ?? 0;
}

export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<string, number>,
): number {
  return amount * getRate(from, to, rates);
}

export function reverseConvertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<string, number>,
): number {
  const rate = getRate(from, to, rates);
  if (rate === 0) return 0;
  return amount / rate;
}

export function sanitizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned.slice(0, 10);
  return `${parts[0].slice(0, 10)}.${parts.slice(1).join("").slice(0, 2)}`;
}

export function normalizeAmountInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") return "0";
  const parsed = parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return "0";
  return formatAmount(parsed);
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return rounded.toFixed(2);
}

export function getCurrencySymbol(
  code: Currency,
  currencies: Record<string, CurrencyInfo>,
): string {
  return currencies[code]?.symbol ?? getCurrencySymbolForCode(code);
}

export function formatRate(
  from: Currency,
  to: Currency,
  rates: Record<string, number>,
  currencies: Record<string, CurrencyInfo>,
): string {
  const rate = getRate(from, to, rates);
  if (rate === 0) return "—";
  const fromSymbol = getCurrencySymbol(from, currencies);
  const toSymbol = getCurrencySymbol(to, currencies);
  const decimals = rate < 0.01 ? 4 : 2;
  return `${fromSymbol}1 = ${toSymbol}${rate.toFixed(decimals)}`;
}

export function sortCurrencies(
  currencies: Record<string, CurrencyInfo>,
): CurrencyInfo[] {
  return Object.values(currencies).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
}
