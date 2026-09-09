create extension if not exists pgcrypto;

create table public.presets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  moves text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger presets_set_updated_at
before update on public.presets
for each row
execute function public.set_updated_at();

alter table public.presets enable row level security;

revoke all on table public.presets from anon, authenticated;
grant select, insert, update, delete on table public.presets to service_role;

comment on table public.presets is
  'Move sequence presets accessed only through the learning REST API';
