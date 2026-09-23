import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // Try querying a standard table like deliverables or legal_frameworks
    const tables = ['deliverables', 'activities', 'meetings', 'documents', 'legal_frameworks', 'disposition_logs'];
    console.log('Testing known tables...');
    for (const t of tables) {
      const { data: d, error: err } = await supabase.from(t).select('id').limit(1);
      if (err) {
        console.log(`Table ${t}: NOT FOUND / ERROR (${err.message})`);
      } else {
        console.log(`Table ${t}: EXISTS (rows count >= ${d.length})`);
      }
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
