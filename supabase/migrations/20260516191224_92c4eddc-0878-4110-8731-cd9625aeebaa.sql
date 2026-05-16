
-- BOB chat threads and messages
create table public.bob_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bob_threads_user_idx on public.bob_threads(user_id, updated_at desc);

create table public.bob_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.bob_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  ui_message jsonb not null,
  created_at timestamptz not null default now()
);

create index bob_messages_thread_idx on public.bob_messages(thread_id, created_at);

alter table public.bob_threads enable row level security;
alter table public.bob_messages enable row level security;

create policy "bob_threads owner read"
  on public.bob_threads for select to authenticated
  using (user_id = auth.uid());
create policy "bob_threads owner insert"
  on public.bob_threads for insert to authenticated
  with check (user_id = auth.uid());
create policy "bob_threads owner update"
  on public.bob_threads for update to authenticated
  using (user_id = auth.uid());
create policy "bob_threads owner delete"
  on public.bob_threads for delete to authenticated
  using (user_id = auth.uid());

create policy "bob_messages owner read"
  on public.bob_messages for select to authenticated
  using (user_id = auth.uid());
create policy "bob_messages owner insert"
  on public.bob_messages for insert to authenticated
  with check (user_id = auth.uid());
create policy "bob_messages owner delete"
  on public.bob_messages for delete to authenticated
  using (user_id = auth.uid());

-- keep thread.updated_at fresh on new messages
create or replace function public.bob_touch_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.bob_threads set updated_at = now() where id = NEW.thread_id;
  return NEW;
end; $$;

create trigger bob_messages_touch_thread
  after insert on public.bob_messages
  for each row execute function public.bob_touch_thread();
