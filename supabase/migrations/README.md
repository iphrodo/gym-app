# Migrations

Plain, timestamped SQL files, named the way the Supabase CLI expects
(`<YYYYMMDDHHMMSS>_description.sql`) so the CLI can adopt this directory
later if we decide to install it. Nothing here requires the CLI: every file
can also be pasted into the hosted project's SQL editor (Dashboard → SQL
Editor) and run in order.

Apply files in filename order — the sequence matters. In particular the
`user_id` column must be backfilled and made `NOT NULL` *before* the RLS
policies are installed, otherwise existing rows become invisible to their
owner.

## Applying with the CLI

```
npx supabase link --project-ref <project-ref>   # once, if not already linked
npx supabase db push
```

## Applying by hand

Paste each file's contents into the SQL editor for the target project, in
filename order, and run it.
