## Context

See proposal.md — Why.

The important thing to understand about the colour problem is that it is not a set of mistakes; it is a mechanism that produces mistakes. [app/globals.css](app/globals.css) declares `--background`/`--foreground` and flips them under `prefers-color-scheme: dark`, then applies them to `body`. Every view then paints `bg-zinc-50` over that body and sets its own `text-zinc-900`. So the tokens are live but overridden almost everywhere — except where a view forgets, which is where the token shows through against a hardcoded background. Commit `ff62a5f` is that failure: inputs took the dark-theme `--foreground` against a hardcoded `bg-zinc-50`. It was fixed by adding `text-zinc-900` to three inputs.

That fix is correct and does not generalise. Any new input on any surface is one omission away from the same result. The design goal is therefore not "fix the dark mode bugs" but "make it impossible to state a background without also determining a legible foreground".

The second relevant fact: [components/WorkoutView.test.ts](components/WorkoutView.test.ts) currently asserts that inputs with `bg-zinc-50` also carry `text-zinc-900`. It is a test of the workaround. This change removes both the class and the reason for the test, and `add-component-test-harness` already anticipated this by rewriting it to assert rendered contrast rather than a class string.

## Goals / Non-Goals

**Goals:**

- Colour decided once per semantic role, not per element.
- Foreground and background chosen together, so a surface cannot be half-themed.
- One definition per UI primitive.
- Feedback that works on a phone and can be asserted in a test.

**Non-Goals:**

- A visual redesign. The current look — zinc palette, heavy rounding, black primary buttons — is the target; this change makes it systematic, not different.
- A component library. Six primitives for eight screens does not warrant one.
- A manual theme toggle. Following the system preference is the requirement; a toggle can come later without changing the token structure.
- Animation or motion design.

## Decisions

### Surface tokens pair foreground with background

Rather than tokens for individual colours, the system defines *surfaces* — page, card, inverted card, input, muted — each carrying its own background, foreground, muted foreground, and border. A component picks a surface, not a pair of colours.

This is the decision that removes the bug class. `bg-zinc-50` with no text colour is expressible today and is what caused `ff62a5f`; a surface token has no such partial form. Applying the surface sets both, so "text on the wrong background" stops being something a component can express.

*Alternative rejected:* individual semantic colour tokens (`--color-text-primary`, `--color-surface-raised`) applied separately. More flexible, and flexibility is exactly the problem — the failure mode is choosing one and forgetting the other.

### Tailwind v4 `@theme`, not a CSS-in-JS or class-variance layer

The project is on Tailwind v4, which already has `@theme` in `globals.css` — the mechanism is present and partly used. Surfaces are defined there and consumed as ordinary utilities. No new dependency, and the dark variant continues to come from `prefers-color-scheme`.

### `body`'s font override is deleted, not overridden further

`body { font-family: Arial, Helvetica, sans-serif }` is removed so the Geist variables from [app/layout.tsx](app/layout.tsx) apply through `--font-sans`, and the compensating `font-sans` class comes off all nine views. The current arrangement is a rule and nine workarounds for it.

### Primitives are extracted from existing markup, not designed fresh

`Button`, `Card`, `IconButton`, `Screen`, `ScreenHeader`, `Field`, `EmptyState`. Each is taken from the markup already repeated across views, with variants covering the cases that actually differ — not a speculative API.

`ScreenHeader` deserves specific mention: the back-button-title-spacer arrangement is repeated five times, including the `<div className="w-16">` and `<div className="w-20">` spacers used to centre the title. Those are a layout workaround that a single component can replace with a proper three-column layout, and the inconsistent widths are why the title is not actually centred on every screen today.

### Feedback: a small in-app provider, no dependency

A context provider rendering an ARIA live region for messages, and a confirmation dialog. Replaces 9 `alert`/`confirm` calls.

For the dialog, focus trapping, Escape handling, and focus restoration are genuinely fiddly and easy to get subtly wrong. The native `<dialog>` element provides all three, is well supported, and needs no dependency — so the decision is to use it rather than either hand-rolling a trap or adding a headless library. Recorded as an open question only in the sense that if `<dialog>`'s styling constraints prove obstructive, a headless library is the fallback.

### `HomeView`'s `<style jsx>` moves into the stylesheet

The scrollbar-hiding rules become a utility class. `styled-jsx` is a legacy of the Pages Router and works here only because `HomeView` is transitively part of the client graph — which is also the bug fixed by adding the missing `"use client"` directive. Both go away together.

## Risks / Trade-offs

- **Touching every component in the app at once** → Sequenced last, so nothing else is in flight, and the test harness from change #3 covers the components being restyled. Primitives are introduced first and adopted one component at a time.
- **Dark mode has effectively never been exercised**, so enabling it properly will surface issues the light-only path has hidden → Expected. Every screen gets checked in both themes as an explicit task rather than assumed.
- **Contrast is asserted by review, not by a tool** → The spec states WCAG AA, and the rewritten `WorkoutView` test asserts rendered contrast for the case that actually broke. Adding a contrast-checking test helper across all surfaces is worthwhile but is not a prerequisite.
- **Replacing `confirm()` makes deletion asynchronous**, where it is currently synchronous and blocking → Call sites become promise-based. Small, but it touches the delete paths in three components.
- **`aria-live` regions announce inconsistently across screen readers** → Use a polite region for success and an assertive one for errors, and verify with at least one screen reader rather than trusting the attribute.
- **Tests asserting on class strings will break** → Intended. The harness change already established querying by role, label, and text for exactly this reason, and the one class-asserting test is explicitly rewritten here.

## Migration Plan

1. Define surface tokens in `@theme`, alongside the existing hardcoded classes. Nothing changes visually.
2. Remove the `body` font override and the compensating `font-sans` classes; verify type is unchanged.
3. Add primitives, unused.
4. Convert one component fully — `WorkoutView`, since it holds the original contrast bug — and verify in both themes.
5. Convert the remaining components one at a time.
6. Add the feedback provider and dialog; replace `alert`/`confirm` call site by call site.
7. Remove the `<style jsx>` block and add the missing `"use client"` to `HomeView`.
8. Delete the now-unused hardcoded colour classes and confirm none remain.

Each step leaves the app working.

## Open Questions

- Whether to add a manual theme toggle later. The surface-token structure supports it without rework.
- Whether a contrast-checking test helper should run across every surface/foreground pair, rather than only the case that previously broke.
