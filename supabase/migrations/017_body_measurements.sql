-- Body measurement tracking
create table if not exists body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  body_part text not null,
  value_cm numeric(6,1) not null,
  note text,
  created_at timestamptz not null default now()
);

create index idx_body_measurements_user on body_measurements(user_id, body_part, measured_at desc);

alter table body_measurements enable row level security;
create policy "Users manage own measurements" on body_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Measurement goals
create table if not exists measurement_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body_part text not null,
  target_cm numeric(6,1) not null,
  created_at timestamptz not null default now(),
  unique(user_id, body_part)
);

alter table measurement_goals enable row level security;
create policy "Users manage own goals" on measurement_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
