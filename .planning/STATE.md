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

Phase: 4 of 6 (Traffic AI)
Plan: 1 of ? in current phase
Status: In progress
Last activity: 2025-12-15 - Completed 04-01-PLAN.md (traffic manager foundation)

Progress: ███████░░░ 70%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 6 min
- Total execution time: 45 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 1 | 4 min | 4 min |
| 1.1 Car Speed | 1 | <1 min | <1 min |
| 2. Procedural City | 4 | 29 min | 7 min |
| 3. Driving & Collision | 1 | 9 min | 9 min |
| 4. Traffic AI | 1 | 2 min | 2 min |

**Recent Trend:**
- Last 5 plans: <1 min, 4 min, 9 min, 9 min, 2 min
- Trend: Stable

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
| P4 | Lane offsets [4,28,36,60] | Two lanes per road, right-hand traffic |
| P4 | Spawn at VIEW_DISTANCE, despawn at CACHE_DISTANCE | Hysteresis prevents car thrashing |

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
Stopped at: Completed 04-01-PLAN.md (traffic manager foundation)
Resume file: None
