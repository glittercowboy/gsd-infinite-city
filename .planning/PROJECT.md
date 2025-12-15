# Procedural City Driving Game

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

## Success Criteria

How we know v1 is done:

- [ ] Can drive around a procedurally generated city that spawns as you explore
- [ ] City has varied districts (downtown, suburbs, industrial, parks)
- [ ] Traffic AI cars populate roads, avoid the player, and react to collisions
- [ ] Day/night cycle with appropriate lighting changes
- [ ] Collision detection prevents driving through buildings/objects
- [ ] Maintains playable frame rates (30+ FPS) on modern browsers
- [ ] Deployed and publicly accessible on Vercel

## Scope

### Building
- Procedural city generation (chunk-based, spawns as you drive)
- Varied districts with different building densities and styles
- Different sized buildings (skyscrapers downtown, houses in suburbs)
- Trees, parks, and environmental props
- Arcade car physics (forgiving, fun, easy to control)
- Collision detection for buildings, props, and other vehicles
- Reactive traffic AI (follow roads, stop at lights, avoid player, honk)
- Day/night cycle with dynamic lighting
- Stylized-realistic visual style with good lighting

### Not Building (v1)
- No missions or objectives (pure sandbox exploration)
- No multiplayer
- No vehicle customization or alternative cars
- No unique landmarks or hand-crafted buildings
- No weather systems
- No pedestrians

## Context

Greenfield project starting from scratch. No existing code or prototypes.

Inspired by GTA-style open world driving and city exploration, adapted for the browser with procedural generation enabling infinite exploration without massive asset downloads.

## Constraints

- **Platform**: Web-only, must run in modern browsers
- **Deployment**: Vercel/Netlify static hosting
- **Performance**: Critical constraint—many objects on screen, must maintain playable FPS
- **Assets**: Procedural/generated where possible to minimize download size

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Engine | Three.js | Web-native, good ecosystem, portfolio-appropriate |
| Language | TypeScript | Type safety valuable for complex game logic |
| Physics style | Arcade | Fun over realism, forgiving controls |
| City scale | Infinite/chunked | Generated as you drive, endless exploration |
| Traffic AI depth | Reactive | Balance between simple and complex—aware of player |
| Visual style | Stylized-realistic hybrid | Good lighting, possibly cartoony, procedural-friendly |

## Open Questions

Things to figure out during execution:

- [ ] Which procedural city generation algorithm works best? (WFC, L-systems, grid-based?)
- [ ] How to implement reactive traffic AI efficiently?
- [ ] What LOD/culling strategies needed for performance?
- [ ] How to handle chunk loading/unloading smoothly?
- [ ] Best approach for collision detection with many objects?

---
*Initialized: 2025-12-15*
