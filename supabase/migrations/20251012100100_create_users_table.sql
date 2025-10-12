-- Migration: Create users table
-- Purpose: Store public user data extending Supabase auth.users
-- Affected tables: users
-- Created: 2025-10-12

-- create the users table
-- this table extends the supabase auth.users table with additional profile information
-- each user in auth.users will have exactly one corresponding entry in this table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  date_of_birth date,
  height_cm smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

comment on table users is 'Stores public user data, extending the Supabase auth.users table.';
comment on column users.id is 'References the auth.users id with cascade delete';
comment on column users.first_name is 'User first name';
comment on column users.last_name is 'User last name';
comment on column users.date_of_birth is 'User date of birth';
comment on column users.height_cm is 'User height in centimeters';
comment on column users.created_at is 'Timestamp when the user profile was created';
comment on column users.updated_at is 'Timestamp of the last profile update';

-- enable row level security
-- this is required even though we'll define specific policies later
alter table users enable row level security;

-- create rls policy for select operations (anon role)
-- anon users cannot select any user data
create policy "anon_users_select_policy"
on users for select
to anon
using (false);

-- create rls policy for select operations (authenticated role)
-- authenticated users can only select their own user data
create policy "authenticated_users_select_policy"
on users for select
to authenticated
using (auth.uid() = id);

-- create rls policy for insert operations (anon role)
-- anon users cannot insert user data
create policy "anon_users_insert_policy"
on users for insert
to anon
with check (false);

-- create rls policy for insert operations (authenticated role)
-- authenticated users can only insert their own user data
create policy "authenticated_users_insert_policy"
on users for insert
to authenticated
with check (auth.uid() = id);

-- create rls policy for update operations (anon role)
-- anon users cannot update user data
create policy "anon_users_update_policy"
on users for update
to anon
using (false)
with check (false);

-- create rls policy for update operations (authenticated role)
-- authenticated users can only update their own user data
create policy "authenticated_users_update_policy"
on users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- create rls policy for delete operations (anon role)
-- anon users cannot delete user data
create policy "anon_users_delete_policy"
on users for delete
to anon
using (false);

-- create rls policy for delete operations (authenticated role)
-- authenticated users can only delete their own user data
create policy "authenticated_users_delete_policy"
on users for delete
to authenticated
using (auth.uid() = id);

-- create function to automatically update the updated_at timestamp
-- this function is called by a trigger before any update operation
create or replace function update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now(); 
   return new;
end;
$$ language plpgsql;

comment on function update_updated_at_column is 'Automatically updates the updated_at column to the current timestamp';

-- create trigger to call the update_updated_at_column function
-- this trigger fires before any update on the users table
create trigger update_users_updated_at
before update on users
for each row execute procedure update_updated_at_column();

-- create function to automatically create a user profile when a new auth user is created
-- this function ensures that every user in auth.users has a corresponding entry in the users table
-- security definer: runs with elevated privileges to bypass rls
-- set search_path: security measure to prevent malicious schema attacks
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

comment on function handle_new_user is 'Automatically creates a user profile when a new auth user is created';

-- create trigger to automatically create user profile after auth user creation
-- this trigger fires after a new user is inserted into auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();