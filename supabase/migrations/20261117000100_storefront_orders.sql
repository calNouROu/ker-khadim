create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  category_id uuid references public.categories (id) on delete set null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  customer_name text not null,
  phone text not null,
  shipping_address text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  total numeric(12, 2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_title text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.categories
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists updated_at timestamptz not null default now();

update public.categories
set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
where slug is null;

alter table public.products
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete restrict,
  add column if not exists customer_id uuid references auth.users (id) on delete restrict,
  add column if not exists shipping_address text,
  add column if not exists address text,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists updated_at timestamptz not null default now();

update public.orders
set user_id = coalesce(user_id, customer_id),
    customer_id = coalesce(customer_id, user_id),
    shipping_address = coalesce(shipping_address, address),
    address = coalesce(address, shipping_address)
where user_id is null or customer_id is null or shipping_address is null or address is null;

alter table public.order_items
  add column if not exists line_total numeric(12, 2) not null default 0,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and confrelid = 'public.categories'::regclass
      and contype = 'f'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.categories (id)
      on delete set null
      not valid;
  end if;
end;
$$;

create index if not exists products_active_created_at_idx
  on public.products (created_at desc)
  where is_active = true;
create index if not exists products_category_id_idx
  on public.products (category_id);
create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.role <> 'customer'
      and (select auth.uid()) is not null
      and not public.is_admin()
    then
      raise exception 'Only an administrator can assign an elevated profile role'
        using errcode = '42501';
    end if;
  elsif new.role is distinct from old.role
    and (select auth.uid()) is not null
    and not public.is_admin()
  then
    raise exception 'Only an administrator can change a profile role'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_insert_escalation on public.profiles;
create trigger prevent_profile_role_insert_escalation
  before insert on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update of role on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists ker_khadim_create_profile_on_signup on auth.users;
create trigger ker_khadim_create_profile_on_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.profiles, public.categories, public.products,
  public.orders, public.order_items from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.categories, public.products to anon;
grant select, insert, update, delete on public.categories, public.products
  to authenticated;
grant select on public.categories to authenticated;
grant select on public.orders, public.order_items to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'categories', 'products', 'orders', 'order_items')
  loop
    execute format(
      'drop policy %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

drop policy if exists "profiles_read_own_or_admin" on public.profiles;
create policy "profiles_read_own_or_admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles_insert_own_customer" on public.profiles;
create policy "profiles_insert_own_customer"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and role = 'customer');

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (
    (id = (select auth.uid()) and role = 'customer')
    or (select public.is_admin())
  );

drop policy if exists "categories_read_public" on public.categories;
create policy "categories_read_public"
  on public.categories for select to anon, authenticated
  using (true);

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
  on public.categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "products_read_published" on public.products;
create policy "products_read_published"
  on public.products for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));

drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
  on public.products for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "orders_read_own_or_admin" on public.orders;
create policy "orders_read_own_or_admin"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;

create or replace function public.validate_order_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
    or (old.status = 'confirmed' and new.status in ('preparing', 'cancelled'))
    or (old.status = 'preparing' and new.status in ('shipped', 'cancelled'))
    or (old.status = 'shipped' and new.status = 'delivered')
  ) then
    raise exception 'Invalid order status transition'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_order_status_transition on public.orders;
create trigger validate_order_status_transition
  before update of status on public.orders
  for each row execute function public.validate_order_status_transition();

create or replace function public.restore_stock_on_order_cancellation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products as product
    set stock = product.stock + cancelled_item.quantity
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id
        and product_id is not null
      group by product_id
    ) as cancelled_item
    where product.id = cancelled_item.product_id;
  end if;

  return new;
end;
$$;

drop trigger if exists restore_stock_on_order_cancellation on public.orders;
create trigger restore_stock_on_order_cancellation
  after update of status on public.orders
  for each row execute function public.restore_stock_on_order_cancellation();

drop policy if exists "order_items_read_own_or_admin" on public.order_items;
create policy "order_items_read_own_or_admin"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and (
          orders.user_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

create or replace function public.place_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_shipping_address text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_order_id uuid;
  v_total numeric(12, 2) := 0;
  v_item record;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to place an order'
      using errcode = '42501';
  end if;

  if nullif(trim(p_customer_name), '') is null
    or length(trim(p_customer_name)) > 200
    or nullif(trim(p_phone), '') is null
    or length(trim(p_phone)) > 40
    or nullif(trim(p_shipping_address), '') is null
    or length(trim(p_shipping_address)) > 1000
  then
    raise exception 'Valid customer name, phone, and shipping address are required'
      using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'The order items must be a JSON array'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'The order must contain between 1 and 50 items'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
    where item.product_id is null
      or item.quantity is null
      or item.quantity <= 0
  ) then
    raise exception 'Each order item must have a product and a positive quantity'
      using errcode = '22023';
  end if;

  perform product.id
  from public.products as product
  join (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
  ) as requested on requested.product_id = product.id
  order by product.id
  for update of product;

  if exists (
    select 1
    from (
      select item.product_id, sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
      group by item.product_id
    ) as requested
    left join public.products as product on product.id = requested.product_id
    where product.id is null
      or product.is_active is not true
      or product.stock < requested.quantity
  ) then
    raise exception 'A product is unavailable or has insufficient stock'
      using errcode = '22023';
  end if;

  insert into public.orders (
    user_id,
    customer_id,
    customer_name,
    phone,
    shipping_address,
    address
  )
  values (
    v_user_id,
    v_user_id,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_shipping_address),
    trim(p_shipping_address)
  )
  returning id into v_order_id;

  for v_item in
    select
      product.id as product_id,
      product.title,
      product.price,
      sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
    join public.products as product on product.id = item.product_id
    group by product.id
    order by product.id
  loop
    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id
      and is_active = true
      and stock >= v_item.quantity;

    if not found then
      raise exception 'A product is unavailable or has insufficient stock'
        using errcode = '22023';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_title,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order_id,
      v_item.product_id,
      v_item.title,
      v_item.price,
      v_item.quantity,
      v_item.price * v_item.quantity
    );

    v_total := v_total + (v_item.price * v_item.quantity);
  end loop;

  update public.orders
  set total = v_total
  where id = v_order_id;

  return jsonb_build_object('order_id', v_order_id, 'total', v_total);
end;
$$;

revoke all on function public.place_order(jsonb, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text) to authenticated;

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do update set public = true;

drop policy if exists "book_covers_public_read" on storage.objects;
create policy "book_covers_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'book-covers');

drop policy if exists "book_covers_admin_insert" on storage.objects;
create policy "book_covers_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'book-covers' and (select public.is_admin()));

drop policy if exists "book_covers_insert_restriction" on storage.objects;
create policy "book_covers_insert_restriction"
  on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'book-covers' or (select public.is_admin()));

drop policy if exists "book_covers_admin_update" on storage.objects;
create policy "book_covers_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'book-covers' and (select public.is_admin()))
  with check (bucket_id = 'book-covers' and (select public.is_admin()));

drop policy if exists "book_covers_update_restriction" on storage.objects;
create policy "book_covers_update_restriction"
  on storage.objects as restrictive for update to anon, authenticated
  using (bucket_id <> 'book-covers' or (select public.is_admin()))
  with check (bucket_id <> 'book-covers' or (select public.is_admin()));

drop policy if exists "book_covers_admin_delete" on storage.objects;
create policy "book_covers_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'book-covers' and (select public.is_admin()));

drop policy if exists "book_covers_delete_restriction" on storage.objects;
create policy "book_covers_delete_restriction"
  on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'book-covers' or (select public.is_admin()));
