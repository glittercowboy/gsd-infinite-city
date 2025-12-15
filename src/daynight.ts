import * as THREE from 'three';

/**
 * DayNightCycle manages time-of-day and provides lighting/atmosphere parameters
 * timeOfDay ranges from 0-1 (0.25=noon, 0.75=midnight)
 * Full cycle completes in ~2 minutes for demonstration
 */
export class DayNightCycle {
  private timeOfDay: number;
  private cycleSpeed: number;

  constructor() {
    this.timeOfDay = 0.25; // Start at noon
    this.cycleSpeed = 1 / 120; // Full cycle in 120 seconds (2 minutes)
  }

  /**
   * Advance time by deltaTime
   */
  update(deltaTime: number): void {
    this.timeOfDay += this.cycleSpeed * deltaTime;
    if (this.timeOfDay >= 1) {
      this.timeOfDay -= 1;
    }
  }

  /**
   * Get sun/moon position for directional light
   * Sun arcs across sky from east to west
   */
  getSunPosition(): THREE.Vector3 {
    // timeOfDay 0.25 = noon (sun overhead)
    // timeOfDay 0.75 = midnight (moon overhead)

    // Convert time to angle (0 at noon = overhead)
    const angle = (this.timeOfDay - 0.25) * Math.PI * 2;

    // Sun follows arc: rises in east, peaks at noon, sets in west
    // Radius 150 keeps sun well above tallest buildings (60 units)
    const x = Math.sin(angle) * 150;
    const y = Math.cos(angle) * 150 + 50; // Min height 50 at horizon, 200 at noon
    const z = 0;

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Get sky color interpolated based on time of day
   * Day (0x87CEEB) → Sunset (0xFF7F50) → Night (0x0a0a20) → Dawn → Day
   */
  getSkyColor(): THREE.Color {
    const t = this.timeOfDay;

    // Define key times and colors
    const dayColor = new THREE.Color(0x87CEEB);      // Sky blue
    const sunsetColor = new THREE.Color(0xFF7F50);   // Coral/orange
    const nightColor = new THREE.Color(0x0a0a20);    // Dark blue-black
    const dawnColor = new THREE.Color(0xFF7F50);     // Same as sunset

    // Smooth transitions using cosine interpolation
    if (t < 0.15) {
      // Early morning (night to dawn) - 0.00 to 0.15
      const blend = this.smoothstep(0, 0.15, t);
      return this.lerpColor(nightColor, dawnColor, blend);
    } else if (t < 0.25) {
      // Dawn to day - 0.15 to 0.25
      const blend = this.smoothstep(0.15, 0.25, t);
      return this.lerpColor(dawnColor, dayColor, blend);
    } else if (t < 0.65) {
      // Full day - 0.25 to 0.65
      return dayColor;
    } else if (t < 0.75) {
      // Day to sunset - 0.65 to 0.75
      const blend = this.smoothstep(0.65, 0.75, t);
      return this.lerpColor(dayColor, sunsetColor, blend);
    } else if (t < 0.85) {
      // Sunset to night - 0.75 to 0.85
      const blend = this.smoothstep(0.75, 0.85, t);
      return this.lerpColor(sunsetColor, nightColor, blend);
    } else {
      // Full night - 0.85 to 1.0
      return nightColor;
    }
  }

  /**
   * Get fog color (matches sky color)
   */
  getFogColor(): THREE.Color {
    return this.getSkyColor();
  }

  /**
   * Get ambient light intensity
   * 0.6 during day, 0.2 at night
   */
  getAmbientIntensity(): number {
    const t = this.timeOfDay;

    // Use sine wave centered on noon (0.25)
    const angle = (t - 0.25) * Math.PI * 2;
    const rawValue = Math.cos(angle); // 1 at noon, -1 at midnight

    // Map from [-1, 1] to [0.2, 0.6]
    return 0.4 + rawValue * 0.2;
  }

  /**
   * Get directional light intensity (sun/moon)
   * 0.8 during day, 0.1 at night
   */
  getDirectionalIntensity(): number {
    const t = this.timeOfDay;

    // Use sine wave centered on noon (0.25)
    const angle = (t - 0.25) * Math.PI * 2;
    const rawValue = Math.cos(angle); // 1 at noon, -1 at midnight

    // Map from [-1, 1] to [0.1, 0.8]
    return 0.45 + rawValue * 0.35;
  }

  /**
   * Smooth interpolation (smoothstep function)
   */
  private smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color {
    return new THREE.Color().lerpColors(color1, color2, t);
  }

  /**
   * Get moon phase (0-1)
   * Uses 8-day lunar cycle for visible phase changes
   */
  getMoonPhase(): number {
    // Create an 8-day cycle: timeOfDay advances by 1.0 per full day/night cycle
    // We want ~8 phases, so use a slower counter
    const lunarCycle = (this.timeOfDay * 8) % 1;
    return lunarCycle;
  }

  /**
   * Check if it's currently night time
   */
  isNight(): boolean {
    return this.timeOfDay > 0.8 || this.timeOfDay < 0.1;
  }

  /**
   * Get current time of day (0-1)
   */
  getTimeOfDay(): number {
    return this.timeOfDay;
  }
}
