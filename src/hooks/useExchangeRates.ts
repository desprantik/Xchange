import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestRates } from "../lib/api";
import type { Currency } from "../lib/exchange";

export type RatesPair = {
  base: Currency;
  target: Currency;
};

type ExchangeRatesState = {
  rates: Record<string, number>;
  ratesFor: RatesPair | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
};

export function useExchangeRates(
  baseCurrency: Currency,
  targetCurrency: Currency,
): ExchangeRatesState {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesFor, setRatesFor] = useState<RatesPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    if (baseCurrency === targetCurrency) {
      setRates({ [targetCurrency]: 1 });
      setRatesFor({ base: baseCurrency, target: targetCurrency });
      setLoading(false);
      setError(null);
      return;
    }

    setRates({});
    setRatesFor(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetchLatestRates(
        baseCurrency,
        [targetCurrency],
        controller.signal,
      );

      if (requestId !== requestIdRef.current) return;

      setRates(response.data);
      setRatesFor({ base: baseCurrency, target: targetCurrency });
      setLastUpdated(response.meta?.last_updated_at ?? null);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (requestId !== requestIdRef.current) return;

      setRates({});
      setRatesFor(null);
      setError(err instanceof Error ? err.message : "Failed to load exchange rates");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [baseCurrency, targetCurrency]);

  useEffect(() => {
    void refresh();

    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  return { rates, ratesFor, loading, error, lastUpdated, refresh };
}

export function ratesMatchPair(
  ratesFor: RatesPair | null,
  base: Currency,
  target: Currency,
): boolean {
  return ratesFor?.base === base && ratesFor?.target === target;
}
