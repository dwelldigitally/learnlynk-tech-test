-- LearnLynk Tech Test - Task 1: Schema
-- Filled definitions for leads, applications, tasks as per README.

create extension if not exists "pgcrypto";

-----------------------------
-- Leads table
-----------------------------
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

-- Indexes for leads:
create index if not exists idx_leads_tenant on public.leads(tenant_id);
create index if not exists idx_leads_owner on public.leads(owner_id);
create index if not exists idx_leads_stage on public.leads(stage);
create index if not exists idx_leads_created_at on public.leads(created_at);


-----------------------------
-- Applications table
-----------------------------
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

-- Indexes for applications:
create index if not exists idx_apps_tenant on public.applications(tenant_id);
create index if not exists idx_apps_lead_id on public.applications(lead_id);
create index if not exists idx_apps_stage on public.applications(stage);


-----------------------------
-- Tasks table
-----------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  application_id uuid not null references public.applications(id) on delete cascade,
  title text,
  type text not null,
  status text not null default 'open',
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- constraints (as per test)
  constraint task_type_check check (type in ('call','email','review')),
  constraint due_after_created check (due_at >= created_at)
);

-- Indexes for tasks (tasks due today)
create index if not exists idx_tasks_tenant on public.tasks(tenant_id);
create index if not exists idx_tasks_due_at on public.tasks(due_at);
create index if not exists idx_tasks_status on public.tasks(status);
