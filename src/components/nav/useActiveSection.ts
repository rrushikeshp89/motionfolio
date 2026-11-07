"use client";

import { useEffect, useState } from "react";

/**
 * Which of the given section ids is currently "in charge" of the viewport: the last one whose top
 * has passed a line 35% down the screen. IntersectionObserver instead of a scroll listener, so
 * nothing runs on every scroll frame.
 */
export function useActiveSection<T extends string>(ids: readonly T[], fallback: T): T {
  const [active, setActive] = useState<T>(fallback);

  useEffect(() => {
    const visible = new Map<T, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id as T, entry.isIntersecting);
        const current = [...ids].reverse().find((id) => visible.get(id));
        setActive(current ?? fallback);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [ids, fallback]);

  return active;
}
