import { createClient } from "@supabase/supabase-js";

// Server-side client for JWT verification.
// Uses the anon key — auth.getUser(token) only needs to hit the Supabase auth endpoint,
// no admin privileges required.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
