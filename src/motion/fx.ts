"use client";

/*
  Tiny shared effects bus for the Stitch interactions: toast messages and tactile audio blips.
  Plain module state plus listeners, so any client component can call fx.toast()/fx.blip()
  without a React context, and the bundle cost stays a few hundred bytes.
*/

type Listener = (message: string) => void;

const toastListeners = new Set<Listener>();
const soundListeners = new Set<(enabled: boolean) => void>();
const STORAGE_KEY = "motionfolio:sound";

let soundEnabled = true;
let audio: AudioContext | null = null;

function readStoredSound() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) soundEnabled = stored === "on";
  } catch {
    // Storage can be unavailable (private mode); the default stays on.
  }
}
if (typeof window !== "undefined") readStoredSound();

export const fx = {
  /** Shows a short status message in the toast (also announced to screen readers). */
  toast(message: string) {
    for (const listener of toastListeners) listener(message);
  },
  onToast(listener: Listener) {
    toastListeners.add(listener);
    return () => void toastListeners.delete(listener);
  },

  get soundEnabled() {
    return soundEnabled;
  },
  setSound(enabled: boolean) {
    soundEnabled = enabled;
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Not persisted; the choice still applies for this visit.
    }
    for (const listener of soundListeners) listener(enabled);
  },
  onSound(listener: (enabled: boolean) => void) {
    soundListeners.add(listener);
    return () => void soundListeners.delete(listener);
  },

  /**
   * An 80 ms sine "blip" through Web Audio, as in the Stitch design. Only ever called from a user
   * action, so browsers allow the audio context; silent when muted or when audio is unavailable.
   */
  blip(frequency = 440) {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") void audio.resume();
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
    } catch {
      // No Web Audio: stay silent.
    }
  },
};
