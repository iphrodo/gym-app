## 1. Tokens

- [ ] 1.1 Define surface tokens (page, card, inverted card, input, muted) in `@theme`, each pairing a background with a foreground, muted foreground, and border
- [ ] 1.2 Confirm tokens flip correctly under `prefers-color-scheme: dark`
- [ ] 1.3 Leave existing hardcoded classes in place for now — this step adds tokens without using them yet

## 2. Typography fix

- [ ] 2.1 Remove the `body { font-family: Arial... }` rule from [app/globals.css](app/globals.css)
- [ ] 2.2 Remove the compensating `font-sans` class from all nine views
- [ ] 2.3 Verify Geist renders everywhere and nothing falls back to a system font

## 3. Primitives

- [ ] 3.1 Add `Button` covering the primary (black), secondary, and destructive variants in use today
- [ ] 3.2 Add `IconButton` for the pencil/trash/chevron controls, replacing the 9 inline SVGs with a shared icon module
- [ ] 3.3 Add `Card` and an inverted-card variant for the recent-workouts carousel
- [ ] 3.4 Add `Screen` and `ScreenHeader` (back action, centred title, optional trailing actions) replacing the five repeated header layouts and their inconsistent spacer widths
- [ ] 3.5 Add `Field` (label + input/textarea, error state) for form inputs
- [ ] 3.6 Add `EmptyState` for the "no results yet" / "no recorded exercises" messages

## 4. Feedback system

- [ ] 4.1 Add a message provider rendering a non-blocking, dismissible, ARIA-live-announced toast
- [ ] 4.2 Add a confirmation dialog using the native `<dialog>` element, with focus trapped while open and restored to the trigger on close
- [ ] 4.3 Verify the dialog closes on Escape and on an outside click without confirming

## 5. Convert WorkoutView first

- [ ] 5.1 Rebuild [components/WorkoutView.tsx](components/WorkoutView.tsx) on the primitives and surface tokens, removing hardcoded `zinc` classes
- [ ] 5.2 Replace the multi-line comment input's remaining styling with the `Field` primitive
- [ ] 5.3 Verify in both light and dark system preference that entered text is legible in every field
- [ ] 5.4 Update [components/WorkoutView.test.ts](components/WorkoutView.test.ts) (or its `.tsx` successor from the harness change) to assert rendered contrast rather than the `text-zinc-900` class

## 6. Convert the remaining components

- [ ] 6.1 `AuthView`: primitives, tokens, and in-app error/success messages replacing `alert()`
- [ ] 6.2 `HomeView`: primitives and tokens; move the `<style jsx>` scrollbar rule into a stylesheet utility class; add the missing `"use client"` directive; delete confirmation via the dialog
- [ ] 6.3 `CycleView`: primitives and tokens; delete confirmation via the dialog
- [ ] 6.4 `CycleFormView`: primitives, `Field` for inputs, in-app validation message for a missing name (with focus moved to the field) replacing `alert()`
- [ ] 6.5 `StatsView`: primitives and tokens; chart colours drawn from tokens rather than hardcoded `zinc`/`green`
- [ ] 6.6 `CalendarView`: primitives and tokens for the grid, the day-picker dialog, and the "no workouts" state
- [ ] 6.7 Replace the remaining `alert()`/`confirm()` call sites in [app/page.tsx](app/page.tsx) (save failure, cycle save failure, "Supabase connection not added") with the message provider

## 7. Focus and accessibility pass

- [ ] 7.1 Verify every interactive control shows a visible focus indicator by keyboard, in both themes
- [ ] 7.2 Verify no `outline: none` or equivalent is applied without a replacement indicator
- [ ] 7.3 Verify toasts and dialog content are announced to assistive technology

## 8. Cleanup and verification

- [ ] 8.1 Remove every remaining hardcoded `zinc`/`green`/`red` class in favour of tokens; grep confirms none remain outside the token definitions
- [ ] 8.2 Confirm no `alert(` or `window.confirm(` call sites remain
- [ ] 8.3 Run `npm test`, `npx tsc --noEmit`, and `npm run lint` clean
- [ ] 8.4 Manual pass through every screen in both light and dark system preference
- [ ] 8.5 Manual keyboard-only pass through every screen, including the confirmation dialog
