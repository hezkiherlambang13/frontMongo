import { useEffect, useRef } from 'react';

// Hook realtime sederhana berbasis polling — refetch berkala tanpa perlu Socket.io
export default function usePolling(callback, intervalMs = 10000, enabled = true) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}