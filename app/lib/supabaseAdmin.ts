// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!URL || !SERVICE_ROLE) {
  // Throw on server import so server routes fail fast and you notice missing env
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in env on the server.');
}

export const supabaseAdmin = createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });
