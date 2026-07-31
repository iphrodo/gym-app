## Context

See proposal.md - Why. `public/favicon.svg` is the referenced-but-missing file; `public/favicon.png` and `public/apple-touch-icon.png` exist today at 2048x2048 (no size variants, no manifest-sized PNGs). No image tooling is installed except macOS's built-in `sips`, which can rasterize SVG to PNG (`sips -s format png in.svg --out out.png`) but cannot resize during SVG rasterization in one step reliably for arbitrary target sizes and cannot produce `.ico` files — so PNG is the fallback format everywhere `.ico` might traditionally be used.

## Goals / Non-Goals

**Goals:**
- One source SVG drives every generated raster size, so the art never drifts across files.
- Cover the three consumption paths: browser tab (SVG-capable and not), iOS home screen, Android/desktop PWA install.

**Non-Goals:**
- Generating a `.ico` multi-resolution file — not available without additional tooling, and not required since `app/layout.tsx` already targets `/favicon.svg` + PNG, not `.ico`.
- Maskable/adaptive icon variants (Android's safe-zone padding for maskable icons) — the source art already has generous padding around the dumbbell within its 1024x1024 canvas, so plain icons are good enough for this change; can be revisited if Android home-screen cropping looks wrong in practice.

## Decisions

- Use `public/favicon.svg` (the exact source asset) as-is for browsers with SVG favicon support — no edits, since it already matches the requested design exactly.
- Rasterize PNG fallbacks from the SVG via `sips`, at these sizes:
  - `public/favicon.png` — 48x48 (favicon tab fallback size; sufficient for the simple flat-color glyph, avoids shipping a 2048px file for a ~16-48px use case)
  - `public/apple-touch-icon.png` — 180x180 (Apple's documented recommended size)
  - `public/icon-192.png`, `public/icon-512.png` — new files, the two sizes Chrome's install criteria check for in a manifest
- Generation command per size: `sips -s format png -z <h> <w> favicon.svg --out <target>.png` (verified `sips` can rasterize the SVG directly; resize flags apply post-rasterization at output).
- Update `public/manifest.json`'s `icons` array to list the SVG (`sizes: "any"`) plus the 192/512 PNGs, so installers with either preference find a match.
- Leave `app/layout.tsx` untouched — its `metadata.icons` already points at `/favicon.svg` and `/apple-touch-icon.png`; only the files themselves were missing/wrong-sized.

## Risks / Trade-offs

- [Risk] `sips`-rasterized PNGs from SVG could look slightly different (anti-aliasing) than a dedicated SVG renderer (e.g. rsvg-convert/Chrome headless) → Mitigation: visually check each generated PNG after generation; the source art is simple flat rounded rectangles, low risk of rendering artifacts.
