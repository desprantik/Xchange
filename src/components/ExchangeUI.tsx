import type { Currency, CurrencyInfo } from "../lib/exchange";
import { CurrencyPicker } from "./CurrencyPicker";
import { EditableAmount } from "./EditableAmount";

export { EditableAmount };

type HeaderProps = {
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function Header({ onRefresh, isRefreshing = false }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-8">
      <h1 className="bg-gradient-to-l from-brand-green to-brand-blue bg-clip-text text-lg font-semibold tracking-tight text-transparent">
        Xchange
      </h1>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh exchange rates"
        className="flex items-center gap-1 rounded-full p-1 transition-opacity hover:opacity-70 disabled:opacity-50"
      >
        <img
          src="/assets/refresh.svg"
          alt=""
          className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
      </button>
    </header>
  );
}

type ErrorBannerProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 font-medium underline hover:no-underline"
      >
        Retry
      </button>
    </div>
  );
}

type CurrencyRowProps = {
  currency: Currency;
  amount: string;
  currencies: Record<string, CurrencyInfo>;
  onCurrencyChange: (currency: Currency) => void;
  onAmountChange?: (value: string) => void;
  amountEditable?: boolean;
  showRate?: boolean;
  rateLabel?: string;
  disabled?: boolean;
  pickerOnly?: boolean;
};

export function CurrencyRow({
  currency,
  amount,
  currencies,
  onCurrencyChange,
  onAmountChange,
  amountEditable = false,
  showRate = false,
  rateLabel,
  disabled = false,
  pickerOnly = false,
}: CurrencyRowProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <CurrencyPicker
          value={currency}
          currencies={currencies}
          onChange={onCurrencyChange}
          disabled={disabled}
        />
        {!pickerOnly &&
          (onAmountChange ? (
            <EditableAmount
              value={amount}
              onChange={onAmountChange}
              editable={amountEditable && !disabled}
            />
          ) : (
            <p className="min-w-0 shrink-0 text-right text-[36px] font-semibold tracking-wide text-text-primary">
              {amount}
            </p>
          ))}
      </div>
      {showRate && rateLabel && (
        <div className="flex items-center gap-2 pb-4 pl-[50px]">
          <img src="/assets/chart.svg" alt="" className="size-4 shrink-0" />
          <p className="min-w-0 text-xs text-brand-blue">{rateLabel}</p>
        </div>
      )}
    </div>
  );
}

type SwapButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function SwapButton({ onClick, disabled = false }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Swap currencies"
      className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-blue shadow-sm transition-all hover:border-brand-blue/30 hover:bg-blue-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="rotate-90"
      >
        <path
          d="M6.667 4.167 4.167 6.667l2.5 2.5M13.333 15.833l2.5-2.5-2.5-2.5M4.167 6.667h11.666M15.833 13.333H4.167"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type KeypadKey = {
  label: string;
  sublabel?: string;
  action?: "backspace" | "symbols";
};

const KEYPAD_ROWS: KeypadKey[][] = [
  [{ label: "1" }, { label: "2", sublabel: "ABC" }, { label: "3", sublabel: "DEF" }],
  [{ label: "4", sublabel: "GHI" }, { label: "5", sublabel: "JKL" }, { label: "6", sublabel: "MNO" }],
  [{ label: "7", sublabel: "PQRS" }, { label: "8", sublabel: "TUV" }, { label: "9", sublabel: "WXYZ" }],
  [{ label: "+ * #", action: "symbols" }, { label: "0" }, { label: "", action: "backspace" }],
];

type KeypadProps = {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
};

export function Keypad({ onKeyPress, onBackspace }: KeypadProps) {
  return (
    <div className="flex flex-col gap-3">
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-3">
          {row.map((key) => (
            <button
              key={`${rowIndex}-${key.label}-${key.action ?? "digit"}`}
              type="button"
              onClick={() => {
                if (key.action === "backspace") onBackspace();
                else if (key.action !== "symbols") onKeyPress(key.label);
              }}
              className="flex h-16 flex-col items-center justify-center rounded-[14px] bg-surface transition-colors hover:bg-[#e5e7eb] active:bg-[#d1d5db]"
            >
              {key.action === "backspace" ? (
                <img src="/assets/backspace.svg" alt="Backspace" className="size-6" />
              ) : (
                <>
                  <span
                    className={`font-medium text-text-primary ${
                      key.label === "+ * #" ? "text-xl" : "text-2xl"
                    }`}
                  >
                    {key.label}
                  </span>
                  {key.sublabel && (
                    <span className="mt-0.5 text-[10px] font-medium tracking-wide text-text-secondary">
                      {key.sublabel}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

type ConvertButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function ConvertButton({ onClick, disabled = false }: ConvertButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mb-6 h-14 w-full rounded-full bg-gradient-to-l from-brand-green to-brand-blue text-lg font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Convert
    </button>
  );
}
