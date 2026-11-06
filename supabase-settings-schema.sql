-- Platform settings: single-row table controlling whether applications are open
create table if not exists platform_settings (
  id int primary key default 1,
  applications_open boolean not null default false,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into platform_settings (id, applications_open)
values (1, false)
on conflict (id) do nothing;

alter table platform_settings enable row level security;

-- Anyone (anon) can read the setting — the public /apply page needs this
create policy "Public can read platform settings"
  on platform_settings for select
  using (true);

-- Only service role (admin API) can update — no public write policy needed
