/**
 * Generic React hook for API calls with loading / error / data state.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => moviesApi.getAll({ city }), [city]);
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  const run = useCallback(() => {
    const id = ++counter.current;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => { if (id === counter.current) { setData(res); setLoading(false); } })
      .catch((err) => { if (id === counter.current) { setError(err.message ?? 'Something went wrong'); setLoading(false); } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
