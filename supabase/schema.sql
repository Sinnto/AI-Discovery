create extension if not exists pgcrypto;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  author text not null check (char_length(author) between 1 and 80),
  tag text not null check (char_length(tag) between 1 and 40),
  message text not null check (char_length(message) between 1 and 1200),
  media_url text,
  media_type text,
  media_path text,
  cutout_url text,
  cutout_path text,
  cutout_label text,
  media_label text not null default 'cloud memory frame',
  specimens text[] not null default '{}',
  gradient text not null
);

alter table public.memories add column if not exists cutout_url text;
alter table public.memories add column if not exists cutout_path text;
alter table public.memories add column if not exists cutout_label text;

create index if not exists memories_created_at_idx on public.memories (created_at desc);

alter table public.memories enable row level security;

drop policy if exists "Anyone can read memories" on public.memories;
create policy "Anyone can read memories"
on public.memories
for select
to anon
using (true);

drop policy if exists "Anyone can add memories" on public.memories;
create policy "Anyone can add memories"
on public.memories
for insert
to anon
with check (true);

insert into storage.buckets (id, name, public)
values ('lulu-memories', 'lulu-memories', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can read lulu memory media" on storage.objects;
create policy "Anyone can read lulu memory media"
on storage.objects
for select
to anon
using (bucket_id = 'lulu-memories');

drop policy if exists "Anyone can upload lulu memory media" on storage.objects;
create policy "Anyone can upload lulu memory media"
on storage.objects
for insert
to anon
with check (bucket_id = 'lulu-memories');
