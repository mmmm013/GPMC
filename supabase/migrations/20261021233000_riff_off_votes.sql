-- Riff-OFF votes on gputnammusic.com (GD, 2026-10-21): listeners vote, the winning
-- riff becomes Riff of the Week, voters who leave an email enter the free-BUG draw.
create table if not exists public.riff_off_votes (
  week date not null,
  voter_id text not null,
  riff_key text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (week, voter_id)
);
alter table public.riff_off_votes enable row level security;
-- No policies: only the server (service role) reads or writes votes and emails.

-- A week's winner is the riff with the most votes once its voting week has closed.
-- A tie goes to the riff whose last vote came first.
create or replace view public.riff_off_winners with (security_invoker = true) as
select distinct on (week) week, riff_key, votes
from (
  select week, riff_key, count(*)::int as votes, max(updated_at) as last_vote
  from public.riff_off_votes
  where week <= (now() at time zone 'utc')::date - 8
  group by week, riff_key
) t
order by week desc, votes desc, last_vote asc;
