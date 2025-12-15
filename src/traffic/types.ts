import * as THREE from 'three';

export interface TrafficCar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  laneDir: 'x' | 'z';
  lanePos: number;
  speed: number;
  active: boolean;
  honking: boolean;
  honkTime: number;
}

export const TRAFFIC_CAR_COUNT = 100;
export const TRAFFIC_CAR_SPEED = 15;
