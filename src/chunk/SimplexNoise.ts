/**
 * 2D Simplex Noise implementation for district generation
 * Based on Stefan Gustavson's implementation
 */

// Permutation table
const p = new Uint8Array(256);

// Gradient vectors for 2D
const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

/**
 * Initialize permutation table with seed
 */
function initPermutation(seed: number): void {
  // Simple LCG for seeded permutation
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state >>> 0) / 4294967296;
  };

  // Fill with values 0-255
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Fisher-Yates shuffle
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
}

/**
 * Get gradient dot product
 */
function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

/**
 * 2D Simplex Noise function
 * Returns value in range [-1, 1]
 */
export function noise2D(x: number, y: number, seed: number): number {
  initPermutation(seed);

  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  // Skew input space to determine which simplex cell we're in
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we are in
  let i1: number, j1: number;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  // Offsets for middle and last corners
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  // Work out hashed gradient indices
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = p[(ii + p[jj & 255]) & 255] % 8;
  const gi1 = p[(ii + i1 + p[(jj + j1) & 255]) & 255] % 8;
  const gi2 = p[(ii + 1 + p[(jj + 1) & 255]) & 255] % 8;

  // Calculate contribution from three corners
  let n0 = 0.0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    t0 *= t0;
    n0 = t0 * t0 * dot2(grad2[gi0], x0, y0);
  }

  let n1 = 0.0;
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    t1 *= t1;
    n1 = t1 * t1 * dot2(grad2[gi1], x1, y1);
  }

  let n2 = 0.0;
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    t2 *= t2;
    n2 = t2 * t2 * dot2(grad2[gi2], x2, y2);
  }

  // Sum contributions (scale to approximately [-1, 1])
  return 70.0 * (n0 + n1 + n2);
}
