## Why

The app's icon references are already broken: `app/layout.tsx` and `public/manifest.json` both point at `/favicon.svg`, but no such file exists in `public/` — only an oversized `favicon.png` and `apple-touch-icon.png` (2048x2048 each, no size variants). There's no correctly-sized Apple touch icon (180x180) and no manifest-sized PNGs (192x192, 512x512), so browser tabs, iPhone "Add to Home Screen", and desktop/Android PWA install all fall back to missing or oversized art instead of a crisp, on-brand icon. We're also replacing the icon artwork with a new dumbbell design at the same time.

## What Changes

- Add the new dumbbell SVG as the single source-of-truth icon at `public/favicon.svg`.
- Generate and add properly sized PNG fallbacks from that source: a browser-tab favicon PNG, a 180x180 `apple-touch-icon.png`, and 192x192/512x512 PNGs for the PWA manifest.
- Update `public/manifest.json`'s icon list to include the new sized PNG entries alongside the SVG.
- No change to `app/layout.tsx`'s icon metadata structure — it already points at the right paths (`/favicon.svg`, `/apple-touch-icon.png`); this change makes those paths resolve to real, correctly sized files instead of a 404/oversized fallback.

## Capabilities

### New Capabilities
- `app-icon`: the app's browser-tab favicon and home-screen/install icon across browsers, iPhone, and Android/desktop PWA install.

## Impact

- `public/favicon.svg` (new file), `public/favicon.png`, `public/apple-touch-icon.png` (replaced with correctly sized versions), plus new `public/icon-192.png` and `public/icon-512.png`.
- `public/manifest.json`: icons array updated.
- No app code changes — `app/layout.tsx` metadata is already correct once the referenced files exist at the right sizes.
