"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

function formatPhoneDisplay(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function PhoneInput({
  value,
  onChange,
  id,
  disabled,
  required,
  error,
}: PhoneInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, "");
    // Strip leading country code "1" if user pasted 11 digits
    if (raw.length === 11 && raw.startsWith("1")) {
      raw = raw.slice(1);
    }
    raw = raw.slice(0, 10);
    onChange(raw);
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-md border shadow-xs transition-[color,box-shadow]",
        "border-input dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        error && "border-destructive ring-destructive/20 dark:ring-destructive/40",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <span className="flex items-center justify-center px-3 text-sm text-muted-foreground border-r border-input select-none h-9 shrink-0">
        +1
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder="555-123-4567"
        value={formatPhoneDisplay(value)}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        aria-invalid={error || undefined}
        className="flex-1 h-9 bg-transparent px-3 py-1 text-base md:text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
