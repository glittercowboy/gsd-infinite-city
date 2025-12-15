# Phase 2 Plan 4: Districts & Trees Summary

**Simplex noise district system with downtown/suburbs/industrial/park zones and InstancedMesh trees avoiding roads and buildings**

## Performance

- **Duration:** 9 min
- **Started:** 2025-12-15T17:43:07Z
- **Completed:** 2025-12-15T17:52:04Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- District system using 2D simplex noise for varied city areas
- Four district types: downtown (tall dense), suburbs (short sparse), industrial (warehouses), parks (trees only)
- Tree generation with InstancedMesh (cone foliage + cylinder trunk)
- Trees properly avoid roads and building footprints

## Files Created/Modified

- `src/chunk/SimplexNoise.ts` - 2D simplex noise implementation with seeded permutation
- `src/chunk/DistrictManager.ts` - District type assignment and config (height/density/colors)
- `src/chunk/TreeGenerator.ts` - Tree placement with road/building avoidance
- `src/chunk/types.ts` - Added DistrictType, DistrictConfig, TreeData interfaces
- `src/chunk/BuildingGenerator.ts` - Uses district config for height/density/colors
- `src/chunk/ChunkManager.ts` - Integrates districts and trees, lighter grass for parks

## Decisions Made

- Simplex noise with two frequencies for district variation
- District thresholds: <-0.3 park, -0.3-0.1 suburbs, 0.1-0.5 industrial, >0.5 downtown
- Squared height distribution replaced with district-based ranges
- Tree count by district: parks 20-40, suburbs 5-10, downtown/industrial 0-2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Trees spawning in roads**
- **Found during:** Task 3 (human verification)
- **Issue:** TreeGenerator placed trees at random positions without road avoidance
- **Fix:** Added `isInRoad()` check for road positions at 0, 32, 64 in both axes
- **Files modified:** src/chunk/TreeGenerator.ts
- **Verification:** Visual confirmation - trees no longer in roads

**2. [Rule 1 - Bug] Trees overlapping buildings**
- **Found during:** Task 3 (human verification)
- **Issue:** TreeGenerator didn't check building footprints
- **Fix:** Added `overlapsBuilding()` check, pass buildings array from ChunkManager
- **Files modified:** src/chunk/TreeGenerator.ts, src/chunk/ChunkManager.ts
- **Verification:** Visual confirmation - trees no longer overlap buildings

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Bug fixes essential for visual correctness. No scope creep.

## Issues Encountered

None beyond the tree placement bugs fixed above.

## Next Phase Readiness

- Phase 2 COMPLETE - procedural city generation working
- Four distinct district types visible when exploring
- Ready for Phase 3: Driving & Collision

---
*Phase: 02-procedural-city*
*Completed: 2025-12-15*
