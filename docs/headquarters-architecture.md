# Headquarters architectural redesign

The headquarters is now a contemporary studio concept with an actual building envelope, a shared stair and lift core, an arrival forecourt, a partial roof terrace, and three aligned occupied floors. It opens on the whole building; each floor remains separately explorable.

The material palette is limestone, concrete, oak, walnut, dark metal, and lightly tinted glazing. Local procedural textures, physical materials, directional daylight and shadows, and an optional evening lighting state replace the flat, uniformly pastel treatment. No remote model, HDR, texture CDN, or generated background image is required.

Room planning is centralized in `src/lib/operations/headquarters-architecture.ts`. Stable room keys preserve saved employee assignments. North and south room fronts face the main circulation route. Door openings, room transforms, navigation footprints, workstation placement, and room metadata derive from the same plan. The Delivery reception alcove and service access were resized after path verification identified blocked circulation.

The fit-outs reflect their functions: paired workstations, design sample shelving and layout tables, quiet content seating, eight-seat review tables, an operational library, video cyclorama/camera/lighting, and an audio mixing desk, keyboard, monitors, and acoustic slats. People use smaller anatomical heads, articulated limbs, seated desk poses, saved appearance colors, and selectable profile labels. A seated placement represents the employee's assigned station, not live occupancy or evidence of work.

The owner can switch Daylight/Evening, Spatial/Plan, room labels, floor, room focus, graphics quality, motion, and the existing directory. Selected rooms explain their purpose, concept floor area, finish, and designed seating. Areas and seating describe a virtual architectural concept; this is not a surveyed building, code-compliance assessment, or construction drawing.

A continuous camera clock avoids initialization races. The final visible render pass is capped at 24 frames per second (15 in Low graphics), skips hidden documents, and preserves the drawing buffer. Reflections use a local equirectangular map rather than an offscreen portal or shadow prepass. Repeated plant leaves use instanced geometry. Textures and sign resources are disposed when their components unmount. The existing reduced-motion preference, keyboard walking, canvas fallback, and non-3D directory remain available.

No backend behavior, external services, production data, or deployment is changed by the visual redesign.

## Verification

The isolated Webpack production build and its TypeScript check pass. Focused scene/component lint passes. The operation suite passed 74 tests with six data/HTTP scenarios skipped in this visual-only run; the 12 headquarters/governance checks were rerun after the final layout edits and pass, including clear paths to all 24 room entrances. No configured database or AI provider was accessed.

The local preview serves successfully with external data disabled. Browser inspection confirmed the revised interface, floor selection and room metadata; one continuously rendered room view showed the new glazing, materials, furniture, and lighting. The initial offscreen-pass pipeline produced blank surfaces in captured views and was replaced with the final capped visible render pass and local reflection map. Repeated native window-capture failures prevented final visual acceptance of the complete building, evening, plan, characters, and mobile views. These views remain to be visually verified; no screenshot-based approval is claimed. Temporary preview servers were stopped.
