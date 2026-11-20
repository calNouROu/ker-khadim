insert into public.categories (name)
select seeded.name
from (
  values
    ('Parfums'),
    ('Parfums homme'),
    ('Parfums femme'),
    ('Parfums mixtes'),
    ('Muscs'),
    ('Oud'),
    ('Encens'),
    ('Huiles parfumées'),
    ('Coffrets parfumés')
) as seeded(name)
where not exists (
  select 1
  from public.categories as existing
  where lower(trim(existing.name)) = lower(trim(seeded.name))
);
