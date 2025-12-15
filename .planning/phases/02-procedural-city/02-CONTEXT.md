# Phase 2: Procedural City - Context

**Gathered:** 2025-12-15
**Status:** For planning

<phase_objectives>
## What This Phase Accomplishes

Implement chunk-based procedural city generation with varied districts and stylized low-poly visuals.

**Primary goal:**
Infinite explorable city that generates around the player as they drive. Chunks spawn/despawn based on player position. Roads form a grid-with-variation network. Buildings, trees, and props populate chunks based on district type.

**Secondary goals:**
- District variety: downtown (tall buildings), suburbs (houses), industrial (warehouses), parks (trees/open space)
- Stylized low-poly aesthetic for buildings and props
- Fog to hide generation edges and create atmosphere
- Balanced performance with reasonable density

**Out of scope:**
- District transition blending (hard boundaries acceptable for now)
- Traffic/AI vehicles (Phase 4)
- Collision detection (Phase 3)
- Day/night cycle (Phase 5)
</phase_objectives>

<constraints>
## Constraints

**Technical:**
- Browser-based Three.js (established in Phase 1)
- Follow existing patterns from Phase 1 (scene.ts, modular files)
- Chunk system must integrate with existing scene/camera setup
- Seeded random for reproducible generation (same seed = same city)

**Timeline:**
None specified - quality over speed

**Resources:**
- Must maintain 30+ FPS on modern browsers
- Medium view distance (6-8 chunks visible)
- Keep recently visited chunks cached, unload distant ones

**Dependencies:**
- Phase 1 complete (basic car movement, scene setup)

**Other:**
None
</constraints>

<risks>
## Risks and Mitigation

**Risk 1: Performance degradation with many objects**
- **Likelihood:** Medium
- **Impact:** High (unplayable if frame rate drops)
- **Mitigation:** Instance meshes for repeated objects (buildings, trees). LOD consideration. Profile early and often. Chunk unloading for memory management.

**Risk 2: Procedural generation complexity**
- **Likelihood:** Medium
- **Impact:** Medium (could delay phase)
- **Mitigation:** Start with simple grid roads, add variation incrementally. Use established patterns (Perlin noise for district distribution). Research chunk-based generation before implementing.

**Risk 3: Visual coherence across chunks**
- **Likelihood:** Low
- **Impact:** Medium (jarring appearance)
- **Mitigation:** Seeded random ensures consistency. Road grid aligns at chunk boundaries. Building placement uses consistent rules.

**Risk 4: Memory leaks from chunk lifecycle**
- **Likelihood:** Medium
- **Impact:** High (crashes after extended play)
- **Mitigation:** Proper Three.js disposal (geometry.dispose(), material.dispose()). Track all created objects. Test extended play sessions.
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] Chunks generate as player approaches
- [ ] Chunks unload when player moves away (with caching)
- [ ] Roads form connected grid-with-variation network
- [ ] Buildings spawn in appropriate districts
- [ ] Trees/parks appear in designated areas
- [ ] Same seed produces identical city layout

**Quality:**
- [ ] Maintains 30+ FPS with 6-8 visible chunks
- [ ] No visible popping/loading artifacts (fog hides edges)
- [ ] Buildings have stylized low-poly look
- [ ] Districts are visually distinct
- [ ] No TypeScript errors
- [ ] No memory leaks after 5+ minutes of driving

**Visual:**
- [ ] Downtown has tall varied buildings
- [ ] Suburbs have smaller residential structures
- [ ] Industrial has warehouses/factories
- [ ] Parks have trees and open grass
- [ ] Fog creates atmosphere and hides generation

**Technical:**
- [ ] Modular code structure (separate files for chunk manager, generators, etc.)
- [ ] Seeded RNG used throughout
- [ ] Proper Three.js object disposal on chunk unload
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
Established codebase - Phase 1 complete with working car movement and scene setup.

**Relevant files/systems:**
- `src/scene.ts` - Main scene setup, animation loop, camera following - will need modification to integrate chunk system
- `src/car.ts` - Car position used to determine which chunks to load
- `src/main.ts` - Entry point
- `src/input.ts` - Input handling (no changes needed)

**Patterns to follow:**
- Modular TypeScript files (one concern per file)
- THREE.js patterns established in scene.ts
- WeakMap for associating data with meshes (from car.ts)
- Quaternion-based calculations (from camera follow)

**External dependencies:**
- Three.js (already installed)
- Vite for bundling (already configured)

**Known issues to address:**
- Current ground plane is fixed 100x100 - needs to be replaced by chunk system
- Camera far plane is 1000 - may need adjustment for fog

**Prior decisions affecting this phase:**
- WeakMap for physics state - can use similar pattern for chunk metadata
- Quaternion-based camera - chunk loading should use car position, not camera
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

**Decision 1: Chunk size**
- **Context:** Affects generation granularity and performance
- **Options:** 32x32 units / 64x64 units / 128x128 units
- **When to decide:** During planning (affects all generation code)

**Decision 2: District distribution algorithm**
- **Context:** How to determine which district type a chunk belongs to
- **Options:** Perlin noise regions / Voronoi cells / Distance from origin / Manual zones
- **When to decide:** During planning (core architecture decision)

**Decision 3: Road network approach**
- **Context:** Grid-with-variation needs specific implementation
- **Options:** Pre-computed grid with noise offsets / Runtime road generation per chunk / Hierarchical (main roads + side streets)
- **When to decide:** During planning (affects road and building placement)
</decisions_needed>

<notes>
## Additional Context

[Questions asked during intake:]
- Q: What district types should the procedural city include?
- A: Downtown, suburbs, industrial, parks/green spaces

- Q: How should roads be generated?
- A: Grid with variation - mostly grid but some diagonal/curved for variety

- Q: What's the performance priority?
- A: Balanced - reasonable density with acceptable occasional pauses

- Q: Codebase state?
- A: Follow established patterns from Phase 1

- Q: Building/object types?
- A: Stylized low-poly - simple but visually distinctive

- Q: View distance?
- A: Medium (6-8 chunks) with fog

- Q: Chunk unloading?
- A: Keep recently visited chunks cached

- Q: District boundaries?
- A: Not concerned yet - hard boundaries acceptable, transitions can come later

[Clarifications:]
- Performance is balanced priority - don't sacrifice either smoothness or density completely
- Low-poly stylized aesthetic is the visual target
- District transitions are explicitly deferred

[References:]
- Three.js InstancedMesh for performance: https://threejs.org/docs/#api/en/objects/InstancedMesh
- Chunk-based terrain generation patterns
</notes>

---

*Phase: 02-procedural-city*
*Context gathered: 2025-12-15*
*Ready for planning: yes*
