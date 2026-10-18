-- Automatically authorize users that an administrator creates or invites.
-- Keep public Auth sign-up disabled: every Auth user receives access to their
-- own records, while the existing RLS policies preserve tenant isolation.

create or replace function app_private.authorize_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into app_private.authorized_users (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function app_private.authorize_new_auth_user() from public, anon, authenticated;

drop trigger if exists authorize_new_auth_user on auth.users;

create trigger authorize_new_auth_user
after insert on auth.users
for each row execute function app_private.authorize_new_auth_user();

-- Authorize users that existed before this trigger was installed.
insert into app_private.authorized_users (user_id)
select id from auth.users
on conflict (user_id) do nothing;
