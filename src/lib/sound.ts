/** Tiny WebAudio synth. No audio files. Safe on the server and before any user gesture. */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.12, slideTo?: number) {
  const c = getCtx();
  if (!c) return;
  try {
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* audio is a nicety */
  }
}

function play(fn: () => void) {
  if (muted) return;
  try {
    fn();
  } catch {
    /* ignore */
  }
}

export const sound = {
  /** Two bright notes, like a coin landing. */
  coin() {
    play(() => {
      tone(988, 0, 0.09, "square", 0.1);
      tone(1319, 0.08, 0.28, "square", 0.1);
    });
  },
  /** Short soft tap. */
  pop() {
    play(() => tone(520, 0, 0.12, "sine", 0.18, 220));
  },
  /** Rising arpeggio. */
  cheer() {
    play(() => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle", 0.14));
      tone(1568, 0.5, 0.4, "triangle", 0.12);
    });
  },
  /** Gentle low "not now", never harsh. */
  nope() {
    play(() => {
      tone(330, 0, 0.16, "sine", 0.14);
      tone(262, 0.14, 0.24, "sine", 0.14);
    });
  },
  setMuted(b: boolean) {
    muted = b;
  },
};
