require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('playbook_topics').select('*').limit(1);
  console.log('playbook_topics error?', error ? error.message : 'no error, count: ' + data.length);
  
  const { data: topics, error: tErr } = await supabase.from('topics').select('id, przedmiot').limit(1);
  console.log('topics table?', tErr ? tErr.message : 'exists');
}

check();
