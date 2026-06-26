"use client";

import * as React from "react";

/**
 * Debounce a rapidly-changing value (e.g. a search input) so downstream
 * effects/queries only fire after the user pauses for `delay` ms.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
