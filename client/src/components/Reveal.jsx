import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * Fades + lifts its children into view once, on scroll.
 * Falls back to visible immediately when animations are not wanted.
 */
export default function Reveal({ children, as: Tag = "div", delay = 0, className = "" }) {
  const [shown, setShown] = useState(prefersReduced);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setShown(true); }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${shown ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
