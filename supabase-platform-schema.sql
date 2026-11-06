-- Run this AFTER supabase-schema.sql
-- Safe to re-run (uses IF NOT EXISTS and DROP POLICY IF EXISTS)
--
-- NOTE: The contact-form table is called "messages" (in supabase-schema.sql).
-- The chat table here is called "chat_messages" to avoid collision.

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  age         integer not null,
  city        text not null,
  gender      text not null,
  photos      text[]  default '{}',
  prompts     jsonb   default '[]',
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "read_active_profiles" on profiles;
drop policy if exists "insert_own_profile"   on profiles;
drop policy if exists "update_own_profile"   on profiles;

create policy "read_active_profiles" on profiles for select to authenticated using (is_active = true);
create policy "insert_own_profile"   on profiles for insert to authenticated with check (auth.uid() = id);
create policy "update_own_profile"   on profiles for update to authenticated using (auth.uid() = id);

-- ── Likes ─────────────────────────────────────────────────────────────────────
create table if not exists likes (
  id           uuid primary key default gen_random_uuid(),
  from_user    uuid references profiles(id) on delete cascade,
  to_user      uuid references profiles(id) on delete cascade,
  element_type text not null,
  element_idx  integer not null default 0,
  comment      text,
  created_at   timestamptz default now(),
  unique(from_user, to_user)
);

alter table likes enable row level security;

drop policy if exists "insert_own_likes" on likes;
drop policy if exists "read_own_likes"   on likes;

create policy "insert_own_likes" on likes for insert to authenticated with check (auth.uid() = from_user);
create policy "read_own_likes"   on likes for select  to authenticated using  (auth.uid() = from_user or auth.uid() = to_user);

-- ── Matches ───────────────────────────────────────────────────────────────────
create table if not exists matches (
  id         uuid primary key default gen_random_uuid(),
  user1      uuid references profiles(id) on delete cascade,
  user2      uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1, user2)
);

alter table matches enable row level security;

drop policy if exists "read_own_matches" on matches;
drop policy if exists "insert_matches"   on matches;

create policy "read_own_matches" on matches for select to authenticated using (auth.uid() = user1 or auth.uid() = user2);
create policy "insert_matches"   on matches for insert to authenticated with check (auth.uid() = user1 or auth.uid() = user2);

-- ── Chat messages (NOT the contact-form "messages" table) ─────────────────────
create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid references matches(id) on delete cascade,
  sender_id  uuid references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;

drop policy if exists "read_chat_messages"   on chat_messages;
drop policy if exists "insert_chat_messages" on chat_messages;

create policy "read_chat_messages" on chat_messages for select to authenticated
  using (
    match_id in (
      select id from matches
      where user1 = auth.uid() or user2 = auth.uid()
    )
  );

create policy "insert_chat_messages" on chat_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and match_id in (
      select id from matches
      where user1 = auth.uid() or user2 = auth.uid()
    )
  );

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_profiles_city       on profiles(city);
create index if not exists idx_likes_to_user       on likes(to_user);
create index if not exists idx_chat_messages_match on chat_messages(match_id, created_at);

-- ── Realtime (safe — catches duplicates) ──────────────────────────────────────
do $$
begin
  begin alter publication supabase_realtime add table chat_messages;
  exception when others then null; end;
  begin alter publication supabase_realtime add table matches;
  exception when others then null; end;
  begin alter publication supabase_realtime add table likes;
  exception when others then null; end;
end $$;

-- ── Storage policies for prima-facie-profiles bucket ─────────────────────────
-- In Supabase: Storage → prima-facie-profiles → Policies → New policy
--
-- Policy 1 — Upload (INSERT), authenticated:
--   WITH CHECK: bucket_id = 'prima-facie-profiles' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy 2 — View (SELECT), authenticated:
--   USING: bucket_id = 'prima-facie-profiles'
