import * as THREE from 'three';

export interface TrafficCar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  laneDir: 'x' | 'z';
  lanePos: number;
  speed: number;
  baseSpeed: number; // Randomized per car on spawn
  scale: number; // Size variety 0.8-1.2
  color: THREE.Color;
  active: boolean;
  honking: boolean;
  honkTime: number;
}

export const TRAFFIC_CAR_COUNT = 100;
export const TRAFFIC_CAR_SPEED = 15; // Base reference, actual speed varies 12-18

// Car color palette
export const CAR_COLORS = [
  0x2563eb, // Blue
  0x22c55e, // Green
  0xeab308, // Yellow
  0xffffff, // White
  0xc0c0c0, // Silver
  0x1f2937  // Black (dark gray)
];
