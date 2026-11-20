alter table public.products
  add column if not exists video_url text;

comment on column public.products.video_url is
  'URL publique d’une courte vidéo MP4 ou WebM de présentation de l’ouvrage.';

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

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-videos',
  'product-videos',
  true,
  52428800,
  array['video/mp4', 'video/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists product_videos_public_read on storage.objects;
create policy product_videos_public_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-videos');

drop policy if exists product_videos_admin_insert on storage.objects;
create policy product_videos_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-videos' and (select public.is_admin()));

drop policy if exists product_videos_insert_restriction on storage.objects;
create policy product_videos_insert_restriction
  on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'product-videos' or (select public.is_admin()));

drop policy if exists product_videos_admin_update on storage.objects;
create policy product_videos_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'product-videos' and (select public.is_admin()))
  with check (bucket_id = 'product-videos' and (select public.is_admin()));

drop policy if exists product_videos_update_restriction on storage.objects;
create policy product_videos_update_restriction
  on storage.objects as restrictive for update to anon, authenticated
  using (bucket_id <> 'product-videos' or (select public.is_admin()))
  with check (bucket_id <> 'product-videos' or (select public.is_admin()));

drop policy if exists product_videos_admin_delete on storage.objects;
create policy product_videos_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-videos' and (select public.is_admin()));

drop policy if exists product_videos_delete_restriction on storage.objects;
create policy product_videos_delete_restriction
  on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'product-videos' or (select public.is_admin()));
