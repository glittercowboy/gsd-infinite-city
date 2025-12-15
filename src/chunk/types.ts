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

export interface RoadSegment {
  start: { x: number; z: number };
  end: { x: number; z: number };
  isMainRoad: boolean;
}

export const CHUNK_SIZE = 64;
export const VIEW_DISTANCE = 3;
export const CACHE_DISTANCE = 5;
export const ROAD_WIDTH = 8;
export const BLOCK_SIZE = 32;
export const BUILDING_SETBACK = 2;

export interface BuildingData {
  position: { x: number; z: number };
  width: number;
  depth: number;
  height: number;
  color: number;
}
