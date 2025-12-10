create extension if not exists "pgcrypto";

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  owner_id uuid not null,
  full_name text,
  email text,
  phone text,
  stage text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for leads
create index if not exists idx_leads_tenant on leads(tenant_id);
create index if not exists idx_leads_owner on leads(owner_id);
create index if not exists idx_leads_stage on leads(stage);

-- Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null references public.leads(id) on delete cascade,
  program_id uuid,
  intake_id uuid,
  stage text default 'inquiry',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for applications
create index if not exists idx_apps_tenant on applications(tenant_id);
create index if not exists idx_apps_lead on applications(lead_id);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  application_id uuid not null references public.applications(id) on delete cascade,
  type text not null,
  status text not null default 'open',
  due_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Constraints
  constraint task_type_check
    check (type in ('call', 'email', 'review')),

  constraint task_due_at_check
    check (due_at >= created_at)
);

-- Indexes for tasks
create index if not exists idx_tasks_tenant on tasks(tenant_id);
create index if not exists idx_tasks_due on tasks(due_at);
create index if not exists idx_tasks_status on tasks(status);
