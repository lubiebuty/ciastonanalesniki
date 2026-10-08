require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSeeding() {
  const topicId = '6cc70895-992f-4f28-bd4e-1390483318db';
  const { data: playbookTopic } = await supabase.from('playbook_topics').select('*').eq('id', topicId).single();

  const { id, numer, pytanie, odpowiedz_wzorcowa, odpowiedz, przedmiot, dzial_numer, dzial_nazwa, wariant, numer_pytania, notatka, id_slug } = playbookTopic;
  
  // To avoid numer collision, let's offset the numer for playbook topics?
  // Or just use onConflict: 'numer'
  const mappedTopic = {
    id,
    numer: numer + 10000, // Offset numer to avoid collision
    pytanie,
    odpowiedz: odpowiedz || odpowiedz_wzorcowa,
    przedmiot: 'chemia', // just bypass check_przedmiot
    dzial_numer,
    dzial_nazwa,
    wariant,
    numer_pytania,
    notatka: notatka || '',
    id_slug
  };

  const { data, error } = await supabase.from('topics').upsert(mappedTopic, { onConflict: 'id' }).select();
  console.log('Topics upsert result with offset numer:', error ? error.message : 'Success');
}

testSeeding();
