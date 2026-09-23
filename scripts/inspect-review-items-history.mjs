import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectHistory() {
  const { data, error } = await supabase
    .from('review_items')
    .select('id, item_code, title, status, pm_disposition, updated_at, created_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Total review_items: ${data.length}`);
    const withDisposition = data.filter(d => d.pm_disposition !== null);
    console.log(`Items with pm_disposition: ${withDisposition.length}`);
    if (withDisposition.length > 0) {
      console.log('Items with disposition:', withDisposition);
    }
    console.log('Latest 5 updated items:');
    console.table(data.slice(0, 5));
  }
}

inspectHistory();
