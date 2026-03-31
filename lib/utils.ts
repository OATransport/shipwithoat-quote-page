import clsx from "clsx";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatPhoneNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => callback(...args), delay);
  };
}
