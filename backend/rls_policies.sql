alter table public.leads enable row level security;

-- Counselors:
-- can see leads where they are owner_id
-- OR where owner belongs to one of their teams
-- Admins:
-- can see all leads in tenant

create policy "leads_select_policy"
on public.leads
for select
using (

-- Admins can view all leads in the tenant
  (auth.jwt() ->> 'role' = 'admin'
    AND tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  )

  OR

-- Counselors can view leads they own
  (owner_id = auth.uid())

  OR

-- Counselors can view leads owned by users in their teams
  (owner_id IN (
      select user_id
      from public.user_teams
      where team_id in (
          -- Teams current user belongs to
          select team_id
          from public.user_teams
          where user_id = auth.uid()
      )
  ))

);

-- Both counselors & admins can insert
-- BUT only for their own tenant

create policy "leads_insert_policy"
on public.leads
for insert
with check (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);
