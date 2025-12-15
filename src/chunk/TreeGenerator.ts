import * as THREE from 'three';
import { ChunkCoord, DistrictType, TreeData, BuildingData, CHUNK_SIZE, ROAD_WIDTH } from './types';

interface SeededRandom {
  random(): number;
}

// Road positions within chunk (block boundaries where roads are centered)
// Include 64 (chunk edge) since adjacent chunk draws road there
const ROAD_POSITIONS = [0, 32, 64];
const HALF_ROAD = ROAD_WIDTH / 2;

/**
 * Check if position is inside a road
 */
function isInRoad(x: number, z: number): boolean {
  for (const roadPos of ROAD_POSITIONS) {
    if (Math.abs(x - roadPos) < HALF_ROAD) return true;
    if (Math.abs(z - roadPos) < HALF_ROAD) return true;
  }
  return false;
}

/**
 * Check if position overlaps with any building
 */
function overlapsBuilding(x: number, z: number, radius: number, buildings: BuildingData[]): boolean {
  for (const building of buildings) {
    // Check if tree center + radius overlaps building footprint
    if (
      x + radius > building.position.x &&
      x - radius < building.position.x + building.width &&
      z + radius > building.position.z &&
      z - radius < building.position.z + building.depth
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Generate tree placement data for a chunk based on district type
 */
export function generateTrees(
  _coord: ChunkCoord,
  districtType: DistrictType,
  random: SeededRandom,
  buildings: BuildingData[]
): TreeData[] {
  const trees: TreeData[] = [];

  // Determine tree count based on district type
  let minTrees: number;
  let maxTrees: number;

  switch (districtType) {
    case 'park':
      minTrees = 20;
      maxTrees = 40;
      break;
    case 'suburbs':
      minTrees = 5;
      maxTrees = 10;
      break;
    case 'downtown':
    case 'industrial':
      minTrees = 0;
      maxTrees = 2;
      break;
  }

  const numTrees = minTrees + Math.floor(random.random() * (maxTrees - minTrees + 1));

  // Generate tree positions (avoiding roads and buildings)
  for (let i = 0; i < numTrees; i++) {
    // Random tree size (determine first for collision check)
    const height = 6 + random.random() * 8; // 6-14 units tall
    const radius = 2 + random.random() * 2; // 2-4 units radius

    // Try to find valid position
    let x: number = 0;
    let z: number = 0;
    let validPosition = false;

    for (let attempt = 0; attempt < 20; attempt++) {
      x = random.random() * CHUNK_SIZE;
      z = random.random() * CHUNK_SIZE;

      // Check if position is valid (not in road, not overlapping buildings)
      if (!isInRoad(x, z) && !overlapsBuilding(x, z, radius, buildings)) {
        validPosition = true;
        break;
      }
    }

    // Skip this tree if no valid position found
    if (!validPosition) continue;

    trees.push({
      position: { x, z },
      height,
      radius,
    });
  }

  return trees;
}

/**
 * Create tree meshes using InstancedMesh for performance
 */
export function createTreeMeshes(
  trees: TreeData[],
  chunkGroup: THREE.Group,
  worldX: number,
  worldZ: number
): void {
  if (trees.length === 0) return;

  // Create InstancedMesh for trunks (cylinders)
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
  const trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, trees.length);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;

  // Create InstancedMesh for foliage (cones)
  const foliageGeometry = new THREE.ConeGeometry(1, 1, 8);
  const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
  const foliageMesh = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, trees.length);
  foliageMesh.castShadow = true;
  foliageMesh.receiveShadow = true;

  const trunkMatrix = new THREE.Matrix4();
  const foliageMatrix = new THREE.Matrix4();
  const foliageColor = new THREE.Color();

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];

    // World position
    const posX = worldX + tree.position.x;
    const posZ = worldZ + tree.position.z;

    // Trunk: bottom third of tree height
    const trunkHeight = tree.height * 0.35;
    const trunkY = trunkHeight / 2;
    trunkMatrix.makeTranslation(posX, trunkY, posZ);
    trunkMatrix.scale(new THREE.Vector3(1, trunkHeight, 1));
    trunkMesh.setMatrixAt(i, trunkMatrix);

    // Foliage: cone starting from top of trunk
    const foliageHeight = tree.height * 0.7;
    const foliageY = trunkHeight + foliageHeight / 2;
    foliageMatrix.makeTranslation(posX, foliageY, posZ);
    foliageMatrix.scale(new THREE.Vector3(tree.radius, foliageHeight, tree.radius));
    foliageMesh.setMatrixAt(i, foliageMatrix);

    // Add slight color variation to foliage (greens)
    const variation = 0.8 + Math.random() * 0.4; // 0.8-1.2
    foliageColor.setRGB(
      (0x22 / 0xff) * variation,
      (0x8B / 0xff) * variation,
      (0x22 / 0xff) * variation
    );
    foliageMesh.setColorAt(i, foliageColor);
  }

  // Mark matrices and colors as needing update
  trunkMesh.instanceMatrix.needsUpdate = true;
  foliageMesh.instanceMatrix.needsUpdate = true;
  if (foliageMesh.instanceColor) {
    foliageMesh.instanceColor.needsUpdate = true;
  }

  chunkGroup.add(trunkMesh);
  chunkGroup.add(foliageMesh);
}
