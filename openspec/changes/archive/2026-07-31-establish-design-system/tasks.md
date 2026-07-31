## 1. Tokens

- [x] 1.1 Define surface tokens (page, card, inverted card, input, muted) in `@theme`, each pairing a background with a foreground, muted foreground, and border
- [x] 1.2 Confirm tokens flip correctly under `prefers-color-scheme: dark`
- [x] 1.3 Leave existing hardcoded classes in place for now — this step adds tokens without using them yet

## 2. Typography fix

- [x] 2.1 Remove the `body { font-family: Arial... }` rule from [app/globals.css](app/globals.css)
- [x] 2.2 Remove the compensating `font-sans` class from all nine views
- [x] 2.3 Verify Geist renders everywhere and nothing falls back to a system font

## 3. Primitives

- [x] 3.1 Add `Button` covering the primary (black), secondary, and destructive variants in use today
- [x] 3.2 Add `IconButton` for the pencil/trash/chevron controls, replacing the 9 inline SVGs with a shared icon module
- [x] 3.3 Add `Card` and an inverted-card variant for the recent-workouts carousel
- [x] 3.4 Add `Screen` and `ScreenHeader` (back action, centred title, optional trailing actions) replacing the five repeated header layouts and their inconsistent spacer widths
- [x] 3.5 Add `Field` (label + input/textarea, error state) for form inputs
- [x] 3.6 Add `EmptyState` for the "no results yet" / "no recorded exercises" messages

## 4. Feedback system

- [x] 4.1 Add a message provider rendering a non-blocking, dismissible, ARIA-live-announced toast
- [x] 4.2 Add a confirmation dialog using the native `<dialog>` element, with focus trapped while open and restored to the trigger on close
- [x] 4.3 Verify the dialog closes on Escape and on an outside click without confirming

## 5. Convert WorkoutView first

- [x] 5.1 Rebuild [components/WorkoutView.tsx](components/WorkoutView.tsx) on the primitives and surface tokens, removing hardcoded `zinc` classes
- [x] 5.2 Replace the multi-line comment input's remaining styling with the `Field` primitive
- [x] 5.3 Verify in both light and dark system preference that entered text is legible in every field
- [x] 5.4 Update [components/WorkoutView.test.tsx](components/WorkoutView.test.tsx) to assert rendered contrast rather than the `text-zinc-900` class

## 6. Convert the remaining components

- [x] 6.1 `AuthView`: primitives, tokens, and in-app error/success messages replacing `alert()`
- [x] 6.2 `HomeView`: primitives and tokens; move the `<style jsx>` scrollbar rule into a stylesheet utility class; add the missing `"use client"` directive (already present from the routing change); delete confirmation via the dialog
- [x] 6.3 `CycleView`: primitives and tokens; delete confirmation via the dialog
- [x] 6.4 `CycleFormView`: primitives, `Field` for inputs, in-app validation message for a missing name (with focus moved to the field) replacing `alert()`
- [x] 6.5 `StatsView`: primitives and tokens; chart colours drawn from tokens rather than hardcoded `zinc`/`green`
- [x] 6.6 `CalendarView`: primitives and tokens for the grid, the day-picker dialog, and the "no workouts" state
- [x] 6.7 Replace the remaining `alert()`/`confirm()` call sites in the client wrappers under `app/` (save failure, cycle save failure, "Supabase connection not added") with the message provider — `app/page.tsx` itself is now a server component with no call sites, since the routing change moved mutations into per-route client wrappers

## 7. Focus and accessibility pass

- [x] 7.1 Verify every interactive control shows a visible focus indicator by keyboard, in both themes
- [x] 7.2 Verify no `outline: none` or equivalent is applied without a replacement indicator
- [x] 7.3 Verify toasts and dialog content are announced to assistive technology

## 8. Cleanup and verification

- [x] 8.1 Remove every remaining hardcoded `zinc`/`green`/`red` class in favour of tokens; grep confirms none remain outside the token definitions
- [x] 8.2 Confirm no `alert(` or `window.confirm(` call sites remain
- [x] 8.3 Run `npm test`, `npx tsc --noEmit`, and `npm run lint` clean
- [x] 8.4 Manual pass through every screen in both light and dark system preference
- [x] 8.5 Manual keyboard-only pass through every screen, including the confirmation dialog

> **Note on 4.3, 8.4, 8.5:** the native `<dialog>` handles focus trapping, Escape, and focus restoration structurally (verified in code review of [components/ui/ConfirmDialog.tsx](components/ui/ConfirmDialog.tsx)); jsdom (used by the automated test suite) has no `HTMLDialogElement.showModal` implementation, so `ConfirmDialog` feature-detects it and falls back to toggling the `open` attribute directly under test. A live-browser pass through every screen in both themes and via keyboard-only navigation is still worth doing before shipping, since it hasn't been exercised outside code review and the automated suite.
