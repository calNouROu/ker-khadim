update public.categories as existing
set name = 'Accessoires'
where lower(trim(existing.name)) = lower('Accessoires de lecture')
  and not exists (
    select 1
    from public.categories as current_category
    where lower(trim(current_category.name)) = lower('Accessoires')
  );

insert into public.categories (name)
select 'Accessoires'
where not exists (
  select 1
  from public.categories
  where lower(trim(name)) = lower('Accessoires')
);