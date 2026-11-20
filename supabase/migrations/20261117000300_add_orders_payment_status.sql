-- Add the payment state used by the admin dashboard to existing orders.
-- Existing orders are conservatively marked as unpaid.

alter table public.orders
  add column if not exists payment_status text;

update public.orders
set payment_status = 'unpaid'
where payment_status is null;

alter table public.orders
  alter column payment_status set default 'unpaid',
  alter column payment_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'))
      not valid;
  end if;
end;
$$;


grant update (payment_status) on public.orders to authenticated;
