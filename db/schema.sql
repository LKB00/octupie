-- Octupie schema for Supabase Postgres.
-- Run as a migration. Shared Instagram data (ig_accounts, reels, snapshots, breakdowns)
-- is written by jobs with the service role and read by any signed-in user.
-- Everything else is scoped to a workspace through RLS.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type plan_tier as enum ('free', 'creator', 'pro');
create type member_role as enum ('owner', 'editor');
create type reel_type as enum ('reel', 'carousel', 'image');
create type script_status as enum ('draft', 'ready', 'filmed', 'posted');
create type script_angle as enum ('same_hook', 'same_structure', 'counter_take', 'from_idea', 'from_pillar');
create type voice_mode as enum ('own', 'neutral');
create type usage_kind as enum ('breakdown', 'script', 'chat_message', 'recheck');
create type job_status as enum ('queued', 'running', 'done', 'failed');

-- ---------- accounts & workspaces ----------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan plan_tier not null default 'free',
  period_start timestamptz not null default date_trunc('month', now()),
  paddle_customer_id text,
  paddle_subscription_id text,
  created_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role member_role not null default 'owner',
  primary key (workspace_id, user_id)
);

create or replace function is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from workspace_members m where m.workspace_id = ws and m.user_id = auth.uid());
$$;

-- ---------- shared Instagram data ----------
create table ig_accounts (
  handle text primary key,                        -- lowercase, no @
  name text,
  avatar_url text,
  bio text,
  followers integer,
  media_count integer,
  is_private boolean not null default false,
  is_business boolean,
  usual_views integer,                            -- median per lib/outliers/baseline.ts
  usual_sample_size integer,
  usual_low_confidence boolean not null default true,
  last_scraped_at timestamptz,
  created_at timestamptz not null default now()
);

create table reels (
  shortcode text primary key,
  owner_handle text not null references ig_accounts(handle) on delete cascade,
  type reel_type not null default 'reel',
  posted_at timestamptz not null,
  caption text,
  hook_line text,                                 -- first spoken line, filled after analysis or transcript
  views integer,
  likes integer,
  comments integer,
  duration_sec numeric,
  thumbnail_path text,                            -- Supabase Storage path
  permalink text not null,
  multiple numeric,                               -- views / owner's usual at last compute
  is_outlier boolean not null default false,
  breaking_score numeric,
  transcript jsonb,                               -- [{start,end,text}]
  language text,
  updated_at timestamptz not null default now()
);
create index reels_owner_posted on reels (owner_handle, posted_at desc);
create index reels_outlier on reels (is_outlier, posted_at desc) where is_outlier;

create table reel_snapshots (
  shortcode text not null references reels on delete cascade,
  captured_at timestamptz not null default now(),
  views integer,
  likes integer,
  comments integer,
  primary key (shortcode, captured_at)
);

create table breakdowns (
  shortcode text primary key references reels on delete cascade,
  observation jsonb not null,                     -- VideoObservation
  breakdown jsonb not null,                       -- Breakdown
  model_versions jsonb not null,                  -- {"video":"…","writer":"…"}
  created_at timestamptz not null default now()
);

-- ---------- creators (brands being written for) ----------
create table creators (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  ig_handle text references ig_accounts(handle),
  display_name text not null,
  avatar_url text,
  primary_language text,
  onboarding_step text not null default 'handle',
  created_at timestamptz not null default now()
);
create index creators_ws on creators (workspace_id);

create table tracked_accounts (
  creator_id uuid not null references creators on delete cascade,
  handle text not null references ig_accounts(handle),
  added_by text not null default 'suggested',     -- suggested | user
  created_at timestamptz not null default now(),
  primary key (creator_id, handle)
);

create table saved_reels (
  creator_id uuid not null references creators on delete cascade,
  shortcode text not null references reels on delete cascade,
  created_at timestamptz not null default now(),
  primary key (creator_id, shortcode)
);

create table strategies (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  version integer not null,
  is_active boolean not null default true,
  about text, positioning text, audience text, goals text,
  pillars jsonb not null default '[]',            -- [{id,name,description}]
  proof jsonb not null default '[]',
  dont_use jsonb not null default '[]',
  interview jsonb,
  created_at timestamptz not null default now(),
  unique (creator_id, version)
);

create table live_facts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  label text not null,
  value text not null,
  checked_at timestamptz not null default now()
);

create table voice_sources (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  kind text not null,                             -- reels | recording | writing
  label text not null,
  word_count integer not null default 0,
  content_path text,                              -- Storage path to text/audio
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table voices (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  version integer not null,
  is_active boolean not null default true,
  profile jsonb not null,                         -- VoiceProfile (user edits applied)
  conflict jsonb,                                 -- VoiceConflict, null when none
  created_at timestamptz not null default now(),
  unique (creator_id, version)
);

-- ---------- scripts & studio ----------
create table scripts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  title text not null,
  status script_status not null default 'draft',
  angle script_angle not null,
  voice_mode voice_mode not null default 'own',
  pillar_id text,
  source_shortcode text references reels(shortcode) on delete set null,
  content jsonb not null,                         -- Script schema, with selectedHook
  posted_shortcode text references reels(shortcode) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index scripts_creator on scripts (creator_id, updated_at desc);

create table script_versions (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references scripts on delete cascade,
  content jsonb not null,
  reason text,                                    -- "generated", "chat: shorter hook", "manual edit"
  created_at timestamptz not null default now()
);

create table threads (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  script_id uuid references scripts on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  patch jsonb,                                    -- tool calls applied to the script
  created_at timestamptz not null default now()
);

-- ---------- usage, notifications, jobs ----------
create table usage_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references workspaces on delete cascade,
  creator_id uuid references creators on delete set null,
  kind usage_kind not null,
  amount integer not null default 1,
  ref text,                                       -- shortcode or script id
  created_at timestamptz not null default now()
);
create index usage_ws_period on usage_events (workspace_id, kind, created_at);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators on delete cascade,
  kind text not null,                             -- feed_ready | voice_ready | breakout | quota
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table ai_calls (
  id bigint generated always as identity primary key,
  workspace_id uuid references workspaces on delete set null,
  step text not null,                             -- watch | breakdown | script | edit | voice | strategy | conflict | tag
  model text not null,
  input_tokens integer, output_tokens integer,
  cost_usd numeric(10,5),
  ok boolean not null,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators on delete cascade,
  kind text not null,
  status job_status not null default 'queued',
  progress jsonb,                                 -- {"step":"transcripts","done":9,"total":14}
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- row-level security ----------
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table ig_accounts enable row level security;
alter table reels enable row level security;
alter table reel_snapshots enable row level security;
alter table breakdowns enable row level security;
alter table creators enable row level security;
alter table tracked_accounts enable row level security;
alter table saved_reels enable row level security;
alter table strategies enable row level security;
alter table live_facts enable row level security;
alter table voice_sources enable row level security;
alter table voices enable row level security;
alter table scripts enable row level security;
alter table script_versions enable row level security;
alter table threads enable row level security;
alter table messages enable row level security;
alter table usage_events enable row level security;
alter table notifications enable row level security;
alter table ai_calls enable row level security;
alter table jobs enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "member reads workspace" on workspaces for select using (is_member(id));
create policy "member reads membership" on workspace_members for select using (user_id = auth.uid() or is_member(workspace_id));

-- shared data: read for signed-in users, writes only via service role (no insert/update policies)
create policy "read ig accounts" on ig_accounts for select to authenticated using (true);
create policy "read reels" on reels for select to authenticated using (true);
create policy "read snapshots" on reel_snapshots for select to authenticated using (true);
create policy "read breakdowns" on breakdowns for select to authenticated using (true);

create policy "creators in my workspace" on creators for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));

-- helper for creator-scoped tables
create or replace function owns_creator(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from creators c where c.id = cid and is_member(c.workspace_id));
$$;

create policy "tracked" on tracked_accounts for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "saved" on saved_reels for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "strategies" on strategies for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "facts" on live_facts for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "voice sources" on voice_sources for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "voices" on voices for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "scripts" on scripts for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "script versions" on script_versions for all
  using (exists (select 1 from scripts s where s.id = script_id and owns_creator(s.creator_id)))
  with check (exists (select 1 from scripts s where s.id = script_id and owns_creator(s.creator_id)));
create policy "threads" on threads for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "messages" on messages for all
  using (exists (select 1 from threads t where t.id = thread_id and owns_creator(t.creator_id)))
  with check (exists (select 1 from threads t where t.id = thread_id and owns_creator(t.creator_id)));
create policy "notifications" on notifications for all using (owns_creator(creator_id)) with check (owns_creator(creator_id));
create policy "jobs read" on jobs for select using (owns_creator(creator_id));
create policy "usage read" on usage_events for select using (is_member(workspace_id));
-- usage_events, ai_calls writes: service role only (server checks quota, then inserts)

-- ---------- quota view ----------
create or replace view workspace_usage with (security_invoker = true) as
select w.id as workspace_id, w.plan, e.kind, coalesce(sum(e.amount), 0)::int as used
from workspaces w
left join usage_events e on e.workspace_id = w.id and e.created_at >= w.period_start
group by w.id, w.plan, e.kind;

-- ---------- updated_at trigger ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger scripts_touch before update on scripts for each row execute function touch_updated_at();
create trigger reels_touch before update on reels for each row execute function touch_updated_at();
create trigger jobs_touch before update on jobs for each row execute function touch_updated_at();
