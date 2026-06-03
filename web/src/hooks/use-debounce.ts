import { useState, useEffect } from "react";

/**
 * A custom hook that delays updating the value until after a specified delay.
 * Useful for optimizing search inputs, API calls, and event listeners.
 *
 * @param value The value to debounce.
 * @param delay The delay in milliseconds (default: 500ms).
 * @returns The debounced value.
 */
const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
