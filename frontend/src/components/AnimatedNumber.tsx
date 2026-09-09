import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1.1, format, className }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const from = 0;
    const to = value;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {format ? format(display) : Math.round(display).toLocaleString("en-IN")}
    </motion.span>
  );
}
