import type { Currency, CurrencyInfo } from "./exchange";
import { getCurrencySymbolForCode } from "./currencySymbols";

export type LatestRatesResponse = {
  data: Record<string, number>;
  meta?: {
    last_updated_at?: string;
  };
};

export type CurrenciesResponse = {
  data: Record<
    string,
    {
      code: string;
      name: string;
      symbol_native: string;
    }
  >;
};

export type RatesErrorResponse = {
  error?: string;
  message?: string;
};

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const errorBody = (await response.json()) as RatesErrorResponse;
    return errorBody.error ?? errorBody.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchLatestRates(
  baseCurrency: Currency,
  targetCurrencies: Currency[],
  signal?: AbortSignal,
): Promise<LatestRatesResponse> {
  const params = new URLSearchParams({
    base_currency: baseCurrency,
    currencies: targetCurrencies.join(","),
  });

  const response = await fetch(`/api/rates?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Failed to fetch rates (${response.status})`),
    );
  }

  return response.json() as Promise<LatestRatesResponse>;
}

export async function fetchCurrencies(): Promise<Record<string, CurrencyInfo>> {
  const response = await fetch("/api/currencies");

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Failed to fetch currencies (${response.status})`),
    );
  }

  const body = (await response.json()) as CurrenciesResponse;

  return Object.fromEntries(
    Object.entries(body.data).map(([code, info]) => [
      code,
      {
        code,
        name: info.name,
        symbol: getCurrencySymbolForCode(code),
      },
    ]),
  );
}
