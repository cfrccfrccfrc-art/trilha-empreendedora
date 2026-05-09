# Supabase setup

This directory contains the SQL schema and instructions for setting up the
Trilha Empreendedora backend.

## Files

- `migrations/0001_init.sql` — initial schema (tables, indexes, RLS, helper fn)

## Apply the migration

### Option A — Supabase CLI (recommended)

```bash
# install once
brew install supabase/tap/supabase

# from the project root
cd /path/to/trilha-empreendedora
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Option B — manual via SQL editor

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of `migrations/0001_init.sql`
3. Run it

## Storage bucket for task evidence

The submission flow accepts an optional photo. Create a public bucket:

1. Supabase dashboard → **Storage** → **New bucket**
2. Name: `task-evidence`
3. Public: **on** (for MVP — see security note below)

Or via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-evidence', 'task-evidence', true)
ON CONFLICT (id) DO NOTHING;
```

Then allow anon uploads:

```sql
CREATE POLICY "anon can upload task evidence"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'task-evidence');

CREATE POLICY "anon can read task evidence"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'task-evidence');
```

## Environment variables

Copy your project's URL and anon key into the app's `.env`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

## Security model — MVP

This MVP **does not use Supabase Auth**. Each user gets a random `plan_token`
(UUID) saved in their browser's `localStorage`. The frontend passes this token
via the `x-plan-token` HTTP header on every request, and RLS policies check it.

**Tradeoffs:**

- Anyone with the token can read/edit that plan. Treat the token like a magic
  link — if leaked, the plan is exposed.
- INSERTs are open to the anon role (we cannot pre-validate the token before
  the user exists).
- Tokens are UUIDv4 (122 bits of entropy), so brute-force enumeration is
  infeasible.
- The `task-evidence` Storage bucket is fully public for MVP simplicity.
  Anyone with a URL can view a photo.

**Production hardening (post-MVP):**

1. Replace plan_token with Supabase Auth (magic link or OTP via WhatsApp)
2. Rewrite RLS policies to use `auth.uid()`
3. Make `task-evidence` private and serve via signed URLs
4. Add rate limiting (Supabase Edge Function or Cloudflare in front)
