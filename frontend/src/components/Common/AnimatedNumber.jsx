import React, { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({
  value = 0,
  duration = 800,              // ms
  prefix = "",
  suffix = "",
  formatter = (n) => n.toLocaleString("en-IN"),
  easing = (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
}) {
  const start = useRef(0);
  const rafId = useRef(null);
  const lastVal = useRef(0);
  const startTime = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // cancel if running
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const from = Number.isFinite(lastVal.current) ? lastVal.current : 0;
    const to = Number(value) || 0;
    start.current = from;
    startTime.current = null;

    const step = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easing(t);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        lastVal.current = to;
      }
    };

    rafId.current = requestAnimationFrame(step);
    return () => rafId.current && cancelAnimationFrame(rafId.current);
  }, [value, duration, easing]);

  const shown =
    Number.isFinite(display) ? formatter(Math.round(display)) : "0";

  return <>{prefix}{shown}{suffix}</>;
}
