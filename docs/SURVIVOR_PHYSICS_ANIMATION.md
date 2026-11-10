# Survivor Movement and Animation Foundation

This milestone prepares the movement layer for later boats, swimming, wildlife interactions and the final pixel-art pass.

## Server-owned movement
- Input remains intent-only; the server owns position and velocity.
- Acceleration ramps toward the biome/weather-adjusted target speed.
- Releasing input applies friction instead of stopping instantly.
- Diagonal input is normalized before acceleration.
- X/Y collision checks remain separate so movement can slide along obstacles.
- Large frame steps are clamped to keep movement stable after a delayed tick.

## Client presentation
- Remote survivors interpolate toward authoritative snapshot positions.
- Directional walk animation follows replicated velocity, with speed-scaled playback.
- Idle retains the last facing direction and uses the matching idle frame.
- This is a presentation foundation, not the final character-art pass. Expanded idle, tool-use, farming, boat, swim and animal-interaction sprite sets belong in the later visual milestone.

## Validation still required
Run `npm test` and `npm run check`, then test movement and collision on desktop and mobile. Measure snapshot smoothness with multiple nearby players. Do not treat this foundation as a completed boat/swimming physics system.
