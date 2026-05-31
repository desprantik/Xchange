import type { Currency } from "./exchange";

/** ISO 3166-1 alpha-2 codes for FlagCDN (optional enhancement). */
const CURRENCY_COUNTRY: Record<string, string> = {
  AUD: "au",
  BGN: "bg",
  BRL: "br",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  CZK: "cz",
  DKK: "dk",
  EUR: "eu",
  GBP: "gb",
  HKD: "hk",
  HRK: "hr",
  HUF: "hu",
  IDR: "id",
  ILS: "il",
  INR: "in",
  ISK: "is",
  JPY: "jp",
  KRW: "kr",
  MXN: "mx",
  MYR: "my",
  NOK: "no",
  NZD: "nz",
  PHP: "ph",
  PLN: "pl",
  RON: "ro",
  RUB: "ru",
  SEK: "se",
  SGD: "sg",
  THB: "th",
  TRY: "tr",
  USD: "us",
  ZAR: "za",
};

/** Flag emojis — work offline, no CDN required. */
const CURRENCY_EMOJI: Record<string, string> = {
  AUD: "🇦🇺",
  BGN: "🇧🇬",
  BRL: "🇧🇷",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  CZK: "🇨🇿",
  DKK: "🇩🇰",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  HKD: "🇭🇰",
  HRK: "🇭🇷",
  HUF: "🇭🇺",
  IDR: "🇮🇩",
  ILS: "🇮🇱",
  INR: "🇮🇳",
  ISK: "🇮🇸",
  JPY: "🇯🇵",
  KRW: "🇰🇷",
  MXN: "🇲🇽",
  MYR: "🇲🇾",
  NOK: "🇳🇴",
  NZD: "🇳🇿",
  PHP: "🇵🇭",
  PLN: "🇵🇱",
  RON: "🇷🇴",
  RUB: "🇷🇺",
  SEK: "🇸🇪",
  SGD: "🇸🇬",
  THB: "🇹🇭",
  TRY: "🇹🇷",
  USD: "🇺🇸",
  ZAR: "🇿🇦",
};

export function getCurrencyFlagUrl(currency: Currency, width = 80): string {
  const country = CURRENCY_COUNTRY[currency.toUpperCase()];
  if (!country) return "";
  return `https://flagcdn.com/w${width}/${country}.png`;
}

export function getCurrencyEmoji(currency: Currency): string {
  return CURRENCY_EMOJI[currency.toUpperCase()] ?? currency.slice(0, 2);
}
