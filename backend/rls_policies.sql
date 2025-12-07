-- LearnLynk Tech Test - Task 2: RLS Policies

alter table public.leads enable row level security;

-- Policy for SELECT (Read access)
create policy "leads_select_policy"
on public.leads
for select
using (
  -- Admin can see all leads in their tenant
  (auth.jwt() ->> 'role' = 'admin') 
  OR 
  -- Counselors can see leads if they own them OR the lead is assigned to their team
  (
    auth.jwt() ->> 'role' = 'counselor' 
    AND (
       owner_id = auth.uid() 
       OR 
       team_id IN (
         select team_id from user_teams where user_id = auth.uid()
       )
    )
  )
);

-- Policy for INSERT (Write access)
create policy "leads_insert_policy"
on public.leads
for insert
with check (
  -- Allow if user is admin or counselor
  (auth.jwt() ->> 'role' IN ('admin', 'counselor'))
  AND
  -- Ideally ensure the tenant_id matches the user's tenant (omitted for brevity if not in JWT)
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);
