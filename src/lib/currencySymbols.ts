import type { Currency } from "./exchange";

/** Proper native / disambiguated symbols for all supported currencies. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: "A$",
  BGN: "лв",
  BRL: "R$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  CZK: "Kč",
  DKK: "kr",
  EUR: "€",
  GBP: "£",
  HKD: "HK$",
  HRK: "kn",
  HUF: "Ft",
  IDR: "Rp",
  ILS: "₪",
  INR: "₹",
  ISK: "kr",
  JPY: "¥",
  KRW: "₩",
  MXN: "MX$",
  MYR: "RM",
  NOK: "kr",
  NZD: "NZ$",
  PHP: "₱",
  PLN: "zł",
  RON: "lei",
  RUB: "₽",
  SEK: "kr",
  SGD: "S$",
  THB: "฿",
  TRY: "₺",
  USD: "$",
  ZAR: "R",
};

export function getCurrencySymbolForCode(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
}
