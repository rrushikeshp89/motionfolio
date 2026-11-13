"use client";

import { useEffect, useRef, useState } from "react";
import { fx } from "./fx";

const INTERACTIVE =
  "a, button, [role='tab'], label, .char-kinetic, [data-tilt], .tech-tag, [data-cursor]";
const MAGNETIC_PULL = 0.22;
const TILT_DEGREES = 5;

/**
 * The page-wide Stitch interactions, wired once with event delegation:
 * - a terracotta cursor dot with a lagging ring that grows over interactive things (fine pointers);
 * - magnetic buttons ([data-magnetic]) that lean toward the pointer;
 * - 3D tilt cards ([data-tilt]) that follow the pointer;
 * - a tactile press ripple and blip on [data-tactile];
 * - the toast that fx.toast() fills.
 * Pointer effects only run with a fine pointer and motion allowed; the toast always works.
 */
export function Effects() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);

  useEffect(() => {
    let timer = 0;
    let id = 0;
    const stop = fx.onToast((message) => {
      id += 1;
      setToast({ message, id });
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => setToast((current) => (current ? { ...current, message: "" } : null)),
        2200,
      );
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element).closest<HTMLElement>("[data-tactile]");
      if (!target) return;
      fx.blip(520);
      if (reduced) return;
      target.classList.remove("ripple");
      void target.offsetWidth; // restart the keyframe on rapid clicks
      target.classList.add("ripple");
    };
    document.addEventListener("click", onClick);
    if (!fine || reduced) return () => document.removeEventListener("click", onClick);

    root.classList.add("has-cursor");
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const follow = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring)
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dot)
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      const target = event.target as Element;
      root.classList.toggle("cursor-hover", Boolean(target.closest(INTERACTIVE)));

      const nextMagnet = target.closest<HTMLElement>("[data-magnetic]");
      if (magnet && magnet !== nextMagnet) magnet.style.translate = "";
      magnet = nextMagnet;
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const x = (mouseX - box.left - box.width / 2) * MAGNETIC_PULL;
        const y = (mouseY - box.top - box.height / 2) * MAGNETIC_PULL;
        magnet.style.translate = `${x}px ${y}px`;
      }

      const nextTilt = target.closest<HTMLElement>("[data-tilt]");
      if (tilt && tilt !== nextTilt) tilt.style.transform = "";
      tilt = nextTilt;
      if (tilt) {
        const box = tilt.getBoundingClientRect();
        const rotateX = ((mouseY - box.top - box.height / 2) / (box.height / 2)) * -TILT_DEGREES;
        const rotateY = ((mouseX - box.left - box.width / 2) / (box.width / 2)) * TILT_DEGREES;
        tilt.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      }
    };
    const onLeave = () => {
      root.classList.remove("cursor-hover");
      if (magnet) magnet.style.translate = "";
      if (tilt) tilt.style.transform = "";
      magnet = tilt = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-cursor", "cursor-hover");
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" />
      <div
        role="status"
        aria-live="polite"
        className={`toast label ${toast?.message ? "toast-show" : ""}`}
      >
        <span aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
        <span key={toast?.id}>{toast?.message}</span>
      </div>
    </>
  );
}
