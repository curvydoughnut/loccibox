
create or replace function public.bob_touch_thread()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  update public.bob_threads set updated_at = now() where id = NEW.thread_id;
  return NEW;
end; $$;

revoke execute on function public.bob_touch_thread() from public, anon, authenticated;
