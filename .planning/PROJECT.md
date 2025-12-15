# Procedural City Driving Game

## Current State (Updated: 2025-12-15)

**Shipped:** v1.0 MVP (2025-12-15)
**Status:** Production (deployed to Vercel)
**URL:** https://youtube-gsd-demo.vercel.app
**Codebase:** 2,040 lines TypeScript, Three.js/Vite, Vercel static hosting

All v1 success criteria met:
- [x] Procedurally generated city that spawns as you explore
- [x] Varied districts (downtown, suburbs, industrial, parks)
- [x] Traffic AI cars populate roads, avoid player, react to collisions
- [x] Day/night cycle with appropriate lighting changes
- [x] Collision detection prevents driving through buildings/objects
- [x] Maintains playable frame rates on modern browsers
- [x] Deployed and publicly accessible on Vercel

---

<details>
<summary>Original Vision (v1.0 - Archived)</summary>

## Vision

A Three.js browser-based driving game featuring a procedurally generated sprawling city. Players explore an endless urban environment with varied districts, reactive traffic, and a day/night cycle. The game captures the open-world exploration feel of GTA in a web-native package.

This is a portfolio piece demonstrating procedural generation, real-time 3D graphics, and game AI—all running performantly in a browser. The visual style sits between low-poly stylized and realistic, with emphasis on good lighting that could lean slightly cartoony if it complements the procedural textures.

## Problem

Building an impressive portfolio piece that showcases:
- Procedural generation algorithms for infinite city exploration
- Traffic AI that feels alive and reactive
- Performance optimization for complex 3D scenes in the browser
- Modern Three.js/WebGL game development

The challenge is making all these systems work together smoothly while maintaining playable frame rates.

## Scope

### Built
- Procedural city generation (chunk-based, spawns as you drive)
- Varied districts with different building densities and styles
- Different sized buildings (skyscrapers downtown, houses in suburbs)
- Trees, parks, and environmental props
- Arcade car physics (forgiving, fun, easy to control)
- Collision detection for buildings, props, and other vehicles
- Reactive traffic AI (follow roads, avoid player)
- Day/night cycle with dynamic lighting
- Stylized-realistic visual style with good lighting

### Not Built (v1)
- No missions or objectives (pure sandbox exploration)
- No multiplayer
- No vehicle customization or alternative cars
- No unique landmarks or hand-crafted buildings
- No weather systems
- No pedestrians

## Constraints

- **Platform**: Web-only, runs in modern browsers
- **Deployment**: Vercel static hosting
- **Performance**: Maintained playable FPS with many objects on screen
- **Assets**: Procedural/generated to minimize download size

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Engine | Three.js | Web-native, good ecosystem, portfolio-appropriate |
| Language | TypeScript | Type safety valuable for complex game logic |
| Physics style | Arcade | Fun over realism, forgiving controls |
| City scale | Infinite/chunked | Generated as you drive, endless exploration |
| Traffic AI depth | Reactive | Balance between simple and complex—aware of player |
| Visual style | Stylized-realistic hybrid | Good lighting, procedural-friendly |

## Open Questions (Resolved)

- [x] Which procedural city generation algorithm? → Grid-based with simplex noise districts
- [x] How to implement reactive traffic AI efficiently? → InstancedMesh with lane-following
- [x] What LOD/culling strategies needed? → Distance-based update frequency
- [x] How to handle chunk loading/unloading? → ChunkManager with view distance + cache radius
- [x] Best approach for collision detection? → Box3 with MTV separation

</details>

---
*Initialized: 2025-12-15*
*v1.0 Shipped: 2025-12-15*
