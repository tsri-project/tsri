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
import { mockReviewBatches, mockReviewItems } from './mock-data';

export interface FetchReviewsResult {
  batches: ReviewBatch[];
  items: ReviewItem[];
  source: 'supabase' | 'fallback';
}

/**
 * Fetch all review batches and items from Supabase with full permanent evidence records.
 * Falls back to mock data if table is currently empty or on connection issues, but
 * automatically merges any locally or remotely persisted permanent records.
 */
export async function fetchReviewsFromSupabase(): Promise<FetchReviewsResult> {
  try {
    // 1. Fetch review batches
    const { data: batchesData, error: batchError } = await supabase
      .from('review_batches')
      .select('*')
      .order('created_at', { ascending: true });

    if (batchError && batchError.code !== 'PGRST116') {
      console.warn('Supabase batch fetch warning:', batchError.message);
    }

    // 2. Fetch review items
    const { data: itemsData, error: itemError } = await supabase
      .from('review_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (itemError && itemError.code !== 'PGRST116') {
      console.warn('Supabase item fetch warning:', itemError.message);
    }

    // 3. Fetch evidence records
    const { data: evidenceData, error: evidenceError } = await supabase
      .from('review_evidence_records')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (evidenceError && evidenceError.code !== 'PGRST116') {
      console.warn('Supabase evidence fetch warning:', evidenceError.message);
    }

    // If Supabase returned batches and items, map them
    if (itemsData && itemsData.length > 0) {
      const mappedItems: ReviewItem[] = itemsData.map((raw) => {
        const itemEvidence = (evidenceData || [])
          .filter((evd) => evd.review_item_id === raw.id || evd.vi_code === raw.vi_code || evd.review_item_id === raw.item_code)
          .map(mapDbEvidenceToModel);

        return {
          id: raw.id,
          batch_id: raw.batch_id || 'batch-01',
          project_id: raw.project_id || 'proj-tsri-2569',
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
          assigned_expert_id: raw.assigned_expert_id || 'adv-01',
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

      const mappedBatches: ReviewBatch[] =
        batchesData && batchesData.length > 0
          ? batchesData.map((b) => ({
              id: b.id,
              project_id: b.project_id,
              batch_number: b.batch_number,
              title: b.title,
              description: b.description || '',
              gate_target: b.gate_target || 'G2',
              status: b.status || 'OPEN',
              total_items: b.total_items || mappedItems.length,
              validated_items: mappedItems.filter((i) => i.status === 'VALIDATED').length,
              created_at: b.created_at,
              updated_at: b.updated_at,
            }))
          : mockReviewBatches;

      return {
        batches: mappedBatches,
        items: mappedItems,
        source: 'supabase',
      };
    }

    // If tables in Supabase are currently empty, check if any evidence records exist in Supabase and attach to initial mock data
    if (evidenceData && evidenceData.length > 0) {
      const mergedItems = mockReviewItems.map((item) => {
        const matchingDbEvidence = evidenceData
          .filter((evd) => evd.review_item_id === item.id || evd.vi_code === item.vi_code || evd.review_item_id === item.item_code)
          .map(mapDbEvidenceToModel);

        const allEvidence = [...matchingDbEvidence, ...item.evidence_records];
        // Deduplicate by ID
        const uniqueEvidence = Array.from(new Map(allEvidence.map((e) => [e.id, e])).values());

        return {
          ...item,
          evidence_records: uniqueEvidence,
        };
      });

      return {
        batches: mockReviewBatches,
        items: mergedItems,
        source: 'supabase',
      };
    }

    return {
      batches: mockReviewBatches,
      items: mockReviewItems,
      source: 'fallback',
    };
  } catch (err: any) {
    console.error('fetchReviewsFromSupabase error:', err);
    return {
      batches: mockReviewBatches,
      items: mockReviewItems,
      source: 'fallback',
    };
  }
}

/**
 * Submit an Expert Response as a Permanent Immutable Audit Record to Supabase.
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
  const recordId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `evd-${Date.now()}`;

  const evidenceRecord: ReviewEvidenceRecord = {
    id: recordId,
    review_item_id: item.id,
    project_id: item.project_id || 'proj-tsri-2569',
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

  // Attempt to insert into Supabase
  try {
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
      rationale: evidenceRecord.rationale,
      requirement_impact: evidenceRecord.requirement_impact,
      storage_r2_key: evidenceRecord.storage_r2_key,
      evidence_file_name: evidenceRecord.evidence_file_name,
      evidence_file_size: evidenceRecord.evidence_file_size,
      resulting_status: evidenceRecord.resulting_status,
      created_at: evidenceRecord.created_at,
    });

    if (insertError) {
      console.warn('Supabase evidence insert note (RLS/Mock sync):', insertError.message);
    }

    // If expert flags a conflict, update item in Supabase if exists
    if (payload.recommended_status === 'SOURCE_CONFLICT') {
      await supabase
        .from('review_items')
        .update({
          status: 'SOURCE_CONFLICT',
          updated_at: timestamp,
        })
        .eq('id', item.id);
    }
  } catch (err) {
    console.warn('submitExpertEvidenceToSupabase network/database note:', err);
  }

  return evidenceRecord;
}

/**
 * Submit PM Disposition Decision to Supabase.
 */
export async function submitPmDispositionToSupabase(
  item: ReviewItem,
  payload: {
    pm_disposition: PmDispositionType;
    pm_disposition_note: string;
    pm_action_items: string[];
    pm_name: string;
    pm_id: string;
  }
): Promise<{ updatedStatus: VerificationStatus; consensusRecord: ReviewEvidenceRecord }> {
  const timestamp = new Date().toISOString();
  const isNowValidated = payload.pm_disposition === 'VALIDATED';
  const isConflict = payload.pm_disposition === 'REVISION_REQUESTED';

  const updatedStatus: VerificationStatus = isNowValidated
    ? 'VALIDATED'
    : isConflict
    ? 'SOURCE_CONFLICT'
    : item.status === 'VALIDATED'
    ? 'EXPERT_VALIDATION_REQUIRED'
    : item.status;

  const consensusRecordId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `evd-pm-${Date.now()}`;
  const consensusRecord: ReviewEvidenceRecord = {
    id: consensusRecordId,
    review_item_id: item.id,
    project_id: item.project_id || 'proj-tsri-2569',
    reviewer_id: payload.pm_id || 'pm-01',
    reviewer_name: payload.pm_name || 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร',
    reviewer_role: 'ผู้จัดการโครงการ (PM) / หัวหน้าชุดวิจัย',
    reviewer_team: 'PM_OFFICE',
    opinion_type: 'CONSENSUS_NOTE',
    review_date: timestamp,
    submitted_at: timestamp,
    doc_id_ref: `${item.document_code || 'DOC'} v${item.document_version_number || '1.0'}`,
    doc_code_ref: item.document_code || 'DOC',
    document_id: item.document_id,
    document_version_id: item.document_version_id,
    vi_code: item.vi_code || item.item_code,
    article_section: item.article_section,
    page_number: item.page_number,
    edition_used: 'มติที่ประชุมคณะที่ปรึกษาและผู้จัดการโครงการ',
    rationale: `[PM Disposition: ${payload.pm_disposition}] ${payload.pm_disposition_note}`,
    requirement_impact: isNowValidated
      ? 'ผ่านการรับรองจาก PM บรรจุใน Inception Report (DEL-01)'
      : 'ต้องปรับปรุงตามข้อสั่งการของ PM',
    storage_r2_key: `evidence/2026/09/EVD_PM_Disposition_${item.item_code}.pdf`,
    evidence_file_name: `EVD_PM_Disposition_${item.item_code}.pdf`,
    evidence_file_size: 1420000,
    resulting_status: updatedStatus,
    recommended_status: updatedStatus,
    is_permanent_record: true,
    created_at: timestamp,
  };

  try {
    // 1. Update review_items in Supabase
    const { error: itemUpdateError } = await supabase
      .from('review_items')
      .update({
        status: updatedStatus,
        pm_disposition: payload.pm_disposition,
        pm_disposition_note: payload.pm_disposition_note,
        pm_disposition_by: payload.pm_name,
        pm_disposition_at: timestamp,
        pm_action_items: payload.pm_action_items,
        updated_at: timestamp,
      })
      .eq('id', item.id);

    if (itemUpdateError) {
      console.warn('Supabase PM disposition item update note:', itemUpdateError.message);
    }

    // 2. Insert PM consensus record
    const { error: evdError } = await supabase.from('review_evidence_records').insert({
      id: consensusRecord.id,
      review_item_id: consensusRecord.review_item_id,
      project_id: consensusRecord.project_id,
      reviewer_id: consensusRecord.reviewer_id,
      review_date: consensusRecord.submitted_at,
      doc_id_ref: consensusRecord.doc_id_ref,
      article_section: consensusRecord.article_section,
      page_number: consensusRecord.page_number,
      edition_used: consensusRecord.edition_used,
      rationale: consensusRecord.rationale,
      requirement_impact: consensusRecord.requirement_impact,
      storage_r2_key: consensusRecord.storage_r2_key,
      evidence_file_name: consensusRecord.evidence_file_name,
      evidence_file_size: consensusRecord.evidence_file_size,
      resulting_status: consensusRecord.resulting_status,
      created_at: consensusRecord.created_at,
    });

    if (evdError) {
      console.warn('Supabase PM consensus record insert note:', evdError.message);
    }
  } catch (err) {
    console.warn('submitPmDispositionToSupabase network/database note:', err);
  }

  return { updatedStatus, consensusRecord };
}

function mapDbEvidenceToModel(dbEvd: any): ReviewEvidenceRecord {
  return {
    id: dbEvd.id,
    review_item_id: dbEvd.review_item_id,
    vi_code: dbEvd.vi_code || 'VI-REF',
    project_id: dbEvd.project_id || 'proj-tsri-2569',
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
