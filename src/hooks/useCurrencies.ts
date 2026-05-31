import { useEffect, useState } from "react";
import { fetchCurrencies } from "../lib/api";
import type { CurrencyInfo } from "../lib/exchange";

type CurrenciesState = {
  currencies: Record<string, CurrencyInfo>;
  loading: boolean;
  error: string | null;
};

export function useCurrencies(): CurrenciesState {
  const [currencies, setCurrencies] = useState<Record<string, CurrencyInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCurrencies();
        if (!cancelled) {
          setCurrencies(data);
        }
      } catch (err) {
        if (!cancelled) {
          setCurrencies({});
          setError(
            err instanceof Error ? err.message : "Failed to load currencies",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { currencies, loading, error };
}
