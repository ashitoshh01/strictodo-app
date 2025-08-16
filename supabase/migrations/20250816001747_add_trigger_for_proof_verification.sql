-- Create a trigger function
create or replace function public.handle_new_proof()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'pending-verification' then
    perform net.http_post(
      url:= '{{ .endpoint }}/verify-proof',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting(''request.jwt.claims'', true)::json->>''supabase_token''}'::jsonb,
      body:=jsonb_build_object('record', new)
    );
  end if;
  return new;
end;
$$;

-- Create a trigger that fires on insert or update
create trigger on_new_proof
  after insert or update of status on public.tasks
  for each row
  execute procedure public.handle_new_proof();
