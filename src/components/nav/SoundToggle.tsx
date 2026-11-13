"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { fx } from "@/motion/fx";

/**
 * The Stitch header's "tactile audio" switch: short blips on role switches, pipeline steps and
 * button presses. Remembered per browser; announced through the toast.
 */
export function SoundToggle() {
  const enabled = useSyncExternalStore(
    fx.onSound,
    () => fx.soundEnabled,
    () => true,
  );

  const toggle = () => {
    const next = !enabled;
    fx.setSound(next);
    fx.toast(next ? "Tactile audio on" : "Tactile audio muted");
    if (next) fx.blip(600);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label="Tactile sound effects"
      className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/25 text-ink-muted transition-all duration-200 hover:border-ink hover:bg-sand hover:text-accent-strong active:scale-90 md:size-9"
    >
      <Icon name={enabled ? "volume-on" : "volume-off"} size={16} />
    </button>
  );
}
