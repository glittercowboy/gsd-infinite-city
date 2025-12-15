import * as THREE from 'three';
import type { InputState } from './input';

interface CarPhysics {
  velocity: THREE.Vector3;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  turnSpeed: number;
  friction: number;
}

const carPhysicsMap = new WeakMap<THREE.Group, CarPhysics>();

export function createCar(): THREE.Group {
  const car = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  body.castShadow = true;
  car.add(body);

  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 }); // Black

  const wheelPositions = [
    [-1, 0.4, 1.2],   // Front left
    [1, 0.4, 1.2],    // Front right
    [-1, 0.4, -1.2],  // Rear left
    [1, 0.4, -1.2]    // Rear right
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(x, y, z);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    car.add(wheel);
  });

  car.position.y = 0.5;

  // Initialize physics
  carPhysicsMap.set(car, {
    velocity: new THREE.Vector3(),
    speed: 0,
    acceleration: 45,
    maxSpeed: 60,
    turnSpeed: 2.5,
    friction: 0.95
  });

  return car;
}

export function updateCar(car: THREE.Group, input: InputState, deltaTime: number): void {
  const physics = carPhysicsMap.get(car);
  if (!physics) return;

  // Acceleration
  if (input.forward) {
    physics.speed = Math.min(physics.speed + physics.acceleration * deltaTime, physics.maxSpeed);
  } else if (input.backward) {
    physics.speed = Math.max(physics.speed - physics.acceleration * deltaTime, -physics.maxSpeed * 0.5);
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
