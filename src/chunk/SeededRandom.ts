/**
 * Mulberry32 PRNG - fast, good distribution
 */
export function createSeededRandom(seed: number): { random(): number } {
  let state = seed;

  return {
    random(): number {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  };
}

/**
 * Hash chunk coordinates with base seed to get chunk-specific seed
 */
export function hashCoord(x: number, z: number, seed: number): number {
  let hash = seed;
  hash = Math.imul(hash ^ x, 0x85ebca6b);
  hash = Math.imul(hash ^ z, 0xc2b2ae35);
  return hash >>> 0;
}
