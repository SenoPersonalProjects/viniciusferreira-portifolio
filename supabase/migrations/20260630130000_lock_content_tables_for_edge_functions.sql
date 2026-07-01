-- Public and admin content is served through Supabase Edge Functions.
-- Direct anon/authenticated table access stays closed; server-side functions use
-- a secret/service key and bypass these grants/RLS policies.

alter table public."Profile" enable row level security;
alter table public."ContactLink" enable row level security;
alter table public."Technology" enable row level security;
alter table public."Project" enable row level security;
alter table public."RoadmapItem" enable row level security;
alter table public."SiteCopy" enable row level security;
alter table public."DossierContent" enable row level security;

revoke all on table public."Profile" from anon, authenticated;
revoke all on table public."ContactLink" from anon, authenticated;
revoke all on table public."Technology" from anon, authenticated;
revoke all on table public."Project" from anon, authenticated;
revoke all on table public."RoadmapItem" from anon, authenticated;
revoke all on table public."SiteCopy" from anon, authenticated;
revoke all on table public."DossierContent" from anon, authenticated;
