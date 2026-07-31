## Why

There are no shared UI primitives. The card class string is repeated 7 times, the screen shell 9 times, the back button 5 times, and SVG icons are pasted inline 9 times — the edit pencil three times and the trash icon twice. Changing how a button looks means finding every button.

More seriously, the colour system is half-wired and actively producing bugs. [app/globals.css](app/globals.css) defines light and dark `--background`/`--foreground` tokens driven by `prefers-color-scheme`, but every view hardcodes light `zinc` classes and ignores them. Commit `ff62a5f` — "Fix invisible text in weight/reps/comment inputs" — was exactly this: inputs inheriting a light foreground onto a light background. It was fixed by adding `text-zinc-900` to three inputs, which patches those three and leaves the mechanism intact. The same class of bug will recur.

The same file also sets `body { font-family: Arial, Helvetica, sans-serif }`, overriding the Geist fonts [app/layout.tsx](app/layout.tsx) loads. Every view then re-adds `font-sans` to undo it, and anything that forgets renders in Arial.

Finally, all user feedback goes through `alert()` and `window.confirm()` — 9 call sites — which block the main thread, cannot be styled, look wrong on the mobile viewport this app is built for, and are awkward to assert on in tests.

## What Changes

- Add shared primitives — button, card, icon button, screen shell and header, form field, empty state — and replace the duplicated class strings with them.
- Extract inline SVGs into a single icon module.
- Replace hardcoded `zinc` classes with semantic colour tokens, so a colour decision is made once rather than per element.
- Wire dark mode properly across every surface, so the token block in `globals.css` either works everywhere or does not exist.
- Guarantee text/background contrast structurally, removing the class of bug that `ff62a5f` patched by hand.
- Remove the `body` font override so the loaded Geist fonts apply, and drop the compensating `font-sans` from every view.
- Replace `alert()` with non-blocking in-app messages and `window.confirm()` with an accessible confirmation dialog.
- Move the `<style jsx>` scrollbar-hiding block in [components/HomeView.tsx](components/HomeView.tsx) into the stylesheet.
- Add the missing `"use client"` directive to [components/HomeView.tsx](components/HomeView.tsx), which currently works only because its importer happens to be a client component.
- Give every interactive control a visible keyboard focus state.

## Capabilities

### New Capabilities

- `design-system`: Observable presentation guarantees — theme support, readable contrast, visible focus, intended typography, and non-blocking feedback.

### Modified Capabilities

- `authentication`: sign-in and sign-up failures and successes are reported in the app rather than through a blocking browser alert.
- `training-cycles`: the missing-name validation message and the delete confirmation move from browser dialogs to in-app UI.

## Impact

- **Changed files:** every component in [components/](components/), [app/globals.css](app/globals.css), and [app/layout.tsx](app/layout.tsx).
- **New files:** primitives under `components/ui/`, an icon module, and a feedback/confirmation provider.
- **Dependencies:** none required. Whether to adopt a headless dialog library for the confirmation modal's focus management is a decision recorded in design.md.
- **Tests:** [components/WorkoutView.test.ts](components/WorkoutView.test.ts) asserts on the literal class `text-zinc-900`, which this change removes in favour of tokens. It is rewritten to assert rendered contrast — the harness change already flagged this test as needing exactly this treatment.
- **Sequencing:** last in the refactor sequence. Restyling components whose props and structure are still changing would mean doing it twice, so it follows the routing change.
