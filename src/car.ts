import * as THREE from "three";
import type { InputState } from "./input";

interface CarPhysics {
  velocity: THREE.Vector3;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  turnSpeed: number;
  friction: number;
  boundingBox: THREE.Box3;
}

const carPhysicsMap = new WeakMap<THREE.Group, CarPhysics>();

export function createCar(): THREE.Group {
  const car = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  car.add(body);

  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black

  const wheelPositions = [
    [-1, 0.4, 1.2], // Front left
    [1, 0.4, 1.2], // Front right
    [-1, 0.4, -1.2], // Rear left
    [1, 0.4, -1.2], // Rear right
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(x, y, z);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    car.add(wheel);
  });

  car.position.y = 0.5;

  // Initialize bounding box (car body is 2x1x4 units)
  const carSize = new THREE.Vector3(2, 1, 4);
  const boundingBox = new THREE.Box3();
  boundingBox.setFromCenterAndSize(car.position, carSize);

  // Initialize physics
  carPhysicsMap.set(car, {
    velocity: new THREE.Vector3(),
    speed: 0,
    acceleration: 75,
    maxSpeed: 100,
    turnSpeed: 2.5,
    friction: 0.95,
    boundingBox
  });

  return car;
}

export function updateCar(
  car: THREE.Group,
  input: InputState,
  deltaTime: number
): void {
  const physics = carPhysicsMap.get(car);
  if (!physics) return;

  // Acceleration
  if (input.forward) {
    physics.speed = Math.min(
      physics.speed + physics.acceleration * deltaTime,
      physics.maxSpeed
    );
  } else if (input.backward) {
    physics.speed = Math.max(
      physics.speed - physics.acceleration * deltaTime,
      -physics.maxSpeed * 0.5
    );
  }

  // Friction
  physics.speed *= physics.friction;

  // Stop completely when speed is very low
  if (Math.abs(physics.speed) < 0.01) {
    physics.speed = 0;
  }

  // Turning (only when moving)
  if (Math.abs(physics.speed) > 0.1) {
    if (input.left) {
      car.rotation.y += physics.turnSpeed * deltaTime;
    }
    if (input.right) {
      car.rotation.y -= physics.turnSpeed * deltaTime;
    }
  }

  // Update velocity based on rotation
  physics.velocity.set(0, 0, -physics.speed);
  physics.velocity.applyQuaternion(car.quaternion);

  // Update position
  car.position.add(physics.velocity.clone().multiplyScalar(deltaTime));
}

/**
 * Collision result with push direction and penetration depth
 */
export interface CollisionResult {
  pushDirection: THREE.Vector3;
  penetrationDepth: number;
}

/**
 * Check collision between car and colliders
 * Returns push direction and penetration depth if collision detected, null otherwise
 */
export function checkCollision(car: THREE.Group, colliders: THREE.Box3[]): CollisionResult | null {
  const physics = carPhysicsMap.get(car);
  if (!physics) return null;

  // Update car's bounding box position
  // Use square collision (4x4) to handle car rotation - car is 2x4, diagonal ~4.5
  const carSize = new THREE.Vector3(4, 1, 4);
  physics.boundingBox.setFromCenterAndSize(car.position, carSize);

  // Check for intersection with any collider
  for (const collider of colliders) {
    if (physics.boundingBox.intersectsBox(collider)) {
      const carBox = physics.boundingBox;

      // Calculate overlap on each axis (minimum translation vector)
      const overlapX = Math.min(
        carBox.max.x - collider.min.x,
        collider.max.x - carBox.min.x
      );
      const overlapZ = Math.min(
        carBox.max.z - collider.min.z,
        collider.max.z - carBox.min.z
      );

      // Push along axis with smallest overlap (shortest escape)
      let pushDirection: THREE.Vector3;
      let penetrationDepth: number;

      if (overlapX < overlapZ) {
        // Push along X axis
        const carCenterX = (carBox.min.x + carBox.max.x) / 2;
        const colliderCenterX = (collider.min.x + collider.max.x) / 2;
        pushDirection = new THREE.Vector3(carCenterX > colliderCenterX ? 1 : -1, 0, 0);
        penetrationDepth = overlapX;
      } else {
        // Push along Z axis
        const carCenterZ = (carBox.min.z + carBox.max.z) / 2;
        const colliderCenterZ = (collider.min.z + collider.max.z) / 2;
        pushDirection = new THREE.Vector3(0, 0, carCenterZ > colliderCenterZ ? 1 : -1);
        penetrationDepth = overlapZ;
      }

      return { pushDirection, penetrationDepth };
    }
  }

  return null;
}

/**
 * Apply bounce response to car
 */
export function applyBounce(car: THREE.Group, collision: CollisionResult): void {
  const physics = carPhysicsMap.get(car);
  if (!physics) return;

  const { pushDirection, penetrationDepth } = collision;

  // Reflect velocity: negate the component of velocity in the push direction
  const velocityDotPush = physics.velocity.dot(pushDirection);
  const reflectedVelocity = physics.velocity
    .clone()
    .sub(pushDirection.clone().multiplyScalar(velocityDotPush * 2));

  // Apply bounce coefficient (0.5 = preserves half speed)
  physics.velocity.copy(reflectedVelocity.multiplyScalar(0.5));

  // Update speed to match new velocity magnitude (XZ only)
  physics.velocity.y = 0; // Keep car on ground plane
  physics.speed = physics.velocity.length();

  // Push car out of collision by actual penetration depth + small buffer
  car.position.add(pushDirection.clone().multiplyScalar(penetrationDepth + 0.1));
}
