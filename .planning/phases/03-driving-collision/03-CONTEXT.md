# Phase 3: Driving & Collision - Context

**Gathered:** 2025-12-15
**Status:** For planning

<phase_objectives>
## What This Phase Accomplishes

Add arcade-style collision detection to the procedurally generated city.

**Primary goal:**
Car collides with all solid objects (buildings, trees, future props) and bounces off with reduced speed - classic arcade feel.

**Secondary goals:**
- Efficient collision detection that scales with procedural world
- Smooth bounce response that feels satisfying

**Out of scope:**
- Physics overhaul (current driving feel is fine)
- Drift/skid mechanics (deferred)
- Jump/airtime mechanics (deferred)
- Destructible objects
</phase_objectives>

<constraints>
## Constraints

**Technical:**
- Must use spatial partitioning for efficiency with many procedural objects
- Collision only checks current chunk (not adjacent chunks) - simplifies implementation
- Must integrate with existing ChunkManager and InstancedMesh building system
- Performance target: maintain 30+ FPS with collision checks

**Timeline:**
- Blocking Phase 4 (Traffic AI needs collision for vehicle-vehicle interactions)

**Resources:**
None

**Dependencies:**
- Phase 2 complete (chunk system, buildings, trees exist)
- Current car physics working (WeakMap-based state management)

**Other:**
None - flexible approach within arcade collision scope
</constraints>

<risks>
## Risks and Mitigation

**Risk 1: InstancedMesh collision complexity**
- **Likelihood:** Medium
- **Impact:** Medium (may need to rethink building collision approach)
- **Mitigation:** Buildings use InstancedMesh for rendering but collision can use simpler bounding box array stored per chunk. Don't need to collide with actual mesh geometry.

**Risk 2: Performance with many collision checks**
- **Likelihood:** Low (spatial partitioning mitigates)
- **Impact:** High (would break gameplay)
- **Mitigation:** Only check objects in current chunk. Use simple AABB (axis-aligned bounding box) collision, not complex geometry. Profile early.

**Risk 3: Bounce physics feeling wrong**
- **Likelihood:** Medium
- **Impact:** Low (tuning issue, not architectural)
- **Mitigation:** Start with simple velocity reflection, tune bounce coefficient. Can iterate quickly on feel.
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] Car bounces off buildings
- [ ] Car bounces off trees
- [ ] Bounce reduces speed appropriately
- [ ] No clipping through objects

**Quality:**
- [ ] 30+ FPS maintained with collision active
- [ ] No TypeScript errors
- [ ] Collision feels responsive (no lag between impact and bounce)

**Deployment:**
- [ ] Changes work in dev server
- [ ] Build succeeds

**User-facing:**
- [ ] Driving into buildings/trees feels arcade-satisfying
- [ ] Can navigate tight spaces without frustration
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
Established codebase - Phase 2 complete with chunk-based procedural city.

**Relevant files/systems:**
- `src/car.ts` - Car physics with WeakMap state management, quaternion-based movement
- `src/chunk.ts` - ChunkManager with building/tree generation, InstancedMesh rendering
- `src/main.ts` - Game loop, animation frame handling

**Patterns to follow:**
- WeakMap for physics state (established in Phase 1)
- Chunk-based spatial organization (64-unit chunks)
- Per-chunk data storage (buildings already stored per chunk for rendering)

**External dependencies:**
- Three.js - Box3 for AABB collision, Vector3 for bounce calculations

**Known issues to address:**
None from prior phases.

**Prior decisions affecting this phase:**
- Chunk size 64 units - collision spatial partitioning aligns with this
- One InstancedMesh per chunk - need separate collision data structure (bounding boxes)
- Trees avoid roads and building footprints - collision data can reuse placement logic
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

**Decision 1: Collision data structure**
- **Context:** Need efficient lookup of collidable objects near car
- **Options:** Array of Box3 per chunk / Spatial hash within chunk / Simple radius filter
- **When to decide:** During planning

**Decision 2: Bounce coefficient tuning**
- **Context:** How much speed to preserve on collision
- **Options:** 0.3 (punishing) / 0.5 (balanced) / 0.7 (forgiving)
- **When to decide:** During implementation, iterate to feel
</decisions_needed>

<notes>
## Additional Context

[Questions asked during intake:]
- Q: What objects should the car collide with?
- A: Everything solid (buildings, trees, future objects)

- Q: How should collisions feel?
- A: Bounce off - classic arcade feel

- Q: What physics improvements beyond collision?
- A: None - current driving feel is fine, just add collision

- Q: How should collision detection handle many procedural objects?
- A: Spatial partitioning - only check nearby objects per chunk

- Q: What should happen at chunk boundaries?
- A: Current chunk only - simpler implementation

[Clarifications:]
- Focus purely on collision, no physics overhaul
- Performance via spatial partitioning, not complex optimizations
- Arcade feel = satisfying bounce, not realistic crash physics
</notes>

---

*Phase: 03-driving-collision*
*Context gathered: 2025-12-15*
*Ready for planning: yes*
