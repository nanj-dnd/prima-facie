-- Run this in your Supabase SQL editor (Database → SQL Editor → New query)

-- Applications table
create table if not exists applications (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  age           integer not null check (age >= 18 and age <= 28),
  city          text not null,
  gender        text not null,
  photo_url     text,
  selfie_url    text,
  payment_id    text,
  order_id      text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

-- Contact messages table
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Community votes table (for future member voting feature)
create table if not exists votes (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid references applications(id) on delete cascade,
  vote            text not null check (vote in ('yes', 'no')),
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_applications_status on applications(status);
create index if not exists idx_applications_created_at on applications(created_at desc);
create index if not exists idx_messages_created_at on messages(created_at desc);
create index if not exists idx_votes_application_id on votes(application_id);

-- Storage: create a bucket called 'prima-facie-applications' in the Supabase dashboard
-- Storage → New bucket → Name: prima-facie-applications → Public: true
