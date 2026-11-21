import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Returns 0 → 1 over `durationMs` (ease-out) each time `key` changes, so
// numbers and arcs can grow into place. Jumps straight to 1 when the person
// has asked their device to reduce motion.
export function useEntrance(key: string | number, durationMs = 900): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const start = Date.now();

    const tick = () => {
      if (cancelled) return;
      const t = Math.min(1, (Date.now() - start) / durationMs);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then(reduce => {
        if (cancelled) return;
        if (reduce) setProgress(1);
        else {
          setProgress(0);
          frame = requestAnimationFrame(tick);
        }
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [key, durationMs]);

  return progress;
}
