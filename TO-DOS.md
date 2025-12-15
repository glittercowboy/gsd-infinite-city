# TO-DOS

<todo timestamp="2025-12-15 11:53" title="Shift key nitrous speedboost for car">
<action>Add nitrous boost mechanic</action>
<description>Implement shift key as nitrous/speedboost that temporarily increases car speed beyond normal maxSpeed</description>
<problem>Car currently has fixed maxSpeed of 100 with no boost mechanic for exciting gameplay moments</problem>
<files>src/car.ts:4-11, src/car.ts:47-55, src/car.ts:60-105, src/input.ts</files>
<solution>Add boost property to CarPhysics interface, track shift key in InputState, apply multiplier to maxSpeed when shift held, consider adding boost fuel/cooldown for balance</solution>
</todo>

<todo timestamp="2025-12-15 11:54" title="Add padding to tree spawn near roads">
<action>Fix tree spawn road collision</action>
<description>Add padding/buffer zone between tree spawns and road edges so trees don't appear right at road boundaries</description>
<problem>Trees spawn too close to road edges because isInRoad() only checks if tree center is inside road, not accounting for tree radius</problem>
<files>src/chunk/TreeGenerator.ts:16-22, src/chunk/TreeGenerator.ts:86-95</files>
<solution>Modify isInRoad() to accept tree radius parameter and check if position + radius overlaps road (similar to overlapsBuilding), or add ROAD_PADDING constant to HALF_ROAD check</solution>
</todo>

<todo timestamp="2025-12-15 12:07" title="Screen shake on collision">
<action>Add collision screen shake effect</action>
<description>Implement subtle camera shake when car collides with objects (buildings, trees) for tactile feedback</description>
<problem>Collisions feel flat without visual feedback - no sense of impact</problem>
<files>src/main.ts, src/car.ts</files>
<solution>Add collision detection to car update, trigger camera offset shake with decay (randomized x/y offset that lerps back to zero), could use trauma/shake intensity system</solution>
</todo>

<todo timestamp="2025-12-15 12:07" title="Speed blur/motion blur effect">
<action>Add speed-based motion blur</action>
<description>Implement radial/directional blur effect that intensifies with speed and nitrous boost for immersion</description>
<problem>High speed doesn't feel fast visually - needs post-processing feedback</problem>
<files>src/main.ts</files>
<solution>Use Three.js post-processing (EffectComposer with radial blur or motion blur pass), intensity driven by car speed ratio to maxSpeed, extra intensity during nitrous boost</solution>
</todo>

<todo timestamp="2025-12-15 12:34" title="Traffic lights and traffic AI intelligence">
<action>Implement traffic light system with AI behavior</action>
<description>Add red/green traffic lights at intersections and make AI traffic cars respond to light states (stop on red, go on green)</description>
<problem>Traffic simulation lacks realistic behavior - cars just follow lanes without intersection awareness or stopping logic</problem>
<files>src/traffic/TrafficManager.ts, src/traffic/types.ts, src/chunk/RoadNetwork.ts</files>
<solution>Create TrafficLight class tracking state and timer, place at intersections, add stop-zone detection in lane-follow logic, AI cars check upcoming light state and decelerate to stop before red lights</solution>
</todo>

<todo timestamp="2025-12-15 12:34" title="Traffic car collision with player car">
<action>Implement player-traffic collision detection</action>
<description>Add collision detection between player car and AI traffic cars with appropriate response (bounce, damage, or crash)</description>
<problem>Player car can drive through traffic cars without any interaction - breaks immersion and removes gameplay stakes</problem>
<files>src/traffic/TrafficManager.ts, src/car.ts, src/main.ts</files>
<solution>Extend existing Box3 collision system to include traffic car instances, apply MTV separation and arcade bounce physics similar to building collision, optionally add damage/crash state</solution>
</todo>

<todo timestamp="2025-12-15 12:49" title="Add wheels and headlights to traffic cars">
<action>Add wheels and headlights to AI traffic cars</action>
<description>Give traffic cars visible wheels and headlights matching the player car's visual style</description>
<problem>Traffic cars are plain colored boxes without wheels or headlights, making them look less polished than the player car</problem>
<files>src/traffic/TrafficManager.ts</files>
<solution>Create separate InstancedMesh for wheels and headlights per traffic car, position relative to car body instances, update transforms alongside car body in animation loop</solution>
</todo>

<todo timestamp="2025-12-15 12:49" title="Implement brakelights on all cars">
<action>Add functional brakelights</action>
<description>Implement rear brakelights that illuminate when cars are braking (player car on reverse/brake input, traffic cars when decelerating)</description>
<problem>No visual feedback when cars brake - reduces realism and makes traffic behavior harder to read</problem>
<files>src/car.ts, src/traffic/TrafficManager.ts</files>
<solution>Add red emissive material for brakelights, toggle emissive intensity based on brake state (player: S key or braking, traffic: speed decreasing or approaching red light)</solution>
</todo>

<todo timestamp="2025-12-15 12:49" title="Improve car shapes from rectangles">
<action>Upgrade car geometry from boxes to car shapes</action>
<description>Replace simple box geometry with more car-like shapes (tapered hood, cab section, trunk) for both player and traffic cars</description>
<problem>Cars are plain rectangles/boxes which looks primitive and unpolished</problem>
<files>src/car.ts, src/traffic/TrafficManager.ts</files>
<solution>Create compound geometry with multiple boxes or use BufferGeometry to shape hood slope, windshield angle, and trunk - keep low-poly aesthetic but add recognizable car silhouette</solution>
</todo>

<todo timestamp="2025-12-15 12:51" title="Sun and moon with realistic movement">
<action>Add sun and moon celestial system</action>
<description>Implement visible sun and moon objects that move across the sky in a realistic day/night cycle arc</description>
<problem>Scene lacks celestial bodies - sky feels empty and there's no visual day/night progression indicator</problem>
<files>src/main.ts</files>
<solution>Create sun (yellow emissive sphere) and moon (gray/white sphere) meshes, animate position on circular/elliptical path around scene center, sync with existing lighting/sky color system if present, consider 180-degree arc for each to simulate horizon rise/set</solution>
</todo>

<todo timestamp="2025-12-15 12:53" title="Terrain elevation with hills and mountains">
<action>Add Z-axis terrain variation</action>
<description>Implement height variation in terrain with rolling hills and mountains instead of flat ground plane</description>
<problem>World is completely flat - lacks visual interest and realistic terrain feel</problem>
<files>src/main.ts, src/chunk/ChunkManager.ts</files>
<solution>Use noise function (simplex/perlin) to generate heightmap, apply to ground plane vertices or create PlaneGeometry with displacement, adjust car physics to follow terrain height, consider separate height scales for hills vs mountains</solution>
</todo>

<todo timestamp="2025-12-15 12:53" title="Nature areas with lakes and forests">
<action>Add large nature biomes</action>
<description>Create designated nature areas outside city with dense forests and lakes as distinct biomes</description>
<problem>World is uniform city/roads - needs natural areas for variety and exploration interest</problem>
<files>src/chunk/ChunkManager.ts, src/chunk/TreeGenerator.ts, src/chunk/DistrictGenerator.ts</files>
<solution>Extend district system to include nature biome type, nature districts spawn dense tree clusters and water planes (blue reflective material) for lakes, reduce/eliminate roads and buildings in nature biomes</solution>
</todo>

<todo timestamp="2025-12-15 12:55" title="Add windows and doors to buildings">
<action>Add architectural details to buildings</action>
<description>Add windows (grid pattern) and doors (ground floor entrance) to all building types for visual detail</description>
<problem>Buildings are solid colored boxes without any surface detail - looks primitive and unrealistic</problem>
<files>src/chunk/BuildingGenerator.ts</files>
<solution>Use texture atlas with window/door patterns, or add InstancedMesh planes for windows at regular intervals per floor, add single door mesh at ground level facing road, vary window density by building type</solution>
</todo>

<todo timestamp="2025-12-15 12:55" title="Differentiate houses from skyscrapers">
<action>Create distinct building type visuals</action>
<description>Make residential houses look house-like (pitched roofs, porches, yards) and skyscrapers look like skyscrapers (glass facades, flat roofs, antenna)</description>
<problem>All buildings use same box geometry regardless of type - residential and commercial look identical</problem>
<files>src/chunk/BuildingGenerator.ts, src/chunk/DistrictGenerator.ts</files>
<solution>Residential: add triangular prism roof, front porch geometry, smaller footprint. Skyscrapers: add reflective glass material, rooftop details (HVAC, antenna), setback tiers on taller buildings. Use district type to determine which style spawns</solution>
</todo>

<todo timestamp="2025-12-15 12:55" title="Add shop buildings with storefronts">
<action>Implement shop/retail building type</action>
<description>Add shop buildings with storefronts (awnings, signage, display windows) as distinct commercial building type</description>
<problem>No retail/shop buildings in city - only generic residential and office types</problem>
<files>src/chunk/BuildingGenerator.ts, src/chunk/DistrictGenerator.ts</files>
<solution>Create shop building type: 1-2 stories, wide storefront windows at ground level, awning overhang geometry, colored signage planes above entrance. Spawn in commercial/mixed-use districts along road frontage</solution>
</todo>
