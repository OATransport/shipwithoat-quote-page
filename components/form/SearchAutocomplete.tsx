"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn, debounce } from "@/lib/utils";

type SearchAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  emptyMessage?: string;
  allowCustomValue?: boolean;
  loading?: boolean;
  minQueryLength?: number;
};

export function SearchAutocomplete({
  id,
  label,
  placeholder,
  value,
  suggestions,
  onChange,
  onSelect,
  disabled = false,
  error,
  helperText,
  emptyMessage = "Keep typing to refine the search.",
  allowCustomValue = true,
  loading = false,
  minQueryLength = 0,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);
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

  const filterSuggestions = useMemo(
    () =>
      debounce((nextQuery: string) => {
        const normalizedQuery = nextQuery.trim().toLowerCase();

        if (normalizedQuery.length < minQueryLength) {
          setVisibleSuggestions([]);
          return;
        }

        const filtered = suggestions
          .filter((item) => item.toLowerCase().includes(normalizedQuery))
          .slice(0, 8);

        setVisibleSuggestions(filtered);
      }, 120),
    [minQueryLength, suggestions],
  );

  useEffect(() => {
    filterSuggestions(query);
  }, [filterSuggestions, query]);

  const describedBy = [error ? `${id}-error` : "", helperText ? `${id}-help` : ""]
    .filter(Boolean)
    .join(" ");
  const shouldShowCustomAction =
    allowCustomValue &&
    query.trim().length >= Math.max(2, minQueryLength) &&
    !visibleSuggestions.some((item) => item.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            onChange(nextValue);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "input-base pr-11",
            disabled && "cursor-not-allowed bg-slate-50 text-slate-400",
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

      {open && !disabled ? (
        <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-2xl">
          {visibleSuggestions.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-2">
              {visibleSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm leading-6 text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => {
                      setQuery(suggestion);
                      onChange(suggestion);
                      onSelect(suggestion);
                      setOpen(false);
                    }}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : shouldShowCustomAction ? (
            <div className="py-2">
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm leading-6 text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => {
                  const nextValue = query.trim();
                  setQuery(nextValue);
                  onChange(nextValue);
                  onSelect(nextValue);
                  setOpen(false);
                }}
              >
                Use “{query.trim()}”
              </button>
            </div>
          ) : (
            <p className="px-4 py-3 text-sm leading-6 text-slate-500">{emptyMessage}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
