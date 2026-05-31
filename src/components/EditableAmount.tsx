import { useEffect, useRef, useState } from "react";
import { normalizeAmountInput, sanitizeAmountInput } from "../lib/exchange";

type EditableAmountProps = {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
};

function amountSizeClass(value: string): string {
  const display = value === "—" ? "0" : value;
  const length = display.length;

  if (length > 9) return "text-[20px] leading-none";
  if (length > 7) return "text-[22px] leading-none";
  if (length > 5) return "text-[24px] leading-none";
  return "text-[28px] leading-none";
}

export function EditableAmount({
  value,
  onChange,
  editable = true,
}: EditableAmountProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeClass = amountSizeClass(editing ? draft : value);

  useEffect(() => {
    if (editing) {
      setDraft(value === "—" ? "" : value);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  const commit = () => {
    onChange(normalizeAmountInput(draft));
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const sharedClassName = `max-w-full min-w-0 text-right font-semibold tracking-tight text-text-primary tabular-nums ${sizeClass}`;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(sanitizeAmountInput(e.target.value))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        className={`${sharedClassName} w-full bg-transparent px-1 outline-none ring-2 ring-brand-blue/30 rounded-lg`}
        aria-label="Edit amount"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => editable && setEditing(true)}
      disabled={!editable}
      className={`${sharedClassName} w-full rounded-lg px-1 transition-colors ${
        editable ? "cursor-text hover:bg-surface" : "cursor-default"
      }`}
      aria-label={editable ? "Click to edit amount" : undefined}
    >
      {value}
    </button>
  );
}
