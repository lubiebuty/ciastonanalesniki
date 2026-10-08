require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('playbook_topics').select('dzial_nazwa');
  const counts = {};
  data.forEach(d => {
    counts[d.dzial_nazwa] = (counts[d.dzial_nazwa] || 0) + 1;
  });
  console.log('Playbook topics distribution:', counts);
}

check();
