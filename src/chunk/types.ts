import * as THREE from 'three';

export interface ChunkCoord {
  x: number;
  z: number;
}

export interface Chunk {
  coord: ChunkCoord;
  group: THREE.Group;
  lastVisited: number;
}

export const CHUNK_SIZE = 64;
export const VIEW_DISTANCE = 3;
export const CACHE_DISTANCE = 5;
