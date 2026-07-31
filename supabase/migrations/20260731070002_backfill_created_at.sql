-- Backfill created_at from the legacy numeric id where it parses as a
-- millisecond timestamp (the old id scheme was `Date.now().toString()`),
-- falling back to now() for anything that doesn't parse (already-UUID ids,
-- or the one hand-picked seed id "cycle-2024-v1").

update public.cycles
   set created_at = case
     when id ~ '^\d+$' then to_timestamp(id::bigint / 1000.0)
     else now()
   end
 where created_at is null;

update public.workout_sessions
   set created_at = case
     when id ~ '^\d+$' then to_timestamp(id::bigint / 1000.0)
     else now()
   end
 where created_at is null;
