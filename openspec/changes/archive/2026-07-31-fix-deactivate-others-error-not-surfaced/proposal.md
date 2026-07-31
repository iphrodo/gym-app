## Why

Found while extracting the data layer in `extract-data-layer` (task 1.2: record, don't fix).

In `createOrUpdateCycle`'s create-a-new-cycle path, the app optimistically marks every other
locally-held cycle inactive and switches to the home view, then fires the "deactivate this
user's other cycles" write without checking its result:

```ts
} else {
   setCycles([...cycles.map(c => ({...c, isActive: false})), newCycle]);
   setView('home');
   await supabase.from('cycles').update({ is_active: false }).eq('user_id', userId).neq('id', newCycle.id);
}
```

If that write fails, the user sees every other cycle as inactive (and the new one as the only
active one), but the database still has the old cycle(s) marked active too. Nothing tells the
user, and nothing retries. This is now preserved as-is in `lib/hooks/useCycles.ts`'s `saveCycle`
(the `deactivateOtherCycles` call there is still fire-and-forget), per `extract-data-layer`'s
non-goal of not smuggling behavior changes into a refactor.

This violates the `data-persistence` spec's "No Silent Failures" requirement: *"Every persistence
operation SHALL either succeed or report its failure to the user."*

## Capabilities

No capabilities change. The `data-persistence` spec's "No Silent Failures" requirement already
covers this exact case generically; this change closes a gap between that requirement and the
implementation, it doesn't add or alter a requirement. The change declares `skip_specs: true`.

## What Changes

- Surface a failure from the deactivate-others write to the user (e.g. an error banner or alert),
  without necessarily blocking the view switch that already happened.
- Decide whether to retry, or to reconcile local state back against the database on failure, so a
  user is never shown an active-cycle count that doesn't match what's actually stored.

## Impact

- `lib/hooks/useCycles.ts` (`saveCycle`'s create-new-cycle branch)
- Possibly `app/page.tsx` if a new error-surfacing seam is needed at the call site
