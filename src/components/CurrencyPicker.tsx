import { useEffect, useMemo, useRef, useState } from "react";
import type { Currency, CurrencyInfo } from "../lib/exchange";
import { sortCurrencies } from "../lib/exchange";
import { CurrencyFlag } from "./CurrencyFlag";

type CurrencyPickerProps = {
  value: Currency;
  currencies: Record<string, CurrencyInfo>;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
};

export function CurrencyPicker({
  value,
  currencies,
  onChange,
  disabled = false,
}: CurrencyPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => sortCurrencies(currencies), [currencies]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 py-0.5 disabled:opacity-50"
      >
        <CurrencyFlag currency={value} size="lg" />
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[28px] font-semibold leading-none tracking-wide text-text-primary">
            {value}
          </span>
          <img
            src="/assets/chevron-down.svg"
            alt=""
            className="size-4 shrink-0 opacity-80"
          />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close currency picker"
            className="bottom-sheet-backdrop absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div
            className="bottom-sheet-panel relative flex max-h-[78dvh] w-full max-w-[375px] flex-col self-center overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select currency"
          >
            <div className="flex shrink-0 flex-col items-center border-b border-gray-100 px-4 pb-3 pt-3">
              <div className="mb-3 h-1 w-10 rounded-full bg-gray-300" aria-hidden />
              <p className="mb-3 w-full text-left text-base font-semibold text-text-primary">
                Select currency
              </p>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by code or name..."
                className="w-full rounded-xl bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-text-secondary">
                  No currencies found
                </li>
              ) : (
                filtered.map((currency) => (
                  <li key={currency.code}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(currency.code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-surface ${
                        currency.code === value ? "bg-blue-50" : "hover:bg-surface/80"
                      }`}
                    >
                      <CurrencyFlag currency={currency.code} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="font-semibold text-text-primary">
                            {currency.code}
                          </p>
                          <p className="text-sm font-medium text-text-secondary">
                            {currency.symbol}
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {currency.name}
                        </p>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="shrink-0 border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-text-secondary">
              {filtered.length} of {sorted.length} currencies
            </div>
          </div>
        </div>
      )}
    </>
  );
}
