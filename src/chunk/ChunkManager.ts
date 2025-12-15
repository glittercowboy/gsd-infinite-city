import * as THREE from 'three';
import { ChunkCoord, Chunk, CHUNK_SIZE, VIEW_DISTANCE, CACHE_DISTANCE } from './types';
import { createSeededRandom, hashCoord } from './SeededRandom';
import { generateRoads, createRoadMeshes } from './RoadGenerator';
import { generateBuildings, createBuildingMeshes } from './BuildingGenerator';
import { getDistrictType, getDistrictConfig } from './DistrictManager';
import { generateTrees, createTreeMeshes } from './TreeGenerator';
import { buildingToBox3, treeToBox3 } from '../collision';

export class ChunkManager {
  private scene: THREE.Scene;
  private baseSeed: number;
  private chunks: Map<string, Chunk>;

  constructor(scene: THREE.Scene, baseSeed: number) {
    this.scene = scene;
    this.baseSeed = baseSeed;
    this.chunks = new Map();
  }

  /**
   * Update chunk loading based on car position
   */
  update(carPosition: THREE.Vector3): void {
    const currentTime = performance.now();

    // Get car's chunk coordinate
    const carChunk: ChunkCoord = {
      x: Math.floor(carPosition.x / CHUNK_SIZE),
      z: Math.floor(carPosition.z / CHUNK_SIZE)
    };

    // Get chunks that should be loaded
    const chunksToLoad = this.getChunksInRadius(carChunk, VIEW_DISTANCE);

    // Load new chunks
    for (const coord of chunksToLoad) {
      const key = this.coordToKey(coord);
      if (!this.chunks.has(key)) {
        this.loadChunk(coord);
      } else {
        // Update last visited time
        const chunk = this.chunks.get(key)!;
        chunk.lastVisited = currentTime;
      }
    }

    // Unload distant chunks (beyond cache distance)
    const chunksToKeep = this.getChunksInRadius(carChunk, CACHE_DISTANCE);
    const keepKeys = new Set(chunksToKeep.map(coord => this.coordToKey(coord)));

    for (const [key, chunk] of this.chunks) {
      if (!keepKeys.has(key)) {
        this.unloadChunk(chunk.coord);
      }
    }
  }

  /**
   * Load a chunk at the given coordinate
   */
  private loadChunk(coord: ChunkCoord): void {
    const key = this.coordToKey(coord);

    // Create chunk group
    const group = new THREE.Group();

    // Calculate world position for this chunk
    const worldX = coord.x * CHUNK_SIZE;
    const worldZ = coord.z * CHUNK_SIZE;

    // Create ground tile
    const groundGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);

    // Get district type and config
    const districtType = getDistrictType(coord, this.baseSeed);
    const districtConfig = getDistrictConfig(districtType);

    // Use seeded random for color variation
    const chunkSeed = hashCoord(coord.x, coord.z, this.baseSeed);
    const rng = createSeededRandom(chunkSeed);
    const colorVariation = 0.9 + (rng.random() * 0.2); // +/- 10% brightness

    // Use lighter green for parks, darker green for other areas
    const baseColor = districtType === 'park' ? 0x32CD32 : 0x228B22;
    const r = ((baseColor >> 16) & 0xff) * colorVariation;
    const g = ((baseColor >> 8) & 0xff) * colorVariation;
    const b = (baseColor & 0xff) * colorVariation;
    const variedColor = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);

    const groundMaterial = new THREE.MeshLambertMaterial({ color: variedColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(worldX, 0, worldZ);
    ground.receiveShadow = true;

    group.add(ground);

    // Generate and add roads
    const roadSegments = generateRoads(coord, rng);
    createRoadMeshes(roadSegments, group, worldX, worldZ);

    // Generate and add buildings (based on district config)
    const buildings = generateBuildings(coord, roadSegments, rng, districtConfig);
    createBuildingMeshes(buildings, group, worldX, worldZ);

    // Generate and add trees (based on district type, avoiding buildings)
    const trees = generateTrees(coord, districtType, rng, buildings);
    createTreeMeshes(trees, group, worldX, worldZ);

    // Generate collision data
    const colliders: THREE.Box3[] = [];

    // Add building colliders
    for (const building of buildings) {
      colliders.push(buildingToBox3(building, worldX, worldZ));
    }

    // Add tree colliders
    for (const tree of trees) {
      colliders.push(treeToBox3(tree, worldX, worldZ));
    }

    this.scene.add(group);

    // Store chunk
    this.chunks.set(key, {
      coord,
      group,
      lastVisited: performance.now(),
      colliders
    });
  }

  /**
   * Unload a chunk at the given coordinate
   */
  private unloadChunk(coord: ChunkCoord): void {
    const key = this.coordToKey(coord);
    const chunk = this.chunks.get(key);

    if (!chunk) return;

    // Remove from scene
    this.scene.remove(chunk.group);

    // Dispose of all geometries and materials (including InstancedMesh)
    chunk.group.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      } else if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    // Remove from map
    this.chunks.delete(key);
  }

  /**
   * Get all chunk coordinates within a radius of the center
   */
  private getChunksInRadius(center: ChunkCoord, radius: number): ChunkCoord[] {
    const chunks: ChunkCoord[] = [];

    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let z = center.z - radius; z <= center.z + radius; z++) {
        chunks.push({ x, z });
      }
    }

    return chunks;
  }

  /**
   * Convert chunk coordinate to string key for Map
   */
  private coordToKey(coord: ChunkCoord): string {
    return `${coord.x},${coord.z}`;
  }

  /**
   * Get colliders for the chunk containing the given position
   */
  public getCollidersAt(position: THREE.Vector3): THREE.Box3[] {
    const coord: ChunkCoord = {
      x: Math.floor(position.x / CHUNK_SIZE),
      z: Math.floor(position.z / CHUNK_SIZE)
    };

    const key = this.coordToKey(coord);
    const chunk = this.chunks.get(key);

    return chunk ? chunk.colliders : [];
  }
}
