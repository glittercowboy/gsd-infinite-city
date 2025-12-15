import * as THREE from 'three';
import { ChunkCoord, RoadSegment, CHUNK_SIZE, ROAD_WIDTH, BLOCK_SIZE } from './types';

interface SeededRandom {
  random(): number;
}

/**
 * Generate road segments for a chunk
 * Roads form a regular grid pattern
 *
 * Each chunk draws roads at x=0, x=32 and z=0, z=32
 * Roads at chunk edges (x=64, z=64) are drawn by the adjacent chunk's x=0, z=0
 */
export function generateRoads(_coord: ChunkCoord, _random: SeededRandom): RoadSegment[] {
  const segments: RoadSegment[] = [];

  // Horizontal roads (running along X axis)
  // Only draw at z=0 and z=BLOCK_SIZE (z=64 is drawn by next chunk's z=0)
  const horizontalZPositions = [0, BLOCK_SIZE];

  for (const z of horizontalZPositions) {
    segments.push({
      start: { x: 0, z },
      end: { x: CHUNK_SIZE, z },
      isMainRoad: z === 0 // Edge roads are main roads
    });
  }

  // Vertical roads (running along Z axis)
  // Only draw at x=0 and x=BLOCK_SIZE (x=64 is drawn by next chunk's x=0)
  const verticalXPositions = [0, BLOCK_SIZE];

  for (const x of verticalXPositions) {
    segments.push({
      start: { x, z: 0 },
      end: { x, z: CHUNK_SIZE },
      isMainRoad: x === 0 // Edge roads are main roads
    });
  }

  return segments;
}

/**
 * Create road meshes from segments and add to chunk group
 */
export function createRoadMeshes(segments: RoadSegment[], chunkGroup: THREE.Group, worldX: number, worldZ: number): void {
  // Shared materials
  const asphaltMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const centerLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });

  for (const segment of segments) {
    // Calculate segment direction and length
    const dx = segment.end.x - segment.start.x;
    const dz = segment.end.z - segment.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    // Road surface
    const roadGeometry = new THREE.PlaneGeometry(length, ROAD_WIDTH);
    const road = new THREE.Mesh(roadGeometry, asphaltMaterial);

    // Position at segment center
    const centerX = (segment.start.x + segment.end.x) / 2;
    const centerZ = (segment.start.z + segment.end.z) / 2;

    // Rotate to horizontal plane
    road.rotation.x = -Math.PI / 2;

    // Rotate to match segment direction
    // For horizontal roads (dx != 0), no rotation needed (already aligned with X)
    // For vertical roads (dz != 0), rotate 90 degrees
    if (Math.abs(dz) > Math.abs(dx)) {
      road.rotation.z = Math.PI / 2;
    }

    // Position in world coordinates
    road.position.set(
      worldX + centerX,
      0.01, // Slightly above ground to prevent z-fighting
      worldZ + centerZ
    );

    road.receiveShadow = true;
    chunkGroup.add(road);

    // Center line (yellow dashed effect via thin plane)
    const lineGeometry = new THREE.PlaneGeometry(length, 0.2);
    const centerLine = new THREE.Mesh(lineGeometry, centerLineMaterial);

    centerLine.rotation.x = -Math.PI / 2;
    if (Math.abs(dz) > Math.abs(dx)) {
      centerLine.rotation.z = Math.PI / 2;
    }

    centerLine.position.set(
      worldX + centerX,
      0.02, // Slightly above road
      worldZ + centerZ
    );

    chunkGroup.add(centerLine);
  }
}
