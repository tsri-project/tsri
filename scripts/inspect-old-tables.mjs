import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectOldTables() {
  console.log('=== INSPECTING review_items AND review_evidence_records (READ-ONLY) ===\n');

  // 1. review_items
  const { data: revItems, error: rErr } = await supabase
    .from('review_items')
    .select('*')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(10);

  if (rErr) {
    console.log('review_items select * error:', rErr.message);
  } else {
    console.log(`review_items (total fetched: ${revItems.length}):`);
    if (revItems.length > 0) {
      console.log('Columns:', Object.keys(revItems[0]));
      console.table(revItems);
    } else {
      console.log('0 rows found in review_items.');
    }
  }

  // 2. review_evidence_records
  const { data: revEv, error: evErr } = await supabase
    .from('review_evidence_records')
    .select('*')
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(10);

  if (evErr) {
    console.log('\nreview_evidence_records select * error:', evErr.message);
  } else {
    console.log(`\nreview_evidence_records (total fetched: ${revEv.length}):`);
    if (revEv.length > 0) {
      console.log('Columns:', Object.keys(revEv[0]));
      console.table(revEv);
    } else {
      console.log('0 rows found in review_evidence_records.');
    }
  }
}

inspectOldTables();
