import * as THREE from 'three';
import { ChunkCoord, RoadSegment, BuildingData, DistrictConfig, ROAD_WIDTH, BLOCK_SIZE, BUILDING_SETBACK } from './types';

interface SeededRandom {
  random(): number;
}

/**
 * Generate building placement data for a chunk
 * Buildings are placed along road edges with setback
 */
export function generateBuildings(
  _coord: ChunkCoord,
  _roads: RoadSegment[],
  random: SeededRandom,
  districtConfig: DistrictConfig
): BuildingData[] {
  // If district doesn't have buildings (e.g., park), return empty array
  if (!districtConfig.hasBuildings) {
    return [];
  }
  const buildings: BuildingData[] = [];

  // The chunk has a 2x2 grid of blocks (BLOCK_SIZE = 32, CHUNK_SIZE = 64)
  // Roads are at x=0, x=32 (and x=64 drawn by next chunk) and z=0, z=32 (and z=64)
  // Each block is bounded by roads on all sides

  // Block positions (center of buildable area within each block)
  // Block 0,0: road at x=0, z=0; buildable from (ROAD_WIDTH/2 + SETBACK) to (BLOCK_SIZE - SETBACK)
  // Block 1,0: road at x=32, z=0; buildable from (32 + ROAD_WIDTH/2 + SETBACK) to (64 - SETBACK)

  const blocks = [
    { minX: 0, minZ: 0 },
    { minX: BLOCK_SIZE, minZ: 0 },
    { minX: 0, minZ: BLOCK_SIZE },
    { minX: BLOCK_SIZE, minZ: BLOCK_SIZE },
  ];

  for (const block of blocks) {
    // Calculate buildable area within block
    // Roads are centered on block boundaries, so road takes ROAD_WIDTH/2 into each block
    const halfRoad = ROAD_WIDTH / 2;

    // Buildable area bounds (local to chunk)
    const buildMinX = block.minX + halfRoad + BUILDING_SETBACK;
    const buildMaxX = block.minX + BLOCK_SIZE - halfRoad - BUILDING_SETBACK;
    const buildMinZ = block.minZ + halfRoad + BUILDING_SETBACK;
    const buildMaxZ = block.minZ + BLOCK_SIZE - halfRoad - BUILDING_SETBACK;

    const buildableWidth = buildMaxX - buildMinX;
    const buildableDepth = buildMaxZ - buildMinZ;

    // Skip if buildable area too small
    if (buildableWidth < 10 || buildableDepth < 10) continue;

    // Place buildings per block, adjusted by district density
    const baseNumBuildings = 4 + Math.floor(random.random() * 5); // 4-8
    const numBuildings = Math.floor(baseNumBuildings * districtConfig.density);

    // Place buildings along the edges (facing roads)
    const placed: BuildingData[] = [];

    for (let i = 0; i < numBuildings; i++) {
      // Randomize building dimensions
      const width = 8 + Math.floor(random.random() * 9);  // 8-16
      const depth = 8 + Math.floor(random.random() * 9);  // 8-16
      // Height from district config range
      const heightRange = districtConfig.maxHeight - districtConfig.minHeight;
      const height = districtConfig.minHeight + Math.floor(random.random() * heightRange);
      // Color from district palette with subtle variation
      const baseColor = districtConfig.colors[Math.floor(random.random() * districtConfig.colors.length)];
      // Add slight color variation (±10% brightness)
      const variation = 0.9 + random.random() * 0.2;
      const r = Math.floor(((baseColor >> 16) & 0xFF) * variation);
      const g = Math.floor(((baseColor >> 8) & 0xFF) * variation);
      const b = Math.floor((baseColor & 0xFF) * variation);
      const color = (r << 16) | (g << 8) | b;

      // Try to place without overlapping
      let attempts = 0;
      while (attempts < 10) {
        attempts++;

        // Random position within buildable area
        const x = buildMinX + random.random() * (buildableWidth - width);
        const z = buildMinZ + random.random() * (buildableDepth - depth);

        // Check for overlaps with existing buildings in this block
        let overlaps = false;
        for (const existing of placed) {
          if (
            x < existing.position.x + existing.width &&
            x + width > existing.position.x &&
            z < existing.position.z + existing.depth &&
            z + depth > existing.position.z
          ) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          const building: BuildingData = {
            position: { x, z },
            width,
            depth,
            height,
            color,
          };
          placed.push(building);
          buildings.push(building);
          break;
        }
      }
    }
  }

  return buildings;
}

/**
 * Create building meshes using InstancedMesh for performance
 */
export function createBuildingMeshes(
  buildings: BuildingData[],
  chunkGroup: THREE.Group,
  worldX: number,
  worldZ: number
): void {
  if (buildings.length === 0) return;

  // Create single InstancedMesh for all buildings in chunk
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshLambertMaterial({ vertexColors: false });

  const instancedMesh = new THREE.InstancedMesh(geometry, material, buildings.length);
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();

  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];

    // Position building center
    // Box is centered at origin, so we need to offset by half height to place on ground
    const centerX = worldX + building.position.x + building.width / 2;
    const centerY = building.height / 2; // Building sits on ground (y=0)
    const centerZ = worldZ + building.position.z + building.depth / 2;

    // Create transformation matrix: translate then scale
    matrix.makeTranslation(centerX, centerY, centerZ);
    matrix.scale(new THREE.Vector3(building.width, building.height, building.depth));

    instancedMesh.setMatrixAt(i, matrix);

    // Set instance color
    color.setHex(building.color);
    instancedMesh.setColorAt(i, color);
  }

  // Mark matrices and colors as needing update
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }

  chunkGroup.add(instancedMesh);
}
