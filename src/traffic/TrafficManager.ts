import * as THREE from 'three';
import { TrafficCar, TRAFFIC_CAR_COUNT, TRAFFIC_CAR_SPEED } from './types';
import { CHUNK_SIZE } from '../chunk/types';

export class TrafficManager extends THREE.Group {
  private cars: TrafficCar[];
  private instancedMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D;
  private spawnedChunks: Set<string>;

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
        active: false
      });
    }

    // Create instanced mesh for all cars
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshLambertMaterial({ color: 0x0000ff }); // Blue for AI cars
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, TRAFFIC_CAR_COUNT);
    this.instancedMesh.castShadow = true;
    this.add(this.instancedMesh);

    // Dummy object for matrix updates
    this.dummy = new THREE.Object3D();

    // Track which chunks have spawned cars
    this.spawnedChunks = new Set();

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
    // Update car movement
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (!car.active) continue;

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

      // Update instanced mesh matrix
      this.dummy.position.copy(car.position);
      this.dummy.rotation.y = car.rotation;
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;

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

    // Spawn cars in nearby chunks
    for (let dx = -VIEW_DISTANCE; dx <= VIEW_DISTANCE; dx++) {
      for (let dz = -VIEW_DISTANCE; dz <= VIEW_DISTANCE; dz++) {
        const chunkX = playerChunkX + dx;
        const chunkZ = playerChunkZ + dz;
        const key = `${chunkX},${chunkZ}`;

        if (!this.spawnedChunks.has(key)) {
          this.spawnCarsForChunk(chunkX, chunkZ);
          this.spawnedChunks.add(key);
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

    // Clean up spawned chunks that are far away
    const chunksToRemove: string[] = [];
    for (const key of this.spawnedChunks) {
      const [x, z] = key.split(',').map(Number);
      const dx = Math.abs(x - playerChunkX);
      const dz = Math.abs(z - playerChunkZ);
      if (dx > CACHE_DISTANCE || dz > CACHE_DISTANCE) {
        chunksToRemove.push(key);
      }
    }
    for (const key of chunksToRemove) {
      this.spawnedChunks.delete(key);
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

      // 50% chance horizontal lane, 50% vertical lane
      const isHorizontal = Math.random() < 0.5;

      if (isHorizontal) {
        // X-lane (cars moving along X axis)
        car.laneDir = 'x';

        // Choose one of 4 lane positions (two roads per chunk, two lanes per road)
        const laneOffsets = [4, 28, 36, 60];
        const laneOffset = laneOffsets[Math.floor(Math.random() * laneOffsets.length)];
        car.lanePos = chunkZ * CHUNK_SIZE + laneOffset;

        // Spawn at random position along X within chunk
        const spawnX = chunkX * CHUNK_SIZE + Math.random() * CHUNK_SIZE;
        car.position.set(spawnX, 0.5, car.lanePos);

        // Determine direction based on lane position (right-hand traffic)
        // Upper lanes (4, 36) go right (+X), lower lanes (28, 60) go left (-X)
        if (laneOffset === 4 || laneOffset === 36) {
          car.velocity.set(1, 0, 0);
        } else {
          car.velocity.set(-1, 0, 0);
        }
      } else {
        // Z-lane (cars moving along Z axis)
        car.laneDir = 'z';

        // Choose one of 4 lane positions
        const laneOffsets = [4, 28, 36, 60];
        const laneOffset = laneOffsets[Math.floor(Math.random() * laneOffsets.length)];
        car.lanePos = chunkX * CHUNK_SIZE + laneOffset;

        // Spawn at random position along Z within chunk
        const spawnZ = chunkZ * CHUNK_SIZE + Math.random() * CHUNK_SIZE;
        car.position.set(car.lanePos, 0.5, spawnZ);

        // Determine direction based on lane position
        // Left lanes (4, 36) go forward (+Z), right lanes (28, 60) go backward (-Z)
        if (laneOffset === 4 || laneOffset === 36) {
          car.velocity.set(0, 0, 1);
        } else {
          car.velocity.set(0, 0, -1);
        }
      }

      car.speed = TRAFFIC_CAR_SPEED;
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
}
