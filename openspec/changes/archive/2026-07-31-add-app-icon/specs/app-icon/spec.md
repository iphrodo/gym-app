## Purpose

Defines how the app's icon (a dumbbell mark) SHALL appear as a browser tab favicon and as the app's icon when a user adds it to their iPhone, Android, or desktop home screen.

## ADDED Requirements

### Requirement: Browser Tab Favicon
The app SHALL present a favicon in the browser tab across browsers, using a scalable source with a raster fallback.

#### Scenario: Browser supports SVG favicons
- **WHEN** a browser that supports SVG favicons (e.g. Chrome, Firefox, Edge) loads the app
- **THEN** the tab icon renders from `/favicon.svg`, matching the dumbbell mark at any tab size without pixelation

#### Scenario: Browser does not support SVG favicons
- **WHEN** a browser without SVG favicon support loads the app
- **THEN** a PNG favicon fallback is served and displays the same dumbbell mark

### Requirement: iPhone Home Screen Icon
The app SHALL provide a correctly sized icon for iOS "Add to Home Screen".

#### Scenario: Add to Home Screen on iPhone
- **WHEN** a user adds the app to their iPhone home screen
- **THEN** the home screen icon is a 180x180 PNG (`/apple-touch-icon.png`) showing the dumbbell mark, not a blank, broken, or heavily downscaled image

### Requirement: Android and Desktop PWA Install Icon
The app's manifest SHALL declare icon sizes sufficient for Android and desktop "Install app" / "Add to Home Screen" flows to pick an appropriately sized icon.

#### Scenario: Install prompt on Android or desktop Chrome
- **WHEN** a user installs the app via a Chromium-based browser's install prompt
- **THEN** the manifest provides at least a 192x192 and a 512x512 PNG icon, and the installed app's icon shows the dumbbell mark at the resolution the OS requests
