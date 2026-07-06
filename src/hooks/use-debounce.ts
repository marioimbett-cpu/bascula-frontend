import { useEffect, useState } from "react";

/** Retrasa la actualización de un valor (típicamente input de búsqueda) para evitar llamadas excesivas a la API. */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
