update public.categories as source
set name = case
  when lower(trim(source.name)) in ('parfum homme', 'parfums homme') then 'Homme'
  else 'Femme'
end
where lower(trim(source.name)) in (
  'parfum homme',
  'parfums homme',
  'parfum femme',
  'parfums femme'
)
and not exists (
  select 1
  from public.categories as target
  where target.id <> source.id
    and lower(trim(target.name)) = case
      when lower(trim(source.name)) in ('parfum homme', 'parfums homme') then 'homme'
      else 'femme'
    end
);
