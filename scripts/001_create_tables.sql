-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  location text,
  avatar_url text,
  is_host boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Host profiles table
create table if not exists public.host_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  skills text[] not null default '{}',
  tools text[] not null default '{}',
  description text,
  hourly_rate decimal(10,2),
  total_sessions integer default 0,
  total_earnings decimal(10,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references public.profiles(id) on delete cascade not null,
  learner_id uuid references public.profiles(id) on delete cascade not null,
  session_date timestamp with time zone not null,
  duration_hours integer default 2,
  skill text not null,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  learner_showed_up boolean,
  learner_used_tools boolean,
  host_feedback text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.host_profiles enable row level security;
alter table public.bookings enable row level security;

-- Profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Host profiles policies
create policy "host_profiles_select_all" on public.host_profiles for select using (true);
create policy "host_profiles_insert_own" on public.host_profiles for insert with check (auth.uid() = user_id);
create policy "host_profiles_update_own" on public.host_profiles for update using (auth.uid() = user_id);
create policy "host_profiles_delete_own" on public.host_profiles for delete using (auth.uid() = user_id);

-- Bookings policies
create policy "bookings_select_own" on public.bookings for select using (auth.uid() = host_id or auth.uid() = learner_id);
create policy "bookings_insert_learner" on public.bookings for insert with check (auth.uid() = learner_id);
create policy "bookings_update_host" on public.bookings for update using (auth.uid() = host_id);
create policy "bookings_update_learner" on public.bookings for update using (auth.uid() = learner_id);
create policy "bookings_delete_own" on public.bookings for delete using (auth.uid() = host_id or auth.uid() = learner_id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
