## Context

See proposal.md — Why. Three facts about the current code shape drive the approach.

The cycle form's mutation bug works *by accident*: `const newDays = [...cycleDays]` produces a new array reference, so React re-renders, while `newDays[dayIndex].label = ...` writes through to the objects the parent still holds. The visible behaviour looks right, which is why it survived — only "Cancel" reveals it. Fixing this needs immutable updates at every level being written, not just a deeper copy at initialisation.

The stored `data` jsonb has drifted from its declared type. `updateExerciseValues` has always written strings into `reps`, which is declared `number | undefined`, so **every reps value in the database is already a string**. The type is not describing a future state to migrate toward; it is simply wrong about the present. Separately, rows written before the reps and comment fields existed contain only `{name, weight}`, so those keys are absent, not empty.

Old ids are `Date.now()` strings — which means, exactly once, the legacy id encoding is genuinely useful: it is the only record we have of when those rows were created, and it can seed `created_at` during migration before we stop depending on it forever.

## Goals / Non-Goals

**Goals:**

- Make the declared types match what is actually stored, rather than what we wish were stored.
- Make every failure path visible, with local state that never claims a write happened when it did not.
- Remove the coupling between record identity and record age.
- Keep old rows readable throughout — no data rewrite beyond the `created_at` backfill.

**Non-Goals:**

- Replacing `alert()`/`confirm()`. Failures must be *surfaced*; making them pretty is `establish-design-system`.
- Introducing a validation library. The rules here are "is this a number" — a dependency would be heavier than the problem.
- Restructuring where persistence code lives — that is `extract-data-layer`.
- Adding tests. The harness does not exist yet; it is the next change. Verification here is type-level and manual, and the fixes are deliberately shaped so the following change can test them.

## Decisions

### `ExerciseSet` becomes all-strings with required fields

`weight: string; reps: string; comment: string`, all required, defaulting to `""`.

This describes what is already in the database. The alternative — moving to `number` — would mean migrating every existing jsonb blob, and it would push parse failures into the write path where the user is mid-entry and a partially-typed number like `"8."` is legitimately not yet a number. Strings in storage, parsing at the point of use, keeps entry forgiving and makes the invalid case explicit at the one place that does arithmetic.

Required-with-empty-default rather than optional is what fixes the controlled/uncontrolled warning: there is no `undefined` for an input to start from.

### A normalisation function runs on read

Because old rows lack the `reps` and `comment` keys entirely, every session loaded from the database passes through a normaliser that fills missing fields with `""`. Without it, "required" would be a lie at runtime for exactly the rows most likely to be edited — the historical ones.

### Parsing is a boundary, not scattered `parseFloat` calls

A small `lib/exerciseValues.ts` exposes a parse that returns `number | null`, and `StatsView` filters on it. Today `parseFloat(ex.weight)` feeds `NaN` straight into chart coordinate maths, which produces `NaN%` in the rendered SVG attributes — invisible in code review, visible as a broken chart.

### Immutable updates in the cycle form, plus a deep copy at initialisation

Both, not either. The deep copy stops the form from ever holding a reference the parent also holds; the immutable updates stop the same bug reappearing the next time someone adds a field. Deep copy uses `structuredClone`, which needs no dependency.

*Alternative rejected:* adopting Immer. It would make these handlers genuinely nicer to read, but it is a runtime dependency added to fix four call sites in a form, and the whole file is likely to be reshaped by later changes anyway.

### `crypto.randomUUID()` for new ids, old ids left alone

Ids become opaque strings. Existing numeric ids keep working because nothing parses them any more.

*Trade-off:* `crypto.randomUUID` requires a secure context — HTTPS or localhost. Both are satisfied here, but it is a real constraint worth stating, since it fails at runtime rather than at build time if that ever stops being true.

### `created_at` is backfilled from the legacy ids

`ALTER TABLE ... ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()` would stamp every historical row with the migration time, making "days in cycle" wrong for all existing data. Instead the backfill parses the numeric id where it parses and falls back to `now()` where it does not. One-time use of a coupling we are otherwise removing.

### "Days in cycle" is computed from session dates

Rather than from `created_at` or from an id. The user-facing meaning is "how long have I been running this programme", which is a property of when they *trained*, not when a row was written. This also fixes the existing bug of reading `cycleHistory[0]` from an unsorted array.

## Risks / Trade-offs

- **Making `reps`/`comment` required is a compile-time break at every construction site** → Intended; that is the mechanism that finds them. The normaliser covers the runtime side for existing rows.
- **The `created_at` backfill heuristic is unverifiable for rows whose ids do not parse** → Those fall back to `now()`, which is wrong but bounded, and affects only the elapsed-days display. Acceptable for a personal-scale dataset; the alternative is leaving every row wrong.
- **Rejecting non-numeric weight could block in-progress typing** (`"8."`, `"-"`) → Validation is on the stored value and surfaced as field state, not a hard input block, so intermediate states remain typeable.
- **This change and `secure-data-ownership` touch the same handlers** → Sequenced after it deliberately. Landing them in parallel would conflict in `app/page.tsx`.
- **No automated tests cover any of this when it lands** → The real mitigation is that `add-component-test-harness` follows immediately and its first targets are exactly these behaviours. Verification here is `tsc`, plus a manual two-account pass.

## Migration Plan

1. Add `created_at` as nullable, backfilled from legacy numeric ids where parseable and `now()` otherwise, then set `NOT NULL DEFAULT now()`.
2. Deploy the client change. Old rows are normalised on read; new rows get UUID ids and a database-stamped `created_at`.
3. No rewrite of existing ids. The two schemes coexist permanently.

**Rollback:** the client change reverts cleanly on its own. `created_at` can be left in place — it is additive and unused by the previous code.

## Open Questions

- Whether `reps` should eventually become a structured set list (`3×8` rather than a single number). Out of scope, but the all-strings decision here does not block it.
