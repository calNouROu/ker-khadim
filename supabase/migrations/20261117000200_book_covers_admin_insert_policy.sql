-- Repair the administrator check and the book cover upload policies.
-- Requires public.profiles (created by the storefront schema migration).

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

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do update set public = true;

drop policy if exists "book_covers_admin_insert" on storage.objects;
create policy "book_covers_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'book-covers' and (select public.is_admin()));

drop policy if exists "book_covers_insert_restriction" on storage.objects;
create policy "book_covers_insert_restriction"
  on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'book-covers' or (select public.is_admin()));
