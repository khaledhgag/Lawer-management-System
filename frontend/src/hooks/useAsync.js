import { useEffect, useState, useCallback } from 'react';
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fn()); }
    catch (e) { setError(e?.response?.data?.message || e.message); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run, setData };
}
