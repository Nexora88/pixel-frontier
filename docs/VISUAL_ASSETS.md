# Original Pixel-Art Assets

All sprites in this folder are original Pixel Frontier assets and are not copied from another game.

## Character atlas
- File: public/assets/survivor-32.svg
- Cell size: 32×32; atlas: 128×128 (4 columns × 4 rows)
- Row order: down, left, right, up
- Each direction has four walk frames; the existing Phaser animation state machine plays them at 8 FPS.
- Palette: forest greens, warm leather browns, muted stone tones and a light scarf accent.

## Wildlife atlas
- File: public/assets/wildlife-32.svg
- Cell size: 32×32; atlas: 128×96 (4 columns × 3 rows)
- Row order: deer, rabbit, duck
- Four walk frames per species, played at 5 FPS.
- Tamed companions receive a separate gold ring in the scene; low hunger applies a subtle tint.

The SVG atlases use crisp pixel edges and transparent backgrounds. Keep the frame dimensions and row order aligned with WorldScene animation definitions when replacing or extending these assets.
