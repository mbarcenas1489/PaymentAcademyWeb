-- Migración 011: Eliminación lógica (soft delete) en members y payments
-- Agrega la columna "IsDelete" de tipo boolean con valor por defecto false

begin;

-- 1. Agregar columna "IsDelete" en members
alter table public.members
  add column if not exists "IsDelete" boolean not null default false;

comment on column public.members."IsDelete" is
  'Indicador de eliminación lógica. true indica que el miembro ha sido eliminado.';

-- 2. Agregar columna "IsDelete" en payments
alter table public.payments
  add column if not exists "IsDelete" boolean not null default false;

comment on column public.payments."IsDelete" is
  'Indicador de eliminación lógica. true indica que el pago ha sido eliminado.';

-- 3. Índices parciales para optimizar consultas de registros activos
create index if not exists "idx_members_is_delete"
  on public.members("IsDelete") where "IsDelete" = false;

create index if not exists "idx_payments_is_delete"
  on public.payments("IsDelete") where "IsDelete" = false;

-- 4. Actualizar la vista member_payment_summary para excluir registros con IsDelete = true
drop view if exists public.member_payment_summary;

create view public.member_payment_summary
with (security_invoker = true)
as
select
  m.id as member_id,
  m.organization_id,
  m.full_name,
  m.document_number,
  m.email,
  m.phone,
  m.status as member_status,
  last_payment.id as last_payment_id,
  last_payment.amount as last_amount,
  last_payment.pending_amount as last_pending_amount,
  last_payment.currency as last_currency,
  last_payment.paid_on as last_paid_on,
  last_payment.payment_type as last_payment_type,
  last_payment.payment_method as last_payment_method,
  last_payment.valid_from as last_valid_from,
  last_payment.valid_until as last_valid_until
from public.members m
left join lateral (
  select
    p.id,
    p.amount,
    p.pending_amount,
    p.currency,
    p.paid_on,
    p.payment_type,
    p.payment_method,
    p.valid_from,
    p.valid_until
  from public.payments p
  where p.organization_id = m.organization_id
    and p.member_id = m.id
    and coalesce(p."IsDelete", false) = false
  order by p.paid_on desc, p.created_at desc
  limit 1
) last_payment on true
where coalesce(m."IsDelete", false) = false;

grant select on public.member_payment_summary to authenticated;

commit;

notify pgrst, 'reload schema';

