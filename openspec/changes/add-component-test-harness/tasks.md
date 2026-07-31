## 1. Harness setup

- [ ] 1.1 Add dev dependencies: `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@vitejs/plugin-react`
- [ ] 1.2 Create `vitest.config.ts` with the React plugin, `environment: 'jsdom'`, globals enabled, and a setup file
- [ ] 1.3 Restate the `@/*` path alias from [tsconfig.json](tsconfig.json) in the Vitest resolver
- [ ] 1.4 Create `vitest.setup.ts` registering `jest-dom` matchers and DOM cleanup between tests
- [ ] 1.5 Add a `test:watch` script to [package.json](package.json)
- [ ] 1.6 Confirm the existing `lib/*.test.ts` suites still pass unchanged under the new configuration

## 2. Prove the harness on one component

- [ ] 2.1 Write a rendering test for `WorkoutView` covering the header, date field, and one exercise row
- [ ] 2.2 Delete the source-scraping assertion in [components/WorkoutView.test.ts](components/WorkoutView.test.ts) and replace it with a rendered assertion that entered text is visible against its input background
- [ ] 2.3 Confirm the replacement test fails when the text color is removed from the component, and passes when restored

## 3. Component tests — pure prop-driven views

- [ ] 3.1 `WorkoutView`: typing weight/reps/comment calls the update handler; comma decimals normalise; a brand-new session logs no controlled/uncontrolled React warning; the comment field accepts multiple lines
- [ ] 3.2 `CycleFormView`: adding and removing days and exercises; saving without a name is refused; blank exercise rows are stripped on save; **editing then abandoning the form leaves the passed-in cycle object unmutated**
- [ ] 3.3 `CycleView`: day templates render as start actions; history renders newest-first with correct completion counts; elapsed days reads zero for a cycle with no sessions
- [ ] 3.4 `StatsView`: exercises with no recorded weight are excluded; a non-numeric weight never reaches chart coordinates; the empty state renders when nothing qualifies
- [ ] 3.5 `CalendarView`: days with workouts are actionable and days without are not; month navigation moves across year boundaries; clicking a day with several sessions opens the picker

## 4. Component tests — the two Supabase-importing views

- [ ] 4.1 Add a narrow `vi.mock` of `lib/supabaseClient` exposing only `signInWithPassword`, `signUp`, and `signOut`
- [ ] 4.2 `AuthView`: login and sign-up submit the entered credentials; toggling modes preserves the entered email; a rejected attempt surfaces the error and stays on the form
- [ ] 4.3 `HomeView`: cycles render with active badges and day counts; recent workouts show only exercises with a recorded weight; delete prompts for confirmation before invoking the handler; log out calls `signOut`

## 5. Accessibility gaps found while testing

- [ ] 5.1 Record any control that cannot be reached by an accessible query, and add the missing label rather than falling back to a test-id
- [ ] 5.2 Confirm every interactive control in the five prop-driven views is reachable by role or label

## 6. Verification

- [ ] 6.1 Run `npm test` — full suite green
- [ ] 6.2 Run `npx tsc --noEmit` and `npm run lint` clean, including the new test files
- [ ] 6.3 Confirm no test asserts on Tailwind class strings or on source file text
- [ ] 6.4 Confirm tests query by role, label, or text rather than by DOM structure, so the design-system change does not invalidate them wholesale
