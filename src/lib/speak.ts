/** Read a job name aloud with the device voice. No-op when speech is unavailable. Returns whether it was queued. */
export function speak(text: string, onDone?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1;
    if (onDone) {
      u.onend = onDone;
      u.onerror = onDone;
    }
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}
