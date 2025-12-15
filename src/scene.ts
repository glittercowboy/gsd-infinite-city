import * as THREE from 'three';
import { createCar, updateCar, checkCollision, applyBounce } from './car';
import { initInput, getInputState } from './input';
import { ChunkManager } from './chunk/ChunkManager';
import { TrafficManager } from './traffic/TrafficManager';
import { DayNightCycle } from './daynight';

export function setupScene(container: HTMLElement): void {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // Fog
  scene.fog = new THREE.Fog(0x87CEEB, 100, 300);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Chunk Manager
  const chunkManager = new ChunkManager(scene, 12345);

  // Traffic Manager
  const trafficManager = new TrafficManager();
  scene.add(trafficManager);

  // Day/Night Cycle
  const dayNightCycle = new DayNightCycle();

  // Car
  const car = createCar();
  scene.add(car);

  // Input
  initInput();

  // Window resize handler
  function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);

  // Animation loop
  let lastTime = performance.now();

  function animate(): void {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    const input = getInputState();
    updateCar(car, input, deltaTime);

    // Update day/night cycle
    dayNightCycle.update(deltaTime);
    directionalLight.position.copy(dayNightCycle.getSunPosition());
    scene.background = dayNightCycle.getSkyColor();
    if (scene.fog) {
      scene.fog.color.copy(dayNightCycle.getFogColor());
    }
    ambientLight.intensity = dayNightCycle.getAmbientIntensity();
    directionalLight.intensity = dayNightCycle.getDirectionalIntensity();

    // Check collision and apply bounce
    const colliders = chunkManager.getCollidersAt(car.position);
    const collision = checkCollision(car, colliders);
    if (collision) {
      applyBounce(car, collision);
    }

    // Update chunks based on car position
    chunkManager.update(car.position);

    // Update traffic
    trafficManager.update(deltaTime, car.position);

    // Camera follows car
    const cameraOffset = new THREE.Vector3(0, 5, 10);
    cameraOffset.applyQuaternion(car.quaternion);
    camera.position.copy(car.position).add(cameraOffset);
    camera.lookAt(car.position);

    renderer.render(scene, camera);
  }

  animate();
}
