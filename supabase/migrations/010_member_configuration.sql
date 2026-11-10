-- Crea la tabla MemberConfiguration para almacenar configuraciones específicas por miembro
-- Ejecutar en el SQL Editor de Supabase.

begin;

create table if not exists public."MemberConfiguration" (
  "Id" uuid primary key default gen_random_uuid(),
  "MemberId" uuid not null references public.members(id) on delete cascade,
  "SettingName" text not null,
  "value" jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_configuration_unique_setting unique ("MemberId", "SettingName")
);

comment on table public."MemberConfiguration" is
  'Configuraciones específicas por miembro asociadas a su MemberId y SettingName.';

-- Habilitar RLS y políticas para usuarios autenticados
alter table public."MemberConfiguration" enable row level security;

drop policy if exists "authenticated_select_member_configuration" on public."MemberConfiguration";
create policy "authenticated_select_member_configuration"
  on public."MemberConfiguration"
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated_manage_member_configuration" on public."MemberConfiguration";
create policy "authenticated_manage_member_configuration"
  on public."MemberConfiguration"
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public."MemberConfiguration" to authenticated;

commit;

notify pgrst, 'reload schema';

