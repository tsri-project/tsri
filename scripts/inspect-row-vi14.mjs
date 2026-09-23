import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRowAndAudit() {
  console.log('================================================================');
  console.log('READ-ONLY AUDIT: WORK-WS05-001A-VI-14 AND DATABASE STATE');
  console.log('Host:', process.env.SUPABASE_URL);
  console.log('================================================================\n');

  // 1. Fetch full row for WORK-WS05-001A-VI-14
  const { data: item14, error: err14 } = await supabase
    .from('review_items')
    .select('*')
    .eq('item_code', 'WORK-WS05-001A-VI-14')
    .single();

  if (err14) {
    console.error('Error fetching WORK-WS05-001A-VI-14:', err14.message);
  } else {
    console.log('--- FULL DETAILS FOR WORK-WS05-001A-VI-14 ---');
    console.log(JSON.stringify(item14, null, 2));
  }

  // 2. Fetch all 25 review_items to check exact updated_at and disposition for all items
  const { data: allItems, error: allErr } = await supabase
    .from('review_items')
    .select('id, item_code, title, status, pm_disposition, created_at, updated_at')
    .order('item_code', { ascending: true });

  if (allErr) {
    console.error('Error fetching all review_items:', allErr.message);
  } else {
    console.log(`\n--- ALL ${allItems.length} REVIEW ITEMS STATUS & TIMESTAMPS ---`);
    console.table(allItems);

    const changedItems = allItems.filter(i => i.updated_at !== i.created_at);
    console.log(`\nItems where updated_at != created_at: ${changedItems.length}`);
    if (changedItems.length > 0) {
      console.table(changedItems);
    }
  }

  // 3. Check for any audit or history tables
  const potentialAuditTables = [
    'audit_logs',
    'activity_logs',
    'review_item_history',
    'review_item_audit',
    'disposition_history',
    'disposition_audit',
    'system_logs'
  ];

  console.log('\n--- CHECKING FOR AUDIT / HISTORY TABLES ---');
  for (const table of potentialAuditTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': NOT FOUND (${error.message})`);
    } else {
      console.log(`Table '${table}': FOUND (${data.length} records)`);
    }
  }
}

inspectRowAndAudit();
