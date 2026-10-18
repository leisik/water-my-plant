-- Water My Plant: schema, ownership rules, and private photo storage.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create schema if not exists app_private;

create table app_private.authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on schema app_private from public, anon, authenticated;
revoke all on all tables in schema app_private from public, anon, authenticated;

create or replace function public.is_authorized_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from app_private.authorized_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_authorized_user() from public;
grant execute on function public.is_authorized_user() to authenticated;

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.watering_events (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  watered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint watering_events_not_far_future check (watered_at <= now() + interval '5 minutes')
);

create index plants_user_created_at_idx on public.plants (user_id, created_at desc);
create index watering_events_plant_watered_at_idx on public.watering_events (plant_id, watered_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger plants_set_updated_at
before update on public.plants
for each row execute function public.set_updated_at();

alter table public.plants enable row level security;
alter table public.watering_events enable row level security;

create policy "authorized owner reads plants"
on public.plants for select to authenticated
using (public.is_authorized_user() and user_id = (select auth.uid()));

create policy "authorized owner creates plants"
on public.plants for insert to authenticated
with check (public.is_authorized_user() and user_id = (select auth.uid()));

create policy "authorized owner updates plants"
on public.plants for update to authenticated
using (public.is_authorized_user() and user_id = (select auth.uid()))
with check (public.is_authorized_user() and user_id = (select auth.uid()));

create policy "authorized owner deletes plants"
on public.plants for delete to authenticated
using (public.is_authorized_user() and user_id = (select auth.uid()));

create policy "authorized owner reads watering events"
on public.watering_events for select to authenticated
using (
  public.is_authorized_user()
  and exists (
    select 1 from public.plants
    where plants.id = watering_events.plant_id
      and plants.user_id = (select auth.uid())
  )
);

create policy "authorized owner creates watering events"
on public.watering_events for insert to authenticated
with check (
  public.is_authorized_user()
  and exists (
    select 1 from public.plants
    where plants.id = watering_events.plant_id
      and plants.user_id = (select auth.uid())
  )
);

create policy "authorized owner deletes watering events"
on public.watering_events for delete to authenticated
using (
  public.is_authorized_user()
  and exists (
    select 1 from public.plants
    where plants.id = watering_events.plant_id
      and plants.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-photos',
  'plant-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "authorized owner reads plant photos"
on storage.objects for select to authenticated
using (
  bucket_id = 'plant-photos'
  and public.is_authorized_user()
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "authorized owner uploads plant photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'plant-photos'
  and public.is_authorized_user()
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "authorized owner updates plant photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'plant-photos'
  and public.is_authorized_user()
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'plant-photos'
  and public.is_authorized_user()
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "authorized owner deletes plant photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'plant-photos'
  and public.is_authorized_user()
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- After creating the sole Auth user, authorize it with this statement in the
-- SQL editor, replacing the email. Keep this table to one row for a single-user app:
-- insert into app_private.authorized_users (user_id)
-- select id from auth.users where lower(email) = lower('you@example.com');
