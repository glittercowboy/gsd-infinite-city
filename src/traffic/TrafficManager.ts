import * as THREE from 'three';
import { TrafficCar, TRAFFIC_CAR_COUNT, TRAFFIC_CAR_SPEED, CAR_COLORS } from './types';
import { CHUNK_SIZE } from '../chunk/types';

export class TrafficManager extends THREE.Group {
  private cars: TrafficCar[];
  private instancedMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D;
  private frameCount: number = 0;

  constructor() {
    super();

    // Initialize car state array
    this.cars = [];
    for (let i = 0; i < TRAFFIC_CAR_COUNT; i++) {
      this.cars.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        rotation: 0,
        laneDir: 'x',
        lanePos: 0,
        speed: TRAFFIC_CAR_SPEED,
        baseSpeed: TRAFFIC_CAR_SPEED,
        scale: 1.0,
        color: new THREE.Color(0x0000ff),
        active: false,
        honking: false,
        honkTime: 0
      });
    }

    // Create instanced mesh for all cars
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshLambertMaterial({ color: 0x0000ff }); // Blue for AI cars
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, TRAFFIC_CAR_COUNT);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.frustumCulled = false; // Instances are scattered - disable culling

    // Initialize instance colors (required for setColorAt to work)
    const colors = new Float32Array(TRAFFIC_CAR_COUNT * 3);
    for (let i = 0; i < TRAFFIC_CAR_COUNT; i++) {
      colors[i * 3] = 0;     // R
      colors[i * 3 + 1] = 0; // G
      colors[i * 3 + 2] = 1; // B (blue)
    }
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

    this.add(this.instancedMesh);

    // Dummy object for matrix updates
    this.dummy = new THREE.Object3D();

    // Hide all inactive cars off-screen initially
    for (let i = 0; i < TRAFFIC_CAR_COUNT; i++) {
      this.dummy.position.set(0, -1000, 0);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update all active cars - movement and rendering
   */
  update(deltaTime: number, playerPosition: THREE.Vector3): void {
    const currentTime = performance.now();
    this.frameCount++;

    // Update car movement with distance-based update frequency
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (!car.active) continue;

      // Distance-based update frequency optimization
      const distanceToPlayer = car.position.distanceTo(playerPosition);
      let shouldUpdateThisFrame = true;

      if (distanceToPlayer > 200) {
        // Far cars: update every 4th frame
        shouldUpdateThisFrame = (this.frameCount + i) % 4 === 0;
      } else if (distanceToPlayer > 100) {
        // Medium distance: update every 2nd frame
        shouldUpdateThisFrame = (this.frameCount + i) % 2 === 0;
      }
      // Close cars (<100): update every frame

      if (!shouldUpdateThisFrame) {
        continue;
      }

      // Reset speed to car's base speed (varies per car)
      car.speed = car.baseSpeed;

      // Intersection yielding: Z-lane cars yield to X-lane cars
      if (this.shouldYieldAtIntersection(car, i)) {
        car.speed = 0;
      }

      // Car-to-car collision avoidance
      const carAhead = this.findCarAhead(i);
      if (carAhead) {
        const distanceAhead = this.getDistanceAhead(car, carAhead);
        if (distanceAhead < 15) {
          if (distanceAhead < 5) {
            // Very close - stop completely
            car.speed = 0;
          } else {
            // Proportional slowdown: closer = slower
            const slowdownFactor = (distanceAhead - 5) / (15 - 5); // 0 to 1
            car.speed = car.baseSpeed * slowdownFactor;
          }
        }
      }

      // Player avoidance and honking (reuse distanceToPlayer from update frequency check)
      const playerInPath = this.isPlayerInPath(car, playerPosition);

      if (playerInPath && distanceToPlayer < 20) {
        // Honk at player
        car.honking = true;
        car.honkTime = currentTime;

        if (distanceToPlayer < 10) {
          // Emergency brake when very close
          car.speed = 0;
        } else {
          // Slow down when approaching
          car.speed *= 0.5;
        }
      }

      // Clear honking after 500ms
      if (car.honking && currentTime - car.honkTime > 500) {
        car.honking = false;
      }

      // Move car along its lane direction
      if (car.laneDir === 'x') {
        // Moving along X axis
        const direction = Math.sign(car.velocity.x);
        car.position.x += direction * car.speed * deltaTime;
        car.rotation = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        // Moving along Z axis
        const direction = Math.sign(car.velocity.z);
        car.position.z += direction * car.speed * deltaTime;
        car.rotation = direction > 0 ? 0 : Math.PI;
      }

      // Update instanced mesh matrix with scale and color
      this.dummy.position.copy(car.position);
      this.dummy.position.y = 0.5 * car.scale; // Adjust height for scale
      this.dummy.rotation.y = car.rotation;
      this.dummy.scale.setScalar(car.scale);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

      // Visual honking indicator: flash red, otherwise use car's color
      if (car.honking) {
        this.instancedMesh.setColorAt(i, new THREE.Color(0xff0000)); // Red when honking
      } else {
        this.instancedMesh.setColorAt(i, car.color);
      }
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    // Spawn/despawn based on player position
    this.updateSpawning(playerPosition);
  }

  /**
   * Handle spawning and despawning cars based on player position
   */
  private updateSpawning(playerPosition: THREE.Vector3): void {
    const playerChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);

    const VIEW_DISTANCE = 3;
    const CACHE_DISTANCE = 5;

    // Count active cars per chunk
    const carsPerChunk = new Map<string, number>();
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (!car.active) continue;

      const carChunkX = Math.floor(car.position.x / CHUNK_SIZE);
      const carChunkZ = Math.floor(car.position.z / CHUNK_SIZE);
      const key = `${carChunkX},${carChunkZ}`;
      carsPerChunk.set(key, (carsPerChunk.get(key) || 0) + 1);
    }

    // Spawn cars in nearby chunks that need more cars
    for (let dx = -VIEW_DISTANCE; dx <= VIEW_DISTANCE; dx++) {
      for (let dz = -VIEW_DISTANCE; dz <= VIEW_DISTANCE; dz++) {
        const chunkX = playerChunkX + dx;
        const chunkZ = playerChunkZ + dz;
        const key = `${chunkX},${chunkZ}`;

        // Spawn if chunk has fewer than 2 cars
        const carCount = carsPerChunk.get(key) || 0;
        if (carCount < 2) {
          this.spawnCarsForChunk(chunkX, chunkZ);
        }
      }
    }

    // Despawn cars outside cache distance
    const despawnDistance = CACHE_DISTANCE * CHUNK_SIZE;
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (!car.active) continue;

      const distance = car.position.distanceTo(playerPosition);
      if (distance > despawnDistance) {
        car.active = false;
        // Move car off-screen
        this.dummy.position.set(0, -1000, 0);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      }
    }
  }

  /**
   * Spawn 2-4 cars in a chunk on random lanes
   */
  private spawnCarsForChunk(chunkX: number, chunkZ: number): void {
    const carCount = 2 + Math.floor(Math.random() * 3); // 2-4 cars

    for (let i = 0; i < carCount; i++) {
      // Find an inactive car slot
      const carIndex = this.findInactiveCarIndex();
      if (carIndex === -1) break; // No slots available

      const car = this.cars[carIndex];
      car.active = true;

      // Randomize car appearance and behavior
      car.color = new THREE.Color(CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]);
      car.baseSpeed = 12 + Math.random() * 6; // 12-18 speed range
      car.scale = 0.8 + Math.random() * 0.4; // 0.8-1.2 scale range

      // 50% chance horizontal lane, 50% vertical lane
      const isHorizontal = Math.random() < 0.5;

      // Road centers are at 0 and 32 within each chunk, ROAD_WIDTH=8
      // Lane offsets: -2/+2 for road at 0, 30/34 for road at 32
      const laneOffsets = [-2, 2, 30, 34];

      if (isHorizontal) {
        // X-lane (cars moving along X axis, on Z-position roads)
        car.laneDir = 'x';

        const laneOffset = laneOffsets[Math.floor(Math.random() * laneOffsets.length)];
        car.lanePos = chunkZ * CHUNK_SIZE + laneOffset;

        // Spawn at random position along X within chunk
        const spawnX = chunkX * CHUNK_SIZE + Math.random() * CHUNK_SIZE;
        car.position.set(spawnX, 0.5, car.lanePos);

        // Right-hand traffic: negative offsets go +X, positive offsets go -X
        if (laneOffset < 0 || laneOffset === 30) {
          car.velocity.set(1, 0, 0);
        } else {
          car.velocity.set(-1, 0, 0);
        }
      } else {
        // Z-lane (cars moving along Z axis, on X-position roads)
        car.laneDir = 'z';

        const laneOffset = laneOffsets[Math.floor(Math.random() * laneOffsets.length)];
        car.lanePos = chunkX * CHUNK_SIZE + laneOffset;

        // Spawn at random position along Z within chunk
        const spawnZ = chunkZ * CHUNK_SIZE + Math.random() * CHUNK_SIZE;
        car.position.set(car.lanePos, 0.5, spawnZ);

        // Right-hand traffic: negative offsets go +Z, positive offsets go -Z
        if (laneOffset < 0 || laneOffset === 30) {
          car.velocity.set(0, 0, 1);
        } else {
          car.velocity.set(0, 0, -1);
        }
      }

      car.speed = car.baseSpeed;
    }
  }

  /**
   * Find first inactive car slot
   */
  private findInactiveCarIndex(): number {
    for (let i = 0; i < this.cars.length; i++) {
      if (!this.cars[i].active) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find the closest car ahead in the same lane
   */
  private findCarAhead(carIndex: number): TrafficCar | null {
    const car = this.cars[carIndex];
    let closestCarAhead: TrafficCar | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.cars.length; i++) {
      if (i === carIndex || !this.cars[i].active) continue;

      const otherCar = this.cars[i];

      // Check if in same lane: same direction and similar lateral position
      if (car.laneDir !== otherCar.laneDir) continue;
      if (Math.abs(car.lanePos - otherCar.lanePos) >= 4) continue; // Lane width check

      // Check if ahead based on movement direction
      const isAhead = this.isCarAhead(car, otherCar);
      if (!isAhead) continue;

      const distance = this.getDistanceAhead(car, otherCar);
      if (distance < minDistance) {
        minDistance = distance;
        closestCarAhead = otherCar;
      }
    }

    return closestCarAhead;
  }

  /**
   * Check if otherCar is ahead of car based on movement direction
   */
  private isCarAhead(car: TrafficCar, otherCar: TrafficCar): boolean {
    if (car.laneDir === 'x') {
      const direction = Math.sign(car.velocity.x);
      if (direction > 0) {
        return otherCar.position.x > car.position.x;
      } else {
        return otherCar.position.x < car.position.x;
      }
    } else {
      const direction = Math.sign(car.velocity.z);
      if (direction > 0) {
        return otherCar.position.z > car.position.z;
      } else {
        return otherCar.position.z < car.position.z;
      }
    }
  }

  /**
   * Get distance to car ahead along movement axis
   */
  private getDistanceAhead(car: TrafficCar, otherCar: TrafficCar): number {
    if (car.laneDir === 'x') {
      return Math.abs(otherCar.position.x - car.position.x);
    } else {
      return Math.abs(otherCar.position.z - car.position.z);
    }
  }

  /**
   * Check if player is in the car's path
   */
  private isPlayerInPath(car: TrafficCar, playerPosition: THREE.Vector3): boolean {
    // Check if player is ahead of car
    const playerAhead = this.isPositionAhead(car, playerPosition);
    if (!playerAhead) return false;

    // Check lateral distance (within lane width + buffer)
    let lateralDistance: number;
    if (car.laneDir === 'x') {
      lateralDistance = Math.abs(playerPosition.z - car.position.z);
    } else {
      lateralDistance = Math.abs(playerPosition.x - car.position.x);
    }

    return lateralDistance < 6; // Lane width + buffer
  }

  /**
   * Check if position is ahead of car based on movement direction
   */
  private isPositionAhead(car: TrafficCar, position: THREE.Vector3): boolean {
    if (car.laneDir === 'x') {
      const direction = Math.sign(car.velocity.x);
      if (direction > 0) {
        return position.x > car.position.x;
      } else {
        return position.x < car.position.x;
      }
    } else {
      const direction = Math.sign(car.velocity.z);
      if (direction > 0) {
        return position.z > car.position.z;
      } else {
        return position.z < car.position.z;
      }
    }
  }

  /**
   * Check if car is near an intersection
   * Intersections are at chunk-relative positions: (0,0), (0,32), (32,0), (32,32)
   * Returns the intersection position if within approach distance
   */
  private getNearbyIntersection(car: TrafficCar): THREE.Vector3 | null {
    // Road grid positions within chunk: 0 and 32
    const roadPositions = [0, 32];
    const approachDistance = 10;

    // Check each possible intersection
    for (const roadX of roadPositions) {
      for (const roadZ of roadPositions) {
        // Calculate the intersection world position
        // Car's chunk position determines which intersection set to check
        const chunkX = Math.floor(car.position.x / CHUNK_SIZE);
        const chunkZ = Math.floor(car.position.z / CHUNK_SIZE);

        const intersectionX = chunkX * CHUNK_SIZE + roadX;
        const intersectionZ = chunkZ * CHUNK_SIZE + roadZ;

        // Check distance to intersection
        const dx = Math.abs(car.position.x - intersectionX);
        const dz = Math.abs(car.position.z - intersectionZ);

        if (dx < approachDistance && dz < approachDistance) {
          return new THREE.Vector3(intersectionX, 0, intersectionZ);
        }
      }
    }

    return null;
  }

  /**
   * Check if a Z-lane car should yield at an intersection
   * Rule: Z-lane cars yield to X-lane cars (right-of-way)
   */
  private shouldYieldAtIntersection(car: TrafficCar, carIndex: number): boolean {
    // Only Z-lane cars need to yield
    if (car.laneDir !== 'z') return false;

    const intersection = this.getNearbyIntersection(car);
    if (!intersection) return false;

    // Check if car is approaching (not already in) the intersection
    const direction = Math.sign(car.velocity.z);
    const distanceToIntersection = direction > 0
      ? intersection.z - car.position.z
      : car.position.z - intersection.z;

    // Only yield if approaching (not past the intersection center)
    if (distanceToIntersection < 0 || distanceToIntersection > 10) return false;

    // Check for any X-lane cars within 15 units of this intersection
    const checkDistance = 15;
    for (let i = 0; i < this.cars.length; i++) {
      if (i === carIndex || !this.cars[i].active) continue;

      const otherCar = this.cars[i];
      if (otherCar.laneDir !== 'x') continue;

      // Check if the X-lane car is near this intersection
      const otherDx = Math.abs(otherCar.position.x - intersection.x);
      const otherDz = Math.abs(otherCar.position.z - intersection.z);

      // X-lane car is a threat if it's within range of the intersection
      if (otherDx < checkDistance && otherDz < 6) {
        return true; // Yield!
      }
    }

    return false;
  }
}
