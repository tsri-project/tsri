import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductionSpecifics() {
  console.log('================================================================');
  console.log('CHECKING PRODUCTION DB (READ-ONLY) FOR SPECIFIC OBJECTS');
  console.log('Host:', process.env.SUPABASE_URL);
  console.log('================================================================\n');

  // 1. Check review_items
  const { data: revItems, error: revItemsErr } = await supabase
    .from('review_items')
    .select('id, item_code, item_title, status, disposition_status, updated_at')
    .limit(5);

  if (revItemsErr) {
    console.log(`[TABLE] review_items: NOT FOUND / ERROR -> ${revItemsErr.message}`);
  } else {
    console.log(`[TABLE] review_items: FOUND (${revItems.length} records returned)`);
    console.table(revItems);
  }

  // 2. Check review_evidence_records
  const { data: revEvidence, error: revEvErr } = await supabase
    .from('review_evidence_records')
    .select('id, item_id, evidence_type, created_at, created_by')
    .limit(5);

  if (revEvErr) {
    console.log(`[TABLE] review_evidence_records: NOT FOUND / ERROR -> ${revEvErr.message}`);
  } else {
    console.log(`[TABLE] review_evidence_records: FOUND (${revEvidence.length} records returned)`);
    console.table(revEvidence);
  }

  // 3. Check submit_pm_disposition_atomic RPC existence by calling with invalid/dry parameter or inspect
  // Note: if function does not exist, Supabase returns "Could not find the function submit_pm_disposition_atomic in the schema cache"
  // If function exists, it might return parameter mismatch or validation error.
  const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_pm_disposition_atomic', {
    p_item_id: '00000000-0000-0000-0000-000000000000',
    p_disposition: 'INVALID_TEST',
    p_rationale: 'TEST',
    p_evidence_summary: 'TEST',
    p_evidence_type: 'TEST',
    p_recorded_by: 'TEST',
    p_version: 0
  });

  if (rpcErr) {
    console.log(`[RPC] submit_pm_disposition_atomic: ${rpcErr.message}`);
    if (rpcErr.message.includes('Could not find the function')) {
      console.log('-> RPC function does NOT exist on production.');
    } else {
      console.log('-> RPC function exists (returned execution/validation response).');
    }
  } else {
    console.log(`[RPC] submit_pm_disposition_atomic returned:`, rpcData);
  }
}

checkProductionSpecifics();
