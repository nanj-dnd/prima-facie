-- Allowlist of accepted-applicant emails.
-- Populated automatically whenever an admin accepts an application — this is
-- the single signal the platform checks to decide whether someone may create
-- an account and sign in (replaces the old magic-link invite flow).
create table if not exists accepted_emails (
  email text primary key,
  created_at timestamptz default now()
);

-- Backfill anyone already accepted before this table existed, so nobody loses access
insert into accepted_emails (email)
select distinct lower(email) from applications where status = 'accepted'
on conflict (email) do nothing;

alter table accepted_emails enable row level security;

-- Locked down — only the service role (admin API + sign-in check) reads/writes this
