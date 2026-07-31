## 1. Surface the deactivate-others failure

- [x] 1.1 In `lib/hooks/useCycles.ts`, await `deactivateOtherCycles` in `saveCycle`'s create-new-cycle branch instead of firing it and forgetting it
- [x] 1.2 Change `saveCycle`'s return type so a deactivate-others failure is distinguishable from the primary write's success, without treating the whole operation as failed (the optimistic local update stays, since the new cycle really was created)
- [x] 1.3 In `app/page.tsx`'s `createOrUpdateCycle`, alert with a distinct message when the deactivate-others write failed, instead of only handling the primary write's failure

## 2. Tests

- [x] 2.1 Update the existing `useCycles` test that asserts the deactivate-others write fires, to also cover it failing
- [x] 2.2 Add a test confirming a deactivate-others failure does not revert the optimistic local update (the new cycle stays, other cycles stay marked inactive)
- [x] 2.3 Add a test confirming `app/page.tsx`'s handler alerts the distinct message on this specific failure

## 3. Verification

- [x] 3.1 Run `npm test`, `npx tsc --noEmit`, and `npm run lint` clean
- [x] 3.2 Confirm no spec under `openspec/specs/` needed editing
