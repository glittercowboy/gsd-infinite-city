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

  // Celestial objects
  // Sun mesh
  const sunGeometry = new THREE.SphereGeometry(2, 16, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);

  // Moon mesh
  const moonGeometry = new THREE.SphereGeometry(1.5, 16, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    transparent: true
  });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moonMesh);

  // Star field
  const starCount = 500;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Random points on upper hemisphere (radius 200, Y-up)
    const theta = Math.random() * Math.PI * 2;    // 0 to 2π (full circle around Y)
    const phi = Math.random() * Math.PI * 0.45;   // 0 to ~81° (upper hemisphere, avoid horizon)
    const radius = 200;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);     // X
    starPositions[i * 3 + 1] = radius * Math.cos(phi);                   // Y (UP)
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta); // Z
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

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

    // Update directional light (sun/moon)
    const sunPosition = dayNightCycle.getSunPosition();
    directionalLight.position.copy(sunPosition);

    // Update scene atmosphere
    scene.background = dayNightCycle.getSkyColor();
    if (scene.fog) {
      scene.fog.color.copy(dayNightCycle.getFogColor());
    }
    ambientLight.intensity = dayNightCycle.getAmbientIntensity();
    directionalLight.intensity = dayNightCycle.getDirectionalIntensity();

    // Update sun mesh (follows camera so always visible in sky)
    sunMesh.position.copy(sunPosition).add(car.position);
    // Fade sun based on time of day (synced with sky colors)
    const timeOfDay = dayNightCycle.getTimeOfDay();
    let sunOpacity = 0;
    if (timeOfDay >= 0.1 && timeOfDay <= 0.8) {
      if (timeOfDay < 0.2) {
        // Fade in during dawn (0.1 to 0.2)
        sunOpacity = (timeOfDay - 0.1) / 0.1;
      } else if (timeOfDay > 0.7) {
        // Fade out during dusk (0.7 to 0.8)
        sunOpacity = (0.8 - timeOfDay) / 0.1;
      } else {
        sunOpacity = 1;
      }
    }
    (sunMesh.material as THREE.MeshBasicMaterial).opacity = sunOpacity;

    // Update moon mesh (visible during night, opposite timing from sun)
    // Moon visible 0.8 to 1.0 and 0.0 to 0.1 (nighttime)
    let moonAngle: number;
    if (timeOfDay >= 0.8) {
      // Rising: 0.8 to 1.0, angle -π/2 to 0
      moonAngle = -Math.PI / 2 + ((timeOfDay - 0.8) / 0.2) * (Math.PI / 2);
    } else if (timeOfDay <= 0.1) {
      // Setting: 0.0 to 0.1, angle 0 to +π/2
      moonAngle = (timeOfDay / 0.1) * (Math.PI / 2);
    } else {
      // Daytime - moon below horizon
      moonAngle = Math.PI / 2 + (timeOfDay - 0.1) * 0.5;
    }

    const moonX = Math.sin(moonAngle) * 150;
    const moonY = Math.cos(moonAngle) * 150;
    const moonZ = 0;
    moonMesh.position.set(moonX + car.position.x, moonY, moonZ + car.position.z);

    // Fade moon based on time (visible at night) and phase brightness
    const moonPhase = dayNightCycle.getMoonPhase();
    const moonBrightness = 0.3 + Math.abs(moonPhase - 0.5) * 1.4; // 0.3 at new moon, 1.0 at full moon
    let moonOpacity = 0;
    if (timeOfDay >= 0.8 || timeOfDay <= 0.1) {
      if (timeOfDay >= 0.8 && timeOfDay < 0.85) {
        // Fade in at dusk
        moonOpacity = (timeOfDay - 0.8) / 0.05;
      } else if (timeOfDay > 0.05 && timeOfDay <= 0.1) {
        // Fade out at dawn
        moonOpacity = (0.1 - timeOfDay) / 0.05;
      } else {
        moonOpacity = 1;
      }
    }
    (moonMesh.material as THREE.MeshBasicMaterial).opacity = moonOpacity * moonBrightness;

    // Update stars (fade in at night, follow camera)
    stars.position.copy(car.position);
    const isNight = dayNightCycle.isNight();
    const targetStarOpacity = isNight ? 1.0 : 0.0;
    // Smooth transition
    starMaterial.opacity += (targetStarOpacity - starMaterial.opacity) * deltaTime * 2;
    starMaterial.opacity = Math.max(0, Math.min(1, starMaterial.opacity));

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
