import { useEffect, useState } from "react";
import { getCurrencyEmoji, getCurrencyFlagUrl } from "../lib/currencyFlags";
import type { Currency } from "../lib/exchange";

type CurrencyFlagProps = {
  currency: Currency;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "size-7",
  md: "size-10",
  lg: "size-10",
} as const;

export function CurrencyFlag({
  currency,
  size = "md",
  className = "",
}: CurrencyFlagProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const flagUrl = getCurrencyFlagUrl(currency, 160);
  const emoji = getCurrencyEmoji(currency);

  useEffect(() => {
    setImgFailed(false);
  }, [currency]);

  const showImage = flagUrl && !imgFailed;

  return (
    <span
      className={`${SIZE_CLASS[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 ${className}`}
      aria-hidden
    >
      {showImage ? (
        <img
          src={flagUrl}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setImgFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-base leading-none">{emoji}</span>
      )}
    </span>
  );
}
