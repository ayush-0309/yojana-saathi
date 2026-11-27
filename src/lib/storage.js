// localStorage helpers that never throw (private mode, blocked storage).
import { useEffect, useState } from 'react';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function useStored(key, fallback) {
  const [v, setV] = useState(() => load(key, fallback));
  useEffect(() => { save(key, v); }, [key, v]);
  return [v, setV];
}
