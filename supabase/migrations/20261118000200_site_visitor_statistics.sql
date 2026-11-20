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

create table if not exists public.site_visitor_sessions (
  visitor_session_id uuid primary key,
  first_seen_at timestamptz not null default now()
);

alter table public.site_visitor_sessions enable row level security;
revoke all on table public.site_visitor_sessions from anon, authenticated;

create or replace function public.record_site_visitor(
  p_visitor_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visitor_session_id is null then
    return;
  end if;

  insert into public.site_visitor_sessions (visitor_session_id)
  values (p_visitor_session_id)
  on conflict (visitor_session_id) do nothing;
end;
$$;

revoke all on function public.record_site_visitor(uuid) from public;
grant execute on function public.record_site_visitor(uuid) to anon, authenticated;

create or replace function public.get_site_visitor_stats()
returns table (
  total_visitors bigint,
  visitors_today bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  return query
  select
    count(*)::bigint,
    count(*) filter (
      where (first_seen_at at time zone 'Europe/Paris')::date =
        (now() at time zone 'Europe/Paris')::date
    )::bigint
  from public.site_visitor_sessions;
end;
$$;

revoke all on function public.get_site_visitor_stats() from public, anon;
grant execute on function public.get_site_visitor_stats() to authenticated;
