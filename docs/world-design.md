# World Design

Updated: 2026-11-06

## Building Program

The primary scene is a three-storey glass-and-graphite architectural cutaway with an oak/steel frame, central elevator, connecting stairs, rooftop pergola, planters, and an exterior plaza. The building is shown as one connected headquarters; only Level 02, the Delivery floor, is active for navigation and employee interactions. Ground and Level 03 rooms are architectural plans, not active departments or services.

Ground · Business and People is planned with Reception & Waiting, Client Meeting, Knowledge Library, HR & Agent Academy, Operations & Finance, a kitchenette, and restrooms.

Level 02 · Delivery is active with Reception & Brief Intake, Project Management, Design Studio, Engineering, QA Lab, Content Studio, Owner Review, a kitchenette, an accessible restroom, and a project-review meeting room. The Receptionist sits at the Ground-floor lobby desk and is linked to the Reception & Intake agent; it shows real task state only when a persisted task exists.

Level 03 · Leadership and Media is planned with Founder Office, Command Room, Video Studio, Music Studio, Strategy Meeting, a kitchenette, and restrooms. The rooftop garden/pergola is architectural scenery, not an active department.

The source of truth is `FIRST_FLOOR_ROOMS`, `PLANNED_HEADQUARTERS_LEVELS`, `FLOOR_WALLS`, `FLOOR_FURNITURE_BLOCKERS`, and `DESK_POSITIONS` in `src/lib/operations/headquarters-model.ts`. The scene consumes those records for room geometry, floor labels, planned/active status, and navigation targets.

## Visual language

The headquarters uses an architectural cutaway with steel/graphite framing, warm ivory floors, oak trim, pale glass partitions, landscaped edges, restrained violet light at the lift, and procedural stylized people. Characters use shared primitive geometry with per-profile skin, hair, clothing, accent, and accessory values. No external character asset or unverified license is involved; the procedural models are replaceable starter art. The supplied visual reference is treated as direction for navigable geometry, never as a flat background.

Labels, employee identity, controls, and status remain HTML, not textures. Desktop uses an isometric/three-quarter perspective; orbit and zoom are bounded. The full building camera reframes declaratively when the viewport switches to a narrow aspect. Low-quality mode reduces pixel ratio and antialiasing; shadows are disabled. OS or user-selected reduced motion stops idle/typing movement.

## Navigation

The owner starts in Reception. Click-to-move uses a four-direction half-meter grid and breadth-first shortest paths. WASD and arrow movement use the same bounds and wall/furniture blockers with axis sliding. Inputs, buttons, and links cannot trigger movement; keyboard movement is active only while the canvas has focus. Room buttons provide direct destinations. Walking and animation never affect worker execution.

The `List` view is the non-3D alternative for keyboard, screen-reader, and small-screen use. It offers room navigation, persisted employee profiles, statuses, and the same interaction panel. On narrow screens, tiny in-world labels are hidden and all names/statuses remain available in the directory. WebGL failure has a list-view fallback.

## View Modes

The HQ selector has four modes: **Whole Building**, **Ground**, **Delivery**, and **Leadership**. Whole Building renders the complete three-storey cutaway with all seven staff/owner profiles on Delivery. Ground and Leadership isolate and recenter the selected floor while keeping all rooms marked planned and rendering no employee profiles or workflow state. Delivery isolates the active level, keeps click-to-move and keyboard navigation, and exposes the ten-room quick-navigation list. The same floor/room selection is available in List mode.

## State and future floors

All three storeys are data-driven architecture; `CharacterProfile` persists employee identity and desk placement. Player position, camera orbit, and animation are client-only. Ground and Level 03 remain marked planned and have no worker, task, or enabled department state until their contracts, navigation, interfaces, and tests are implemented.