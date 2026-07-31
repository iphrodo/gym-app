## Why

There is no `vitest.config.ts`, so tests run in Node with no DOM. Nothing in the app can be rendered in a test, and it shows: [components/WorkoutView.test.ts](components/WorkoutView.test.ts) verifies input styling by reading its own `.tsx` file as a string and regexing the `className` attribute. That test passes whenever the substring is present — including when the component crashes, renders nothing, or applies the class to the wrong element. It is the shape a test takes when rendering is impossible.

The next three changes restructure navigation, data access, and styling across every component in the app. Doing that without the ability to render anything means the only safety net is `tsc` and clicking through by hand. The harness needs to exist before the restructuring, not after it.

## What Changes

- Add a Vitest configuration with a `jsdom` environment, so components can be rendered and asserted against.
- Add React Testing Library and `user-event` for interaction-level tests, and `jest-dom` matchers.
- Resolve the `@/*` path alias in tests so test imports match application imports.
- Add a test setup file registering the matchers and per-test DOM cleanup.
- Add rendering tests for the components that take all their data as props and touch no I/O: `WorkoutView`, `CycleFormView`, `CycleView`, `StatsView`, `CalendarView`.
- Replace the source-scraping `WorkoutView.test.ts` with tests that render the component and assert on the resulting DOM.
- Add a narrow module mock for the Supabase client, used only by the two components that import it directly (`AuthView`, `HomeView`).
- Add a `test:watch` script for local development.

## Capabilities

No capabilities change. This change adds test tooling and tests; it does not alter any application behavior, so the change declares `skip_specs: true`. The behaviors these tests cover are already specified under `workout-sessions`, `training-cycles`, `workout-calendar`, and `progress-stats`.

## Impact

- **Dependencies (dev only):** `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@vitejs/plugin-react`.
- **New files:** `vitest.config.ts`, `vitest.setup.ts`, and colocated `*.test.tsx` files next to the components they cover.
- **Changed files:** [package.json](package.json) (dev dependencies, `test:watch` script), [components/WorkoutView.test.ts](components/WorkoutView.test.ts) (replaced by a rendering test).
- **Not covered by this change:** `app/page.tsx` and anything reached through the Supabase client. That code has no seam to test against until `extract-data-layer` introduces one — see design.md for why this change does not try to force one.
- **Sequencing:** lands after the two correctness changes, so its first tests can lock in the behaviors those changes fixed, and before the three structural changes, which need it.
