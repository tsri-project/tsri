import { supabase } from './supabase.client';
import {
  ReviewBatch,
  ReviewItem,
  ReviewEvidenceRecord,
  PmDispositionType,
  VerificationStatus,
  ReviewOpinionType,
  AdvisorTeamGroup,
} from '~/types';

export interface FetchReviewsResult {
  batches: ReviewBatch[];
  items: ReviewItem[];
  source: 'supabase';
}

/**
 * Fetch all review batches, review items, and permanent evidence records from Supabase.
 * STRICT NO-FALLBACK: Throws an error on connection or query failure; does NOT fallback to mock data.
 */
export async function fetchReviewsFromSupabase(): Promise<FetchReviewsResult> {
  // 1. Fetch review batches
  const { data: batchesData, error: batchError } = await supabase
    .from('review_batches')
    .select('*')
    .order('created_at', { ascending: true });

  if (batchError) {
    console.error('Supabase review_batches query failed:', batchError);
    throw new Error(`ไม่สามารถโหลดข้อมูลชุดการตรวจ (review_batches) จาก Supabase ได้: ${batchError.message}`);
  }

  // 2. Fetch review items
  const { data: itemsData, error: itemError } = await supabase
    .from('review_items')
    .select('*')
    .order('created_at', { ascending: true });

  if (itemError) {
    console.error('Supabase review_items query failed:', itemError);
    throw new Error(`ไม่สามารถโหลดรายการตรวจพิจารณา (review_items) จาก Supabase ได้: ${itemError.message}`);
  }

  // 3. Fetch evidence records
  const { data: evidenceData, error: evidenceError } = await supabase
    .from('review_evidence_records')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (evidenceError) {
    console.error('Supabase review_evidence_records query failed:', evidenceError);
    throw new Error(`ไม่สามารถโหลดระเบียนหลักฐาน (review_evidence_records) จาก Supabase ได้: ${evidenceError.message}`);
  }

  const mappedItems: ReviewItem[] = (itemsData || []).map((raw) => {
    const itemEvidence = (evidenceData || [])
      .filter(
        (evd) =>
          evd.review_item_id === raw.id ||
          evd.vi_code === raw.vi_code ||
          evd.review_item_id === raw.item_code
      )
      .map(mapDbEvidenceToModel);

    return {
      id: raw.id,
      batch_id: raw.batch_id || 'batch-01',
      project_id: raw.project_id || 'b81c9b34-6009-4505-a4eb-70fc4d759d36',
      item_code: raw.item_code,
      vi_code: raw.vi_code || raw.item_code,
      title: raw.title,
      document_id: raw.document_id,
      document_code: raw.document_code || 'LAW-001',
      document_title: raw.document_title || raw.title,
      document_version_id: raw.document_version_id,
      document_version_number: raw.document_version_number || '1.0',
      deliverable_code: raw.deliverable_code || 'DEL-01',
      article_section: raw.article_section || '',
      page_number: raw.page_number || 1,
      issue_description: raw.issue_description || '',
      assigned_expert_id: raw.assigned_expert_id || '',
      assigned_expert_name: raw.assigned_expert_name || 'ผู้เชี่ยวชาญ',
      assigned_category: raw.assigned_category || 'ADVISORY_LEGAL',
      lead_team: raw.lead_team || 'PUBLIC_SECTOR',
      co_expert_ids: raw.co_expert_ids || [],
      co_experts_count: raw.co_experts_count || 0,
      status: raw.status as VerificationStatus,
      priority: raw.priority || 'HIGH',
      due_date: raw.due_date || '2026-09-25',
      pm_disposition: raw.pm_disposition as PmDispositionType,
      pm_disposition_note: raw.pm_disposition_note || '',
      pm_disposition_by: raw.pm_disposition_by || '',
      pm_disposition_by_name: raw.pm_disposition_by_name || '',
      pm_disposition_at: raw.pm_disposition_at || '',
      pm_action_items: Array.isArray(raw.pm_action_items)
        ? raw.pm_action_items
        : typeof raw.pm_action_items === 'string' && raw.pm_action_items
        ? [raw.pm_action_items]
        : [],
      evidence_records: itemEvidence,
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at || new Date().toISOString(),
    };
  });

  const mappedBatches: ReviewBatch[] = (batchesData || []).map((b) => ({
    id: b.id,
    project_id: b.project_id,
    batch_number: b.batch_number,
    title: b.title,
    description: b.description || '',
    gate_target: b.gate_target || 'G2',
    status: b.status || 'OPEN',
    total_items: b.total_items || mappedItems.filter((i) => i.batch_id === b.id).length,
    validated_items: mappedItems.filter((i) => i.batch_id === b.id && i.status === 'VALIDATED').length,
    created_at: b.created_at,
    updated_at: b.updated_at,
  }));

  return {
    batches: mappedBatches,
    items: mappedItems,
    source: 'supabase',
  };
}

/**
 * Submit an Expert Response as a Permanent Immutable Audit Record to Supabase.
 * STRICT: Throws on any RLS or DB error.
 */
export async function submitExpertEvidenceToSupabase(
  item: ReviewItem,
  payload: {
    reviewer_id: string;
    reviewer_name: string;
    reviewer_role: string;
    reviewer_team: AdvisorTeamGroup;
    opinion_type: ReviewOpinionType;
    vi_code: string;
    doc_code_ref: string;
    document_version_id: string;
    article_section: string;
    page_number: number;
    edition_used: string;
    rationale: string;
    requirement_impact: string;
    recommended_status: VerificationStatus;
    evidence_file_name: string;
    evidence_file_size?: number;
  }
): Promise<ReviewEvidenceRecord> {
  const timestamp = new Date().toISOString();
  const recordId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `evd-${Date.now()}`;

  const evidenceRecord: ReviewEvidenceRecord = {
    id: recordId,
    review_item_id: item.id,
    project_id: item.project_id || 'b81c9b34-6009-4505-a4eb-70fc4d759d36',
    reviewer_id: payload.reviewer_id,
    reviewer_name: payload.reviewer_name,
    reviewer_role: payload.reviewer_role,
    reviewer_team: payload.reviewer_team,
    opinion_type: payload.opinion_type,
    vi_code: payload.vi_code || item.vi_code || item.item_code,
    doc_id_ref: payload.doc_code_ref || `${item.document_code} v${item.document_version_number}`,
    doc_code_ref: item.document_code || 'LAW-001',
    document_id: item.document_id,
    document_version_id: payload.document_version_id || item.document_version_id,
    article_section: payload.article_section,
    page_number: Number(payload.page_number),
    edition_used: payload.edition_used,
    rationale: payload.rationale,
    requirement_impact: payload.requirement_impact,
    storage_r2_key: `evidence/2026/09/${payload.evidence_file_name}`,
    evidence_file_name: payload.evidence_file_name,
    evidence_file_size: payload.evidence_file_size || 1850000,
    resulting_status: payload.recommended_status,
    recommended_status: payload.recommended_status,
    review_date: timestamp,
    submitted_at: timestamp,
    is_permanent_record: true,
    created_at: timestamp,
  };

  // 1. Insert into Supabase review_evidence_records
  const { error: insertError } = await supabase.from('review_evidence_records').insert({
    id: evidenceRecord.id,
    review_item_id: evidenceRecord.review_item_id,
    project_id: evidenceRecord.project_id,
    reviewer_id: evidenceRecord.reviewer_id,
    review_date: evidenceRecord.submitted_at,
    doc_id_ref: evidenceRecord.doc_id_ref,
    article_section: evidenceRecord.article_section,
    page_number: evidenceRecord.page_number,
    edition_used: evidenceRecord.edition_used,
    rationale: `[${payload.opinion_type}] [${payload.reviewer_team}] ${payload.rationale}`,
    requirement_impact: evidenceRecord.requirement_impact,
    storage_r2_key: evidenceRecord.storage_r2_key,
    evidence_file_name: evidenceRecord.evidence_file_name,
    evidence_file_size: evidenceRecord.evidence_file_size,
    resulting_status: evidenceRecord.resulting_status,
  });

  if (insertError) {
    console.error('Supabase evidence insert error:', insertError);
    throw new Error(`การบันทึกหลักฐานและผลการตรวจลงฐานข้อมูล Supabase ล้มเหลว: ${insertError.message}`);
  }

  // 2. If expert flags a conflict, update status on review_items in Supabase
  if (payload.recommended_status === 'SOURCE_CONFLICT') {
    const { error: updateError } = await supabase
      .from('review_items')
      .update({
        status: 'SOURCE_CONFLICT',
        updated_at: timestamp,
      })
      .eq('id', item.id);

    if (updateError) {
      console.error('Supabase item status update error:', updateError);
      throw new Error(`การอัปเดตสถานะประเด็นเป็น SOURCE_CONFLICT ล้มเหลว: ${updateError.message}`);
    }
  }

  return evidenceRecord;
}

/**
 * Submit PM Disposition Decision to Supabase via Single Atomic RPC Transaction.
 * 
 * ATOMIC TRANSACTION GUARANTEE:
 * 1. Single database-level transaction executed via Supabase RPC `submit_pm_disposition_atomic`.
 * 2. SQL verifies auth.uid() and PM/Admin role on server-side.
 * 3. UPDATE review_items and INSERT review_evidence_records are executed atomically in Postgres.
 * 4. If RPC fails, throws immediately (NO fallback to multiple REST calls or compensated rollback).
 */
export async function submitPmDispositionToSupabase(
  item: ReviewItem,
  payload: {
    pm_disposition: PmDispositionType;
    pm_disposition_note: string;
    pm_action_items: string[];
    pm_name: string;
    pm_id: string;
    evidence_storage_key?: string | null;
    evidence_file_name?: string | null;
    evidence_file_size?: number | null;
  }
): Promise<{ updatedStatus: VerificationStatus; consensusRecordId?: string }> {
  if (!payload.pm_id) {
    throw new Error('ไม่พบ UUID ของผู้ใช้จากเซสชันที่เข้าสู่ระบบ (PM User ID is required)');
  }

  const actionItemsJoined = payload.pm_action_items.join('\n');

  // Call Atomic Postgres RPC Transaction (All metadata derived from DB)
  const { data: rpcData, error: rpcError } = await supabase.rpc('submit_pm_disposition_atomic', {
    p_item_id: item.id,
    p_pm_disposition: payload.pm_disposition,
    p_pm_disposition_note: payload.pm_disposition_note,
    p_pm_action_items: actionItemsJoined,
    p_evidence_storage_key: payload.evidence_storage_key || null,
    p_evidence_file_name: payload.evidence_file_name || null,
    p_evidence_file_size: payload.evidence_file_size || null,
  });

  if (rpcError) {
    console.error('Supabase submit_pm_disposition_atomic RPC failed:', rpcError);
    throw new Error(`การบันทึกมติ PM ในระดับ Transaction ล้มเหลว: ${rpcError.message}`);
  }

  if (!rpcData || rpcData.success !== true || !rpcData.evidence_record_id) {
    throw new Error('ผลลัพธ์จาก RPC ไม่สมบูรณ์หรือไม่ได้รับการยืนยันความสำเร็จ (Invalid RPC response)');
  }

  const updatedStatus = (rpcData.status as VerificationStatus) || item.status;

  return {
    updatedStatus,
    consensusRecordId: rpcData.evidence_record_id,
  };
}

function mapDbEvidenceToModel(dbEvd: any): ReviewEvidenceRecord {
  return {
    id: dbEvd.id,
    review_item_id: dbEvd.review_item_id,
    vi_code: dbEvd.vi_code || 'VI-REF',
    project_id: dbEvd.project_id || 'b81c9b34-6009-4505-a4eb-70fc4d759d36',
    reviewer_id: dbEvd.reviewer_id,
    reviewer_name: dbEvd.reviewer_name || (dbEvd.profiles?.full_name ?? 'ผู้เชี่ยวชาญ'),
    reviewer_role: dbEvd.reviewer_role || (dbEvd.profiles?.role ?? 'ที่ปรึกษากฎหมาย'),
    reviewer_team: (dbEvd.reviewer_team || 'PUBLIC_SECTOR') as AdvisorTeamGroup,
    opinion_type: (dbEvd.opinion_type || 'LEAD_FINDING') as ReviewOpinionType,
    document_id: dbEvd.document_id,
    document_version_id: dbEvd.document_version_id,
    doc_id_ref: dbEvd.doc_id_ref || 'DOC v1.0',
    doc_code_ref: dbEvd.doc_code_ref,
    article_section: dbEvd.article_section || '',
    page_number: dbEvd.page_number || 1,
    edition_used: dbEvd.edition_used || '',
    rationale: dbEvd.rationale || '',
    requirement_impact: dbEvd.requirement_impact || '',
    storage_r2_key: dbEvd.storage_r2_key,
    evidence_file_name: dbEvd.evidence_file_name,
    evidence_file_size: dbEvd.evidence_file_size,
    resulting_status: dbEvd.resulting_status as VerificationStatus,
    recommended_status: (dbEvd.recommended_status || dbEvd.resulting_status) as VerificationStatus,
    review_date: dbEvd.review_date || dbEvd.submitted_at || dbEvd.created_at,
    submitted_at: dbEvd.submitted_at || dbEvd.review_date || dbEvd.created_at || new Date().toISOString(),
    is_permanent_record: dbEvd.is_permanent_record ?? true,
    created_at: dbEvd.created_at || new Date().toISOString(),
  };
}
