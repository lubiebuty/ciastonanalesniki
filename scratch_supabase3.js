require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_tables_query_or_something'); // let's just query information_schema

  const res = await supabase.from('sessions').select('*').limit(1);
  console.log('sessions table exists?', res.error ? res.error.message : 'yes');

  const res2 = await supabase.from('playbook_sessions').select('*').limit(1);
  console.log('playbook_sessions table exists?', res2.error ? res2.error.message : 'yes');
}

check();
