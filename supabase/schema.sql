-- Fonts Library schema. Mirrors the applied migrations:
--   fonts_library_core
--   fonts_library_contributors
--   fonts_library_personal_spaces

create extension if not exists "pgcrypto";

create table if not exists public.fonts (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text not null unique,
	category text,
	notes text,
	source_type text not null check (source_type in ('file', 'link')),
	css_url text,
	css_family text,
	source_page text,
	license text,
	-- Contributor who added this family.
	added_by uuid references auth.users on delete set null,
	added_by_name text,
	-- True for the one copy that represents the family publicly.
	is_public boolean not null default true,
	-- Normalised family name used to detect duplicates.
	dedupe_key text,
	created_at timestamptz not null default now()
);

create table if not exists public.font_faces (
	id uuid primary key default gen_random_uuid(),
	font_id uuid not null references public.fonts on delete cascade,
	label text,
	weight integer not null default 400,
	style text not null default 'normal' check (style in ('normal', 'italic')),
	file_path text,
	file_url text,
	format text,
	created_at timestamptz not null default now()
);

create table if not exists public.favorites (
	user_id uuid not null references auth.users on delete cascade,
	font_id uuid not null references public.fonts on delete cascade,
	created_at timestamptz not null default now(),
	primary key (user_id, font_id)
);

create index if not exists font_faces_font_id_idx on public.font_faces (font_id);
create index if not exists favorites_font_id_idx on public.favorites (font_id);
create index if not exists fonts_added_by_idx on public.fonts (added_by);
create index if not exists fonts_is_public_idx on public.fonts (is_public);

-- Only one public copy per family: the first person to add it keeps the slot.
create unique index if not exists fonts_public_dedupe_idx
	on public.fonts (dedupe_key) where is_public;

-- Aggregate like counts, readable by anyone without exposing who liked what.
create or replace view public.font_favorite_counts
with (security_invoker = false) as
select font_id, count(*)::int as favorite_count
from public.favorites
group by font_id;

alter table public.fonts enable row level security;
alter table public.font_faces enable row level security;
alter table public.favorites enable row level security;

-- A family is readable when it is public, or when you added it.
drop policy if exists "fonts are public" on public.fonts;
drop policy if exists "public or own fonts are readable" on public.fonts;
create policy "public or own fonts are readable" on public.fonts
	for select using (is_public or added_by = auth.uid());

drop policy if exists "font faces are public" on public.font_faces;
drop policy if exists "faces follow their font" on public.font_faces;
create policy "faces follow their font" on public.font_faces
	for select using (
		exists (
			select 1 from public.fonts f
			where f.id = font_faces.font_id
				and (f.is_public or f.added_by = auth.uid())
		)
	);

drop policy if exists "own favorites are readable" on public.favorites;
create policy "own favorites are readable" on public.favorites
	for select using (user_id = auth.uid());

drop policy if exists "own favorites are insertable" on public.favorites;
create policy "own favorites are insertable" on public.favorites
	for insert with check (user_id = auth.uid());

drop policy if exists "own favorites are deletable" on public.favorites;
create policy "own favorites are deletable" on public.favorites
	for delete using (user_id = auth.uid());

-- Writes go through the server with the service role key, which bypasses RLS.

-- Public bucket for uploaded font files.
insert into storage.buckets (id, name, public)
values ('font-files', 'font-files', true)
on conflict (id) do nothing;

drop policy if exists "font files are public" on storage.objects;
create policy "font files are public" on storage.objects
	for select using (bucket_id = 'font-files');
