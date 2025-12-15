import { ChunkCoord, DistrictType, DistrictConfig, CHUNK_SIZE } from './types';
import { noise2D } from './SimplexNoise';

/**
 * Get district type for a chunk based on noise sampling
 */
export function getDistrictType(coord: ChunkCoord, seed: number): DistrictType {
  // Sample noise at chunk center
  const centerX = coord.x * CHUNK_SIZE + CHUNK_SIZE / 2;
  const centerZ = coord.z * CHUNK_SIZE + CHUNK_SIZE / 2;

  // Use two noise samples at different frequencies for more variety
  const scale1 = 0.01; // Low frequency for large districts
  const scale2 = 0.03; // Higher frequency for variation

  const noise1 = noise2D(centerX * scale1, centerZ * scale1, seed);
  const noise2 = noise2D(centerX * scale2, centerZ * scale2, seed + 1000);

  // Combine noise values (weighted toward low frequency)
  const combined = noise1 * 0.7 + noise2 * 0.3;

  // Map noise value to district type
  // Distribution: park (20%), suburbs (30%), industrial (30%), downtown (20%)
  if (combined < -0.3) {
    return 'park';
  } else if (combined < 0.1) {
    return 'suburbs';
  } else if (combined < 0.5) {
    return 'industrial';
  } else {
    return 'downtown';
  }
}

/**
 * Get configuration for a district type
 */
export function getDistrictConfig(type: DistrictType): DistrictConfig {
  switch (type) {
    case 'downtown':
      return {
        minHeight: 40,
        maxHeight: 80,
        density: 1.5, // More buildings per block
        colors: [
          0x4A90E2, // Blue glass
          0x50C878, // Emerald glass
          0x5DADE2, // Light blue glass
          0x48C9B0, // Turquoise glass
          0x3498DB, // Dodger blue
        ],
        hasBuildings: true,
      };

    case 'suburbs':
      return {
        minHeight: 8,
        maxHeight: 15,
        density: 0.5, // Fewer buildings per block
        colors: [
          0xF5DEB3, // Wheat
          0xFFE4B5, // Moccasin
          0xFFFACD, // Lemon chiffon
          0xFAF0E6, // Linen
          0xFFEBCD, // Blanched almond
        ],
        hasBuildings: true,
      };

    case 'industrial':
      return {
        minHeight: 15,
        maxHeight: 30,
        density: 1.0, // Normal density
        colors: [
          0x808080, // Gray
          0x696969, // Dim gray
          0xA9A9A9, // Dark gray
          0xC0C0C0, // Silver
          0x778899, // Light slate gray
        ],
        hasBuildings: true,
      };

    case 'park':
      return {
        minHeight: 0,
        maxHeight: 0,
        density: 0,
        colors: [],
        hasBuildings: false,
      };
  }
}
