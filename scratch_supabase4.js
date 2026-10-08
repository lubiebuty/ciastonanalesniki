require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: pt } = await supabase.from('playbook_topics').select('id, pytanie').limit(5);
  console.log('playbook_topics sample:', pt);

  const { data: t } = await supabase.from('topics').select('id, pytanie').eq('przedmiot', 'The Playbook').limit(5);
  console.log('topics table for The Playbook sample:', t);
}

check();
