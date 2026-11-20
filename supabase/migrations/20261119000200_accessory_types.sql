insert into public.categories (name)
select seeded.name
from (
  values
    ('Chapelets'),
    ('Tapis de prière'),
    ('Autres accessoires')
) as seeded(name)
where not exists (
  select 1
  from public.categories as existing
  where lower(trim(existing.name)) = lower(trim(seeded.name))
);
