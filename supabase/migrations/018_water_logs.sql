create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml int not null check (amount_ml > 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_water_logs_user_date on water_logs(user_id, logged_at desc);

alter table water_logs enable row level security;

create policy "Users manage own water logs"
  on water_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
