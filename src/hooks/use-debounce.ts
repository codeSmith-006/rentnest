import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a rapidly changing value (e.g., search text input).
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 400ms)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
