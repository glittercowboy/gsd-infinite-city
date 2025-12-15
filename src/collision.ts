import * as THREE from 'three';
import type { BuildingData, TreeData } from './chunk/types';

/**
 * Convert building data to world-space Box3
 */
export function buildingToBox3(building: BuildingData, worldX: number, worldZ: number): THREE.Box3 {
  const min = new THREE.Vector3(
    worldX + building.position.x,
    0,
    worldZ + building.position.z
  );

  const max = new THREE.Vector3(
    worldX + building.position.x + building.width,
    building.height,
    worldZ + building.position.z + building.depth
  );

  return new THREE.Box3(min, max);
}

/**
 * Convert tree data to world-space Box3
 * Uses trunk dimensions only (not foliage) for collision
 */
export function treeToBox3(tree: TreeData, worldX: number, worldZ: number): THREE.Box3 {
  // Trunk is bottom 35% of tree height, radius ~0.5 units
  const trunkRadius = 0.5;
  const trunkHeight = tree.height * 0.35;

  const center = new THREE.Vector3(
    worldX + tree.position.x,
    trunkHeight / 2,
    worldZ + tree.position.z
  );

  const size = new THREE.Vector3(
    trunkRadius * 2,
    trunkHeight,
    trunkRadius * 2
  );

  const box = new THREE.Box3();
  box.setFromCenterAndSize(center, size);

  return box;
}
