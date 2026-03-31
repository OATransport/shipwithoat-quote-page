"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AddressSuggestion } from "@/lib/types";
import { cn, debounce } from "@/lib/utils";

type AddressAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion | null) => void;
  error?: string;
  helperText?: string;
};

export function AddressAutocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  error,
  helperText,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providerError, setProviderError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (nextQuery: string) => {
        if (nextQuery.trim().length < 3) {
          setSuggestions([]);
          setProviderError("");
          return;
        }

        try {
          setLoading(true);
          setProviderError("");
          const response = await fetch(`/api/address/autocomplete?q=${encodeURIComponent(nextQuery)}`);
          const data = (await response.json()) as {
            suggestions?: AddressSuggestion[];
            fallback?: boolean;
          };

          setSuggestions(data.suggestions ?? []);

          if ((data.suggestions ?? []).length === 0) {
            setProviderError(
              data.fallback
                ? "Enter the full address or city/state and continue."
                : "Keep typing to refine your address.",
            );
          }
        } catch {
          setSuggestions([]);
          setProviderError("Enter the full address or city/state and continue.");
        } finally {
          setLoading(false);
        }
      }, 250),
    [],
  );

  const describedBy = [error ? `${id}-error` : "", helperText ? `${id}-help` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="street-address"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            onChange(nextValue);
            onSelect(null);
            setOpen(true);
            fetchSuggestions(nextValue);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "input-base pr-11",
            error && "border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]",
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400">
          {loading ? "..." : "⌕"}
        </div>
      </div>

      {helperText ? (
        <p id={`${id}-help`} className="helper-text mt-2">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="error-text mt-2">
          {error}
        </p>
      ) : null}

      {open && (suggestions.length > 0 || providerError) ? (
        <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-2xl">
          {suggestions.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm leading-6 text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => {
                      setQuery(suggestion.label);
                      onChange(suggestion.label);
                      onSelect(suggestion);
                      setOpen(false);
                    }}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm leading-6 text-slate-500">{providerError}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
