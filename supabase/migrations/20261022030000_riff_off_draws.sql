-- Riff-OFF free-BUG draw (GD, 2026-10-22: "build"). Once a week's voting has
-- closed, one voter who left an email is drawn at random for a free BUG to send.
-- One row per week, so a week can never be drawn twice. Server only.
create table if not exists public.riff_off_draws (
  week date primary key,
  entrants int not null,
  winner_voter_id text,
  winner_email text,
  drawn_at timestamptz not null default now(),
  prize_sent_at timestamptz
);
alter table public.riff_off_draws enable row level security;
-- No policies: only the server (service role) reads or writes the draw.
