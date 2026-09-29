from pathlib import Path

p = Path("src/lib/supabaseApi.ts")
s = p.read_text()
old = """    async pollMatch() {
      return unwrap(await sb().rpc('rpc_poll_match')) as unknown as QueueState;
    },
"""
new = """    async pollMatch() {
      const rpc = await sb().rpc('rpc_poll_match');
      if (!rpc.error) return (rpc.data ?? { state: 'idle' }) as QueueState;

      // V24 fallback: some databases have the matchmaking tables but the
      // PostgREST schema cache is missing rpc_poll_match. Read the user's
      // queue row directly so the app no longer gets stuck on the raw RPC error.
      const { data: session } = await sb().auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) throw rpc.error;

      const { data: row, error: rowError } = await sb()
        .from('match_queue')
        .select('id,state,created_at,expires_at,session_id,partner_id,role')
        .eq('user_id', uid)
        .in('state', ['waiting', 'matched'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (rowError) throw rpc.error;
      if (!row) return { state: 'idle' };

      if (row.state === 'waiting') {
        return {
          state: 'waiting',
          queue_id: row.id,
          waited_seconds: Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 1000)),
          expires_at: row.expires_at ?? undefined,
        } as QueueState;
      }

      let partner = null;
      if (row.partner_id) {
        const { data } = await sb().from('profiles_public').select('*').eq('id', row.partner_id).maybeSingle();
        partner = data ?? null;
      }

      return {
        state: 'matched',
        session_id: row.session_id ?? undefined,
        partner,
        i_am: row.role === 'talk' ? 'talker' : 'listener',
      } as QueueState;
    },
"""
if old not in s:
    raise SystemExit("pollMatch block not found")
p.write_text(s.replace(old, new, 1))
print("V24 matchmaking fallback applied")
