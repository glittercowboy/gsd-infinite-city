# Project State

## Project Summary

**Building:** Browser-based Three.js driving game with procedurally generated infinite city

**Core requirements:**
- Driveable procedural city that spawns as you explore
- Varied districts (downtown, suburbs, industrial, parks)
- Reactive traffic AI (avoid player, honk, basic awareness)
- Day/night cycle with dynamic lighting
- Playable frame rates (30+ FPS) on modern browsers

**Constraints:**
- Web-only (browser-based)
- Vercel/Netlify static hosting
- Performance critical (many objects on screen)

## Current Position

Phase: 5 of 5 (Visuals & Deploy)
Plan: 1 of 1 in current phase
Status: Milestone complete
Last activity: 2025-12-15 - Completed 05-01-PLAN.md (day/night cycle, visual polish, Vercel deploy)

Progress: ██████████ 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 6 min
- Total execution time: 69 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 1 | 4 min | 4 min |
| 1.1 Car Speed | 1 | <1 min | <1 min |
| 2. Procedural City | 4 | 29 min | 7 min |
| 3. Driving & Collision | 1 | 9 min | 9 min |
| 4. Traffic AI | 3 | 22 min | 7 min |
| 5. Visuals & Deploy | 1 | 4 min | 4 min |

**Recent Trend:**
- Last 5 plans: 9 min, 2 min, 17 min, 3 min, 4 min
- Trend: Milestone complete, average 6 min/plan

*Updated after each plan completion*

## Accumulated Context

### Decisions Made

| Phase | Decision | Rationale |
|-------|----------|-----------|
| Init | TypeScript | Type safety for complex game logic |
| Init | Arcade physics | Fun over realism, forgiving controls |
| Init | Chunk-based generation | Enables infinite exploration |
| Init | Reactive AI (not full sim) | Balance between simple and complex |
| P1 | WeakMap for car physics state | Clean separation of mesh from physics data |
| P1 | Quaternion-based camera offset | Smooth following regardless of car rotation |
| P2 | Chunk size 64 units | Balance between granularity and draw calls |
| P2 | View distance 3, cache 5 | Hysteresis prevents chunk thrashing |
| P2 | Fog 100-300 units | Hides chunk edges without claustrophobia |
| P2 | Fixed grid roads (no variation) | Roads must align across chunks; variation via districts instead |
| P2 | Squared height distribution | Most buildings short (10-25), occasional towers (up to 60) |
| P2 | One InstancedMesh per chunk | Batches all buildings into single draw call |
| P2 | Simplex noise for districts | Two-frequency noise maps chunk position to district type |
| P2 | District thresholds | <-0.3 park, -0.3-0.1 suburbs, 0.1-0.5 industrial, >0.5 downtown |
| P2 | Tree placement with collision | Trees avoid roads (0,32,64) and building footprints |
| P3 | MTV-based collision separation | Accurate push-out using minimum translation vector |
| P3 | Square car collision box (4x4) | Handles rotation without OBB complexity |
| P3 | Trunk-only tree collision | 0.5 radius, 35% height - foliage doesn't block |
| P3 | XZ-plane collision response | Prevents car sinking into ground |
| P4 | InstancedMesh for traffic | Single draw call for 100 AI cars |
| P4 | Lane offsets [-2,2,30,34] | Two lanes per road centered on road grid |
| P4 | frustumCulled=false for traffic | Instances scattered - default culling breaks |
| P4 | Count-based respawning | Spawn if chunk <2 cars, keeps traffic persistent |
| P4 | Brake-only player avoidance | Swerve caused shaking, removed |
| P4 | No player-traffic collision | Traffic avoids player, more realistic feel |
| P4 | 6-color car palette | Blue, green, yellow, white, silver, black - common real colors |
| P4 | Z-lane yields to X-lane | Simple right-of-way without traffic lights |
| P4 | Distance-based LOD updates | <100 full, 100-200 half, >200 quarter rate |
| P5 | 2-minute day/night cycle | Demo-friendly visibility, configurable constant |
| P5 | Smoothstep color interpolation | Prevents abrupt sky/lighting changes |
| P5 | MeshBasicMaterial headlights | Always bright, unaffected by scene lighting |

### Deferred Issues

None yet.

### Blockers/Concerns Carried Forward

None yet.

## Project Alignment

Last checked: Project start
Status: ✓ Aligned
Assessment: No work done yet - baseline alignment
Drift notes: None

### Roadmap Evolution

- Phase 1.1 added: Car Speed Increase - speed up the car significantly

## Session Continuity

Last session: 2025-12-15
Stopped at: Completed 05-01-PLAN.md (Milestone complete)
Resume file: None
