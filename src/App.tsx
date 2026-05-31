import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ConvertButton,
  CurrencyRow,
  EditableAmount,
  ErrorBanner,
  Header,
  Keypad,
  SwapButton,
} from "./components/ExchangeUI";
import { useCurrencies } from "./hooks/useCurrencies";
import {
  ratesMatchPair,
  useExchangeRates,
} from "./hooks/useExchangeRates";
import {
  convertAmount,
  formatAmount,
  formatRate,
  reverseConvertAmount,
  type Currency,
} from "./lib/exchange";

export default function App() {
  const [fromCurrency, setFromCurrency] = useState<Currency>("GBP");
  const [toCurrency, setToCurrency] = useState<Currency>("USD");
  const [inputValue, setInputValue] = useState("65");
  const [convertedValue, setConvertedValue] = useState("—");

  const {
    currencies,
    loading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();

  const {
    rates,
    ratesFor,
    loading: ratesLoading,
    error: ratesError,
    refresh,
  } = useExchangeRates(fromCurrency, toCurrency);

  const loading = currenciesLoading || ratesLoading;
  const error = currenciesError ?? ratesError;
  const ratesReady = ratesMatchPair(ratesFor, fromCurrency, toCurrency);

  const fromAmount = useMemo(() => parseFloat(inputValue) || 0, [inputValue]);
  const rateLabel = useMemo(() => {
    if (!ratesReady) return ratesLoading ? "Loading rate…" : "—";
    return formatRate(fromCurrency, toCurrency, rates, currencies);
  }, [
    fromCurrency,
    toCurrency,
    rates,
    currencies,
    ratesReady,
    ratesLoading,
  ]);

  const recalculate = useCallback(() => {
    if (!ratesReady) {
      setConvertedValue("—");
      return;
    }

    const result = convertAmount(fromAmount, fromCurrency, toCurrency, rates);
    setConvertedValue(formatAmount(result));
  }, [fromAmount, fromCurrency, toCurrency, rates, ratesReady]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const handleConvert = useCallback(() => {
    recalculate();
  }, [recalculate]);

  const handleKeyPress = useCallback((key: string) => {
    setInputValue((prev) => {
      if (prev === "0") return key;
      if (prev.length >= 10) return prev;
      return prev + key;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  }, []);

  const handleFromCurrencyChange = useCallback(
    (currency: Currency) => {
      setFromCurrency(currency);
      if (currency === toCurrency) {
        setToCurrency(fromCurrency);
      }
    },
    [fromCurrency, toCurrency],
  );

  const handleToCurrencyChange = useCallback(
    (currency: Currency) => {
      setToCurrency(currency);
      if (currency === fromCurrency) {
        setFromCurrency(toCurrency);
      }
    },
    [fromCurrency, toCurrency],
  );

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleFromAmountChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleToAmountChange = useCallback(
    (value: string) => {
      if (!ratesReady) return;
      const toAmount = parseFloat(value) || 0;
      const newFromAmount = reverseConvertAmount(
        toAmount,
        fromCurrency,
        toCurrency,
        rates,
      );
      setInputValue(formatAmount(newFromAmount));
    },
    [fromCurrency, toCurrency, rates, ratesReady],
  );

  const handleSwap = useCallback(() => {
    const nextInput =
      convertedValue === "—" || convertedValue === "Loading rate…"
        ? inputValue
        : convertedValue;

    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setInputValue(nextInput);
  }, [fromCurrency, toCurrency, convertedValue, inputValue]);

  return (
    <div className="relative flex min-h-[812px] flex-col overflow-hidden rounded-[40px] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex flex-1 flex-col px-6 pb-8 pt-12">
        <Header onRefresh={handleRefresh} isRefreshing={loading} />
        {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

        <div className="mb-2 flex gap-2 py-6">
          <div className="min-w-[148px] shrink-0">
            <CurrencyRow
              currency={fromCurrency}
              amount={inputValue}
              currencies={currencies}
              onCurrencyChange={handleFromCurrencyChange}
              showRate
              rateLabel={rateLabel}
              disabled={currenciesLoading}
              pickerOnly
            />
            <CurrencyRow
              currency={toCurrency}
              amount={convertedValue}
              currencies={currencies}
              onCurrencyChange={handleToCurrencyChange}
              disabled={currenciesLoading}
              pickerOnly
            />
          </div>

          <div className="ml-auto flex min-w-0 flex-1 flex-col items-end justify-between self-stretch">
            <EditableAmount
              value={inputValue}
              onChange={handleFromAmountChange}
              editable={!currenciesLoading}
            />
            <SwapButton
              onClick={handleSwap}
              disabled={currenciesLoading || fromCurrency === toCurrency}
            />
            <EditableAmount
              value={convertedValue}
              onChange={handleToAmountChange}
              editable={ratesReady && !currenciesLoading}
            />
          </div>
        </div>

        <ConvertButton
          onClick={handleConvert}
          disabled={loading || !!error || !ratesReady}
        />
        <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
      </div>

      <div
        className="absolute bottom-3 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-black"
        aria-hidden
      />
    </div>
  );
}
