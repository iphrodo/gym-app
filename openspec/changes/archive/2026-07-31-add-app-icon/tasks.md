## 1. Source asset

- [x] 1.1 Copy the new dumbbell SVG to `public/favicon.svg`

## 2. Raster fallbacks

- [x] 2.1 Generate `public/favicon.png` (48x48) from `public/favicon.svg` via `sips`
- [x] 2.2 Generate `public/apple-touch-icon.png` (180x180) from `public/favicon.svg` via `sips`
- [x] 2.3 Generate `public/icon-192.png` (192x192) from `public/favicon.svg` via `sips`
- [x] 2.4 Generate `public/icon-512.png` (512x512) from `public/favicon.svg` via `sips`
- [x] 2.5 Visually spot-check each generated PNG for rendering artifacts

## 3. Manifest

- [x] 3.1 Update `public/manifest.json` icons array to include the SVG plus the 192/512 PNGs



## 4. Verification

- [x] 4.1 Run `npm test` and `npx tsc --noEmit` to confirm nothing else broke