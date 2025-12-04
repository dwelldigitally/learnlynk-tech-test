-- LearnLynk Tech Test - Task 2: RLS Policies on leads

alter table public.leads enable row level security;

-- Helper to access JWT claims:
-- current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
-- current_setting('request.jwt.claims', true)::jsonb ->> 'role'
-- current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'

------------------------------------------
-- SELECT POLICY
------------------------------------------
-- Rules:
-- - Admins can see all leads of their tenant
-- - Counselors can see:
--     leads they own (owner_id = user_id)
--     OR leads where the team_id is in their team list
--
-- Tables assumed to exist:
-- user_teams(user_id, team_id)
-- teams(id, tenant_id)

create policy leads_select_policy
on public.leads
for select
using (
  (
    -- tenant must match
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
  )
  AND
  (
    -- admin can see all leads
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'

    OR

    -- counselor sees leads they own
    owner_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid

    OR

    -- counselor sees leads assigned to their team
    (
      team_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.user_teams ut
        WHERE ut.team_id = leads.team_id
        AND ut.user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid
      )
    )
  )
);

------------------------------------------
-- INSERT POLICY
------------------------------------------
-- Rules:
-- - Admins + counselors can insert
-- - Inserted row tenant_id must match JWT tenant
------------------------------------------

create policy leads_insert_policy
on public.leads
for insert
with check (
  -- tenant must match for inserted rows
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid

  AND
  (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'counselor'
  )
);
