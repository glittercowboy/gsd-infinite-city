# Phase 3 Plan 1: Driving & Collision Summary

**Box3-based collision with MTV separation, trunk-only tree colliders, rotation-safe car AABB**

## Performance

- **Duration:** 9 min
- **Started:** 2025-12-15T17:59:26Z
- **Completed:** 2025-12-15T18:08:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Collision detection using Box3 intersections per chunk
- Arcade bounce with 0.5 coefficient and velocity reflection
- Minimum Translation Vector (MTV) for accurate separation
- Trunk-only tree colliders (foliage doesn't block)
- Rotation-safe square car collision box (4x4)

## Files Created/Modified

- `src/collision.ts` - Created: buildingToBox3() and treeToBox3() converters
- `src/chunk/types.ts` - Added colliders: THREE.Box3[] to Chunk interface
- `src/chunk/ChunkManager.ts` - Added collision generation in loadChunk(), getCollidersAt() method
- `src/car.ts` - Added CollisionResult interface, checkCollision(), applyBounce()
- `src/scene.ts` - Integrated collision check in game loop

## Decisions Made

- MTV-based separation instead of fixed push distance (accurate collision response)
- Square 4x4 car collision box (handles rotation without OBB complexity)
- Trunk-only tree collision (0.5 radius, 35% height) for arcade feel
- XZ-plane-only collision response (prevents car sinking)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Push direction had Y component causing car to sink**
- **Found during:** Task 3 checkpoint verification
- **Issue:** Building centers are at Y=height/2, car at Y=0.5, so push direction pointed downward
- **Fix:** Zero Y component in push direction and velocity
- **Files modified:** src/car.ts

**2. [Rule 1 - Bug] Tree collision used foliage radius instead of trunk**
- **Found during:** Task 3 checkpoint verification
- **Issue:** tree.radius is 2-4 units (foliage), but trunk is only 0.4 units
- **Fix:** Use fixed 0.5 trunk radius and 35% height for tree colliders
- **Files modified:** src/collision.ts

**3. [Rule 1 - Bug] Fixed push distance allowed building penetration**
- **Found during:** Task 3 checkpoint verification
- **Issue:** 0.5 unit push wasn't enough when car penetrated deeper
- **Fix:** Calculate actual overlap (MTV) and push by exact penetration depth
- **Files modified:** src/car.ts

**4. [Rule 1 - Bug] AABB didn't account for car rotation**
- **Found during:** Task 3 checkpoint verification
- **Issue:** Car corners could clip into buildings when rotated
- **Fix:** Use square 4x4 collision box that contains car at any angle
- **Files modified:** src/car.ts

---

**Total deviations:** 4 auto-fixed bugs
**Impact on plan:** All fixes necessary for correct collision behavior. No scope creep.

## Issues Encountered

None beyond the bugs fixed above.

## Next Step

Ready for Phase 3 Plan 2 (if exists) or Phase 4: Traffic AI.

---
*Phase: 03-driving-collision*
*Completed: 2025-12-15*
