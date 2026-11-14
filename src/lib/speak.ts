/** Read a job name aloud with the device voice. No-op when speech is unavailable. */
export function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1;
    synth.speak(u);
  } catch {
    /* ignore */
  }
}
