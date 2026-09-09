create table public.cubes (
  id uuid primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger cubes_set_updated_at
before update on public.cubes
for each row
execute function public.set_updated_at();

alter table public.cubes enable row level security;

revoke all on table public.cubes from anon, authenticated;
grant select, insert, update, delete on table public.cubes to service_role;

comment on table public.cubes is
  'Learning cube states accessed only through the REST API';
