create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '✅',
  color_rgb text not null default '139 92 246',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days int[] default null,
  xp_reward int not null default 10,
  sort_order int not null default 0,
  routine text not null default 'anytime' check (routine in ('morning', 'evening', 'anytime')),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_habits_user on habits(user_id);

alter table habits enable row level security;

create policy "Users manage own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique(habit_id, completed_date)
);

create index idx_habit_completions_user_date on habit_completions(user_id, completed_date desc);
create index idx_habit_completions_habit on habit_completions(habit_id, completed_date desc);

alter table habit_completions enable row level security;

create policy "Users manage own habit completions"
  on habit_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
