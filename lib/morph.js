/* "Let's ___ something." word cycler shared by the 3D billboard and the final board. */
export const MORPH_WORDS = ["build", "create", "design", "think"];
export const HOLD = 2.0;   // seconds a word stays put
export const BLEND = 0.9;  // seconds the morph takes

// state at time t (seconds): current word, next word, blend 0..1
export function morphState(t) {
  const period = HOLD + BLEND, n = MORPH_WORDS.length;
  const i = Math.floor(t / period) % n, local = t % period;
  const k = local < HOLD ? 0 : (local - HOLD) / BLEND;
  return { from: MORPH_WORDS[i], to: MORPH_WORDS[(i + 1) % n], k: k * k * (3 - 2 * k) };
}
