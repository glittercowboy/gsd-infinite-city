import * as THREE from 'three';
import { ChunkCoord, RoadSegment, BuildingData, ROAD_WIDTH, BLOCK_SIZE, BUILDING_SETBACK } from './types';

interface SeededRandom {
  random(): number;
}

// Building color palette - grays, tans, whites for low-poly aesthetic
const BUILDING_COLORS = [
  0xE8E8E8, // Light gray
  0xD3D3D3, // Silver
  0xBEBEBE, // Gray
  0xC4B7A6, // Tan
  0xDDCFC4, // Cream
];

/**
 * Generate building placement data for a chunk
 * Buildings are placed along road edges with setback
 */
export function generateBuildings(
  _coord: ChunkCoord,
  _roads: RoadSegment[],
  random: SeededRandom
): BuildingData[] {
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

    // Place 4-8 buildings per block using simple grid
    const numBuildings = 4 + Math.floor(random.random() * 5); // 4-8

    // Place buildings along the edges (facing roads)
    const placed: BuildingData[] = [];

    for (let i = 0; i < numBuildings; i++) {
      // Randomize building dimensions
      const width = 8 + Math.floor(random.random() * 9);  // 8-16
      const depth = 8 + Math.floor(random.random() * 9);  // 8-16
      // Height uses squared random to bias toward shorter buildings
      // Most buildings 10-25, occasional taller ones up to 60
      const heightRandom = random.random() * random.random(); // Squared distribution
      const height = 10 + Math.floor(heightRandom * 50); // 10-60, biased low
      const color = BUILDING_COLORS[Math.floor(random.random() * BUILDING_COLORS.length)];

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
