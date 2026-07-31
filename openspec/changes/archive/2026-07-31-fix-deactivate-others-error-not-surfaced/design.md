## Context

See proposal.md — Why. The bug lives in `lib/hooks/useCycles.ts`'s `saveCycle`, specifically the
create-a-new-cycle branch, which already exists post-`extract-data-layer`:

```ts
} else {
  dispatch({ type: 'SET_CYCLES', cycles: [...state.cycles.map(c => ({ ...c, isActive: false })), cycle] });
  void deactivateOtherCycles(client, cycle.id);
}
return ok(undefined);
```

`saveCycle` returns `ok(undefined)` unconditionally on this branch, before `deactivateOtherCycles`
even resolves. `app/page.tsx`'s `createOrUpdateCycle` treats that `ok` result as "the save fully
succeeded" and switches the view. There is currently no path for a `deactivateOtherCycles` failure
to reach the user.

## Goals / Non-Goals

**Goals:**

- A failure from the deactivate-others write is surfaced to the user, the same way every other
  write failure in this hook already is.
- Local state (`cycles`) does not end up permanently inconsistent with the database because of a
  failure the user was never told about.

**Non-Goals:**

- Changing the view-switch timing for the happy path. The new cycle still appears immediately;
  this only changes what happens when the follow-up write fails.
- General retry/offline-queue infrastructure. One clear failure signal is enough here.
- Touching the `upsertCycle` write itself — that part already behaves correctly (awaited, checked,
  surfaced).

## Decisions

### Await `deactivateOtherCycles` and fold its failure into `saveCycle`'s result

`saveCycle` already awaits `upsertCycle` before touching local state. The fix is to also await
`deactivateOtherCycles` and, if it fails, still keep the optimistic local update (the new cycle
really was created — reverting it would contradict what's in the database) but return an error
result from `saveCycle` so the caller can surface it.

Concretely: `saveCycle` returns `Result<{ deactivateOthersError?: unknown }>` instead of
`Result<void>` for this branch — success stays `ok(undefined)`-shaped for the edit path and the
plain-success create path, and only carries the extra field when the deactivate-others write
specifically failed. `app/page.tsx`'s `createOrUpdateCycle` checks for that field after a
successful `saveCycle` call and alerts with a distinct message ("Cycle created, but couldn't
deactivate your other cycles — you may need to fix this manually.") rather than treating it as a
hard failure of the whole operation, since the primary write did succeed.

*Alternative rejected:* keep it fire-and-forget but log to an error-reporting service. There is no
error-reporting service in this app, and the spec requirement is that the user is told, not just
that the failure is recorded somewhere.

*Alternative rejected:* revert the optimistic local update on failure. The new cycle is genuinely
in the database at that point (its own write succeeded); showing it as gone would be lying about
local state in the other direction.

### No retry

A manual "Edit cycle" and re-save already gives the user a way to retry the deactivation (editing
and saving any cycle re-triggers `saveCycle`'s edit branch... which doesn't call
`deactivateOtherCycles` at all). Real recovery requires either a dedicated retry action or making
`deactivateOtherCycles` idempotent and callable standalone. Out of scope for this fix; the goal
here is "tell the user", not "build recovery UX". Recorded as an open question.

## Risks / Trade-offs

- **Awaiting the deactivate-others write delays `saveCycle`'s resolution slightly** (previously it
  returned immediately after the optimistic dispatch) → Accepted; the delay is one network
  round-trip, and correctness here matters more than shaving it off.
- **Users have no in-app way to retry just the deactivation** → Accepted for this change; see Open
  Questions.

## Open Questions

- Whether to add a standalone "retry deactivation" action, or fold recovery into a future
  general-purpose write-retry mechanism. Doesn't change this fix's shape.
