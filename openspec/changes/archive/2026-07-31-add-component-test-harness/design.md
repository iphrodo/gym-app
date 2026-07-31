## Context

See proposal.md — Why.

The relevant structural fact is how I/O is distributed. Of the eight components, five (`WorkoutView`, `CycleFormView`, `CycleView`, `StatsView`, `CalendarView`) receive everything through props and perform no I/O — they are already trivially testable the moment a DOM exists. Two (`AuthView`, `HomeView`) import the Supabase client directly for a single call each: `signInWithPassword`/`signUp`, and `signOut`. All remaining data access — six call sites — lives inline in `app/page.tsx`, interleaved with view-routing state.

That distribution is what makes this change tractable: the majority of the app is testable with nothing more than a DOM, and the untestable part is concentrated in one file that a later change is going to dismantle anyway.

## Goals / Non-Goals

**Goals:**

- A DOM environment, so tests assert on rendered output instead of source text.
- Interaction-level tests, since most of the bugs found in the architecture review were interaction bugs (cancel keeping edits, uncontrolled inputs) that no unit test of a pure function would catch.
- Cover the behaviors the two preceding correctness changes fixed, so they cannot silently regress during the restructuring that follows.
- Leave the harness usable, without rework, by the changes that come after.

**Non-Goals:**

- Testing `app/page.tsx`. See below — this is a deliberate deferral, not an oversight.
- End-to-end or browser tests. The value-to-setup ratio is poor at this size; component-level interaction tests catch the defect classes actually present here.
- Coverage thresholds. A gate on a suite this young mostly produces tests written to satisfy the gate.
- Testing `app/layout.tsx`, which imports `next/font` — awkward under Vitest and carrying no logic worth asserting.

## Decisions

### Do not build a Supabase test seam in this change

The obvious instinct is to mock the Supabase client so `app/page.tsx` can be tested. I am deliberately not doing that.

`supabase-js` exposes a chained builder — `.from().select()`, `.from().update().neq()` — so a module mock means hand-writing a fake builder that mimics chaining and resolution. That fake encodes the *current* call shapes, so it needs rewriting when `extract-data-layer` moves those calls behind a repository. The result is a brittle test double, written twice, whose first version tests a file scheduled for demolition.

Instead: test the five pure-prop components now, and let `extract-data-layer` introduce a real seam — a repository module with a narrow interface — that is genuinely worth mocking. That change carries the responsibility for its own tests.

*Alternative considered:* MSW, intercepting at the `fetch` layer so real `supabase-js` runs and assertions are made against outgoing requests. This is the more faithful approach and survives the refactor. Rejected for now only on sequencing: it means encoding PostgREST URL and header shapes today to test a call site that is about to move. Worth revisiting during `extract-data-layer`, where it would test the repository against a realistic wire format.

### A narrow hand-written mock for `AuthView` and `HomeView` only

These two need exactly three functions (`signInWithPassword`, `signUp`, `signOut`), none of them chained. A small `vi.mock` of `lib/supabaseClient` covers them without the builder problem. Scoped to these two files, and explicitly not a general-purpose double.

### Vitest over Jest

Vitest is already the project's runner and already passing. Switching runners to gain a DOM would be a much larger change than adding an environment to the one in place.

### Colocated tests, matching the existing convention

`Component.test.tsx` beside `Component.tsx`, as [lib/sortWorkoutHistory.test.ts](lib/sortWorkoutHistory.test.ts) and the others already do. New component tests use `.tsx` rather than `.ts`, since they contain JSX.

### `@vitejs/plugin-react` is required, not optional

Vitest does not transform JSX on its own. The plugin is what makes `.tsx` test files and the components they import compile. The `@/*` alias from [tsconfig.json](tsconfig.json) also has to be restated in the Vitest config — TypeScript path mappings do not reach the test runner's resolver, and omitting it produces import errors that look unrelated to configuration.

### The source-scraping test is replaced, not extended

[components/WorkoutView.test.ts](components/WorkoutView.test.ts) asserts that inputs with `bg-zinc-50` also carry `text-zinc-900`. Once the component can be rendered, the honest form of that assertion is against the rendered element. It is worth noting that this test becomes meaningless again after `establish-design-system` replaces per-input color classes with tokens — so it is rewritten here to assert the *behavior* (entered text is visible against its background via a resolved color), not the class string.

## Risks / Trade-offs

- **`app/page.tsx` — the file with the most logic — stays untested when this lands** → Accepted and time-boxed: it is the explicit subject of the next change, which is responsible for testing it once a seam exists. Deferring is better than writing a double that gets thrown away.
- **Testing Library encourages testing through accessible queries, and much of this UI is unlabelled** → A feature, not a cost. Several controls already carry `aria-label`; the ones that do not will be found by writing these tests, and fixing them is a real accessibility improvement.
- **Adding six dev dependencies to a project with four runtime ones** → All dev-only, none shipped to users, and they are the standard React testing stack rather than a bespoke selection.
- **Tests written against current markup will need updating when `establish-design-system` reshapes components** → Mitigated by querying on roles, labels, and text rather than on classes or DOM structure. The rewritten `WorkoutView` test is the worked example.

## Open Questions

- Whether to adopt MSW during `extract-data-layer` for repository-level tests against a realistic wire format, or keep hand-written doubles at the repository interface. Does not affect this change's setup.
