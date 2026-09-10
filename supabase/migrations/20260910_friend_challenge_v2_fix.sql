create or replace function public.fc2_join_challenge(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.friend_challenges;
  v_slot integer;
  v_name text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into c from public.friend_challenges where code=upper(trim(p_code)) for update;
  if not found then raise exception 'CHALLENGE_NOT_FOUND'; end if;
  if c.host_id=auth.uid() then
    return jsonb_build_object('id',c.id,'code',c.code,'status',c.status);
  end if;
  if c.status <> 'waiting' then raise exception 'CHALLENGE_ALREADY_STARTED'; end if;
  if exists(select 1 from public.friend_challenge_players where challenge_id=c.id and user_id=auth.uid()) then
    return jsonb_build_object('id',c.id,'code',c.code,'status',c.status);
  end if;
  select s into v_slot
  from generate_series(1,7) s
  where not exists(select 1 from public.friend_challenge_players p where p.challenge_id=c.id and p.slot=s)
  order by s limit 1;
  if v_slot is null then raise exception 'CHALLENGE_FULL'; end if;
  insert into public.friend_challenge_players(challenge_id,user_id,slot)
  values(c.id,auth.uid(),v_slot);
  if c.guest_id is null then
    update public.friend_challenges set guest_id=auth.uid() where id=c.id;
  end if;
  select coalesce(display_name,username,'طالب') into v_name from public.profiles where id=auth.uid();
  return jsonb_build_object('id',c.id,'code',c.code,'status','waiting','slot',v_slot,'name',coalesce(v_name,'طالب'));
end;
$$;

grant execute on function public.fc2_join_challenge(text) to authenticated;
