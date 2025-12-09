-- LearnLynk Tech Test - Task 1: Schema
-- Fill in the definitions for leads, applications, tasks as per README.

create extension if not exists "pgcrypto";

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  owner_id uuid not null,
  email text,
  phone text,
  full_name text,
  stage text not null default 'new',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO: add useful indexes for leads:

CREATE INDEX IF NOT EXISTS idx_leads_tenant_owner_stage
 ON public.leads(tenant_id, owner_id, stage);

CREATE INDEX IF NOT EXISTS idx_leads_created_at
 ON public.leads(created_at);



-- Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null references public.leads(id) on delete cascade,
  program_id uuid,
  intake_id uuid,
  stage text not null default 'inquiry',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO: add useful indexes for applications:
-- Indexes for applications
create index if not exists idx_applications_tenant_lead
  on public.applications (tenant_id, lead_id);

create index if not exists idx_applications_stage
  on public.applications (stage);


-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  application_id uuid not null references public.applications(id) on delete cascade,
  title text,
  type text not null,
  status text not null default 'open',
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO:
-- - add check constraint for type in ('call','email','review')
alter table public.tasks
  add constraint task_type_check
  check (type in ('call', 'email', 'review'));

-- - add constraint that due_at >= created_at
alter table public.tasks
  add constraint task_due_after_created_check
  check (due_at >= created_at);

-- - add indexes for tasks due today by tenant_id, due_at, status
create index if not exists idx_tasks_tenant_due_status
  on public.tasks (tenant_id, due_at, status);
