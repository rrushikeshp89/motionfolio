"use client";

import { useEffect, useState, type RefObject } from "react";

/** Live prefers-reduced-motion. False on the server and first render, so markup always matches. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Whether the element is at least `amount` visible. */
export function useInView(ref: RefObject<Element | null>, amount = 0.5): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: amount },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, amount]);
  return inView;
}
