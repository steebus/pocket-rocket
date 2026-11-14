/** A tiny event bus so the kid shell's mascot can react to what happens on the page below it. */
export type KidSignal = "claim" | "coins";

type Listener = (signal: KidSignal) => void;
const listeners = new Set<Listener>();

export const kidSignals = {
  emit(signal: KidSignal) {
    listeners.forEach((fn) => fn(signal));
  },
  on(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
