# Water My Plant

A private, mobile-first plant watering journal built with Next.js, TypeScript, Tailwind CSS, and Supabase. It keeps an append-only watering history, supports backdated entries, and stores plant photos in a private Supabase Storage bucket.

## What is included

- Private email-and-password authentication through Supabase Auth
- Automatic authorization for admin-created users, with public sign-up disabled
- Responsive plant dashboard with signed private photo URLs
- Create, edit, replace-photo, and confirmed plant deletion flows
- One-click and backdated watering events with a complete newest-first history
- Confirmed removal of incorrect watering events
- Row Level Security for plants, watering events, and Storage objects
- Europe/Warsaw date and time display
- Loading, empty, error, and success states

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. In Supabase, open **Project Settings → API** and add the project values to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

   The publishable key is safe to expose to the browser because authorization is enforced by RLS. Never use or expose the service-role key in this app.

4. Apply both files in [`supabase/migrations`](supabase/migrations) in filename order using **Supabase → SQL Editor**. If you use the Supabase CLI in a linked project, run:

   ```bash
   supabase db push
   ```

   The migrations create the tables, indexes, timestamp trigger, private `plant-photos` bucket, ownership policies, and a trigger that automatically authorizes admin-created Auth users.

5. In **Supabase → Authentication → Sign In / Providers**, keep the Email provider enabled. In **URL Configuration**, set:

   - Site URL: `http://localhost:3000` for local development
   - Redirect URL: `http://localhost:3000/auth/callback`
   - Password reset redirect URL: `http://localhost:3000/auth/callback?next=/auth/update-password`

   Add the production callback and password reset redirect URLs later, replacing `http://localhost:3000` with your production origin. The password reset entry must include `?next=/auth/update-password`, matching the URL sent by the app. Keep the Reset Password email template's link set to `{{ .ConfirmationURL }}` so Supabase verifies the recovery link before redirecting to the app.

6. Create or invite users from **Authentication → Users**, then disable **Allow new users to sign up**. The authorization trigger automatically adds every Auth user to the private allowlist. If an account does not have a password yet, open `/auth/forgot-password` locally and use the one-time recovery email to set one. Normal sign-ins use the password and do not send an email.

7. Confirm that Auth users were automatically authorized:

   ```sql
   select au.user_id, u.email, au.created_at
   from app_private.authorized_users au
   join auth.users u on u.id = au.user_id;
   ```

8. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Security model

The browser only receives a publishable/anon key. Supabase RLS checks both conditions for every record operation:

1. The authenticated user is present in the private `app_private.authorized_users` allowlist. A protected trigger adds admin-created Auth users automatically.
2. The record belongs to `auth.uid()` (directly for plants and through the parent plant for watering events).

Storage policies apply the same allowlist and require every object to live under the authenticated user's UUID folder. The bucket is private; the server creates short-lived signed URLs for display. Uploads are restricted to JPG, PNG, or WebP and 5 MB at both the application and bucket layers.

Plant deletion cascades watering-event deletion. The app removes a stored photo after a successful plant deletion and removes the old photo after a successful replacement. Failed database writes clean up newly uploaded files.

## Authentication note

Sign-in uses Supabase email/password authentication and cookie-backed sessions. Public sign-up is not exposed by the application and should remain disabled in Supabase. Creating or inviting a user in the Supabase dashboard automatically authorizes that user through the database trigger. Password recovery is the only email-link flow; it is needed only when initially choosing or later resetting a password.

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import it into Vercel as a Next.js project.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in **Vercel → Project Settings → Environment Variables** for Production and Preview as appropriate.
4. Deploy.
5. Add `https://your-production-domain/auth/callback` and `https://your-production-domain/auth/callback?next=/auth/update-password` to Supabase's allowed redirect URLs and change the Supabase Site URL to the production origin.
6. Test sign-in, photo upload, watering creation, and deletion with the authorized account.

No Vercel or Supabase credentials are committed to source control. `.env.local` is ignored by Git.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
```

## Data model

- `plants`: owner, name, private Storage path, and timestamps
- `watering_events`: one immutable-by-default record per watering, linked with `ON DELETE CASCADE`

The latest watering is derived from `watering_events`; it is never duplicated on `plants`.

## Troubleshooting

### Photo upload reports a row-level security error

First verify that the signed-in account is on the private allowlist:

```sql
select u.id, u.email, (au.user_id is not null) as authorized
from auth.users u
left join app_private.authorized_users au on au.user_id = u.id;
```

If your account shows `authorized = false`, authorize it:

```sql
insert into app_private.authorized_users (user_id)
select id from auth.users
where lower(email) = lower('you@example.com')
on conflict (user_id) do nothing;
```

If it is already authorized, reapply the four `storage.objects` policies from the migration. Confirm that the bucket is private and named exactly `plant-photos`. Sign out and back in after changing Auth or policy configuration so the application uses a fresh session.
