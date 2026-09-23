import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectProductionAudit() {
  console.log('================================================================');
  console.log('AUDIT CHECK: PRODUCTION DATABASE RECENT WRITES / RPC (READ-ONLY)');
  console.log('================================================================\n');

  // 1. Check evidence_records (Recent additions)
  const { data: evidence, error: evErr } = await supabase
    .from('evidence_records')
    .select('id, item_id, evidence_type, created_at, created_by, payload')
    .order('created_at', { ascending: false })
    .limit(10);

  if (evErr) {
    console.error('Error fetching evidence_records:', evErr.message);
  } else {
    console.log(`--- RECENT EVIDENCE RECORDS (Total found: ${evidence.length}) ---`);
    if (evidence.length === 0) {
      console.log('No evidence records found.');
    } else {
      console.table(evidence.map(e => ({
        id: e.id,
        item_id: e.item_id,
        evidence_type: e.evidence_type,
        created_at: e.created_at,
        created_by: e.created_by,
      })));
    }
  }

  // 2. Check expert_responses (Recent additions)
  const { data: responses, error: respErr } = await supabase
    .from('expert_responses')
    .select('id, item_id, expert_name, consensus_recommendation, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (respErr) {
    console.error('Error fetching expert_responses:', respErr.message);
  } else {
    console.log(`\n--- RECENT EXPERT RESPONSES (Total found: ${responses.length}) ---`);
    if (responses.length === 0) {
      console.log('No expert responses found.');
    } else {
      console.table(responses);
    }
  }

  // 3. Check legal_batch_items (Recent updates)
  const { data: items, error: itemErr } = await supabase
    .from('legal_batch_items')
    .select('id, item_number, title, status, pm_disposition, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (itemErr) {
    console.error('Error fetching legal_batch_items:', itemErr.message);
  } else {
    console.log(`\n--- RECENT LEGAL BATCH ITEMS (Total found: ${items.length}) ---`);
    console.table(items);
  }
}

inspectProductionAudit();
