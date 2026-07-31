import { Session } from '@supabase/supabase-js';

export function requireUserId(session: Session | null): string | null {
  return session?.user.id ?? null;
}
