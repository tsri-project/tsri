/**
 * Test Suite: Migration 00008 Advanced Workflow & Sequence Contract Tests
 * (Simulated Test Suite for PostgreSQL Contract Testing)
 * 
 * Scenarios Tested:
 * 1. "Lead เคยเห็นชอบแล้วภายหลังขอแก้ไข":
 *    - T1: Lead submits VALIDATED
 *    - T2 (later): Lead submits EXPERT_VALIDATION_REQUIRED (ขอแก้ไข)
 *    - PM calls VALIDATED -> MUST BE REJECTED (Latest record is not VALIDATED).
 * 2. "มี Conflict":
 *    - Any assigned expert submitted SOURCE_CONFLICT -> MUST BE REJECTED.
 * 3. "ไม่มีสิทธิ์":
 *    - Non-member or non-PM user calls RPC -> MUST BE REJECTED.
 * 4. "INSERT ล้มเหลว":
 *    - DB failure during evidence insert -> Full Rollback (Status & pm_disposition restored).
 */

import assert from 'assert';

console.log('🧪 Starting Migration 00008 Advanced Workflow & Rollback Tests (Simulated Test Runner)...\n');

class TestDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.projects = [{ id: 'proj-001', name: 'TSRI Control Center' }];
    this.project_members = [
      { project_id: 'proj-001', user_id: 'pm-proj1-uuid', role: 'pm' },
      { project_id: 'proj-001', user_id: 'lead-expert-uuid', role: 'legal_advisor' },
      { project_id: 'proj-001', user_id: 'co-expert-uuid', role: 'legal_advisor' },
      { project_id: 'proj-001', user_id: 'outsider-uuid', role: 'viewer' },
    ];
    this.documents = [
      { id: 'doc-uuid-001', project_id: 'proj-001', document_code: 'LAW-DRAFT-2026' },
    ];
    this.document_versions = [
      { id: 'ver-uuid-001', document_id: 'doc-uuid-001', version_number: '2.1' },
    ];
    this.review_items = [
      {
        id: 'item-uuid-001',
        project_id: 'proj-001',
        item_code: 'WORK-WS05-001',
        vi_code: 'VI-WS05-001',
        document_id: 'doc-uuid-001',
        document_version_id: 'ver-uuid-001',
        article_section: 'มาตรา 58',
        page_number: 14,
        assigned_expert_id: 'lead-expert-uuid',
        co_expert_ids: ['co-expert-uuid'],
        status: 'EXPERT_VALIDATION_REQUIRED',
        pm_disposition: 'PENDING_REVIEW',
        pm_disposition_note: null,
        pm_disposition_by: null,
        pm_disposition_at: null,
        pm_action_items: null,
        updated_at: '2026-09-23T10:00:00.000Z',
      },
    ];
    this.review_evidence_records = [];
  }

  async submit_pm_disposition_atomic(authUid, params, options = {}) {
    if (!authUid) throw new Error('Unauthorized: auth.uid() is null');

    const v_item = this.review_items.find((i) => i.id === params.p_item_id);
    if (!v_item) throw new Error('Item not found');

    const member = this.project_members.find((m) => m.project_id === v_item.project_id && m.user_id === authUid);
    if (!member || !['project_admin', 'pm'].includes(member.role)) {
      throw new Error(`Access Denied: Only PM or Project Admin of project ${v_item.project_id} can record PM disposition`);
    }

    if (params.p_pm_disposition === 'VALIDATED') {
      if (!v_item.assigned_expert_id) {
        throw new Error('Workflow Guard Violation: Cannot approve VALIDATED on VI because no Lead Expert is assigned.');
      }

      // Check active conflict
      const v_has_active_conflict = this.review_evidence_records.some((r) => {
        if (r.review_item_id !== v_item.id) return false;
        const isAssigned = r.reviewer_id === v_item.assigned_expert_id || (v_item.co_expert_ids && v_item.co_expert_ids.includes(r.reviewer_id));
        return isAssigned && (r.recommended_status === 'SOURCE_CONFLICT' || r.resulting_status === 'SOURCE_CONFLICT');
      });

      if (v_has_active_conflict) {
        throw new Error('Workflow Guard Violation: Cannot approve VALIDATED on VI because there is an active unresolved SOURCE_CONFLICT from an assigned expert.');
      }

      // Check LATEST submitted finding from Lead Expert
      const leadRecords = this.review_evidence_records
        .filter((r) => r.review_item_id === v_item.id && r.reviewer_id === v_item.assigned_expert_id && r.submitted_at && r.is_permanent_record)
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      const latestLeadRecord = leadRecords[0];

      if (!latestLeadRecord || latestLeadRecord.recommended_status !== 'VALIDATED') {
        throw new Error(
          `Workflow Guard Violation: Cannot set pm_disposition to VALIDATED on VI because the latest finding from assigned Lead Expert is "${latestLeadRecord ? latestLeadRecord.recommended_status : 'NO_SUBMISSION'}" (not VALIDATED).`
        );
      }
    }

    const snapshotItem = JSON.parse(JSON.stringify(v_item));
    const snapshotEvdCount = this.review_evidence_records.length;

    try {
      let v_new_status = params.p_pm_disposition === 'VALIDATED' ? 'VALIDATED' : v_item.status;

      v_item.status = v_new_status;
      v_item.pm_disposition = params.p_pm_disposition;
      v_item.pm_disposition_note = params.p_pm_disposition_note;
      v_item.pm_disposition_by = authUid;
      v_item.pm_disposition_at = new Date().toISOString();
      v_item.updated_at = new Date().toISOString();

      if (options.simulateInsertFailure) {
        throw new Error('Postgres Constraint Check Failure: review_evidence_records insert aborted');
      }

      const v_evd_id = `evd-${Date.now()}`;
      this.review_evidence_records.push({
        id: v_evd_id,
        review_item_id: v_item.id,
        reviewer_id: authUid,
        resulting_status: v_new_status,
      });

      return { success: true, item_id: v_item.id, status: v_new_status };
    } catch (err) {
      const idx = this.review_items.findIndex((i) => i.id === params.p_item_id);
      if (idx !== -1) this.review_items[idx] = snapshotItem;
      this.review_evidence_records.length = snapshotEvdCount;
      throw err;
    }
  }
}

async function runTests() {
  const db = new TestDatabase();

  // Test 1: Lead เคยเห็นชอบ (T1) แล้วภายหลังขอแก้ไข (T2) -> VALIDATED ต้องถูกปฏิเสธ
  console.log('🔹 Test 1: "Lead เคยเห็นชอบแล้วภายหลังขอแก้ไข" (Latest Finding Governs)');
  // T1: Lead Expert approved
  db.review_evidence_records.push({
    id: 'evd-lead-t1',
    review_item_id: 'item-uuid-001',
    reviewer_id: 'lead-expert-uuid',
    recommended_status: 'VALIDATED',
    submitted_at: '2026-09-23T10:00:00.000Z',
    is_permanent_record: true,
  });
  // T2: Lead Expert later submitted revision request
  db.review_evidence_records.push({
    id: 'evd-lead-t2',
    review_item_id: 'item-uuid-001',
    reviewer_id: 'lead-expert-uuid',
    recommended_status: 'EXPERT_VALIDATION_REQUIRED', // Revised!
    submitted_at: '2026-09-23T14:00:00.000Z',
    is_permanent_record: true,
  });

  let revisionLaterError = null;
  try {
    await db.submit_pm_disposition_atomic('pm-proj1-uuid', {
      p_item_id: 'item-uuid-001',
      p_pm_disposition: 'VALIDATED',
    });
  } catch (err) {
    revisionLaterError = err;
    console.log(`  ✓ Caught later revision request: "${err.message}"`);
  }
  assert.ok(revisionLaterError);
  assert.ok(revisionLaterError.message.includes('EXPERT_VALIDATION_REQUIRED'));
  assert.strictEqual(db.review_items[0].status, 'EXPERT_VALIDATION_REQUIRED');
  console.log('  ✅ PASSED: Later revision request correctly prevented VALIDATED status.\n');

  // Test 2: มี Conflict -> VALIDATED ต้องถูกปฏิเสธ
  console.log('🔹 Test 2: "มี Conflict" (Active SOURCE_CONFLICT)');
  db.reset();
  db.review_evidence_records.push({
    id: 'evd-conflict-01',
    review_item_id: 'item-uuid-001',
    reviewer_id: 'co-expert-uuid',
    recommended_status: 'SOURCE_CONFLICT',
    submitted_at: new Date().toISOString(),
    is_permanent_record: true,
  });

  let conflictError = null;
  try {
    await db.submit_pm_disposition_atomic('pm-proj1-uuid', {
      p_item_id: 'item-uuid-001',
      p_pm_disposition: 'VALIDATED',
    });
  } catch (err) {
    conflictError = err;
    console.log(`  ✓ Conflict caught: "${err.message}"`);
  }
  assert.ok(conflictError);
  assert.ok(conflictError.message.includes('SOURCE_CONFLICT'));
  console.log('  ✅ PASSED: Conflict correctly blocked VALIDATED.\n');

  // Test 3: ไม่มีสิทธิ์ -> ถูกปฏิเสธ
  console.log('🔹 Test 3: "ไม่มีสิทธิ์" (Non-PM User)');
  let unauthError = null;
  try {
    await db.submit_pm_disposition_atomic('outsider-uuid', {
      p_item_id: 'item-uuid-001',
      p_pm_disposition: 'ACCEPTED_AS_IS',
    });
  } catch (err) {
    unauthError = err;
    console.log(`  ✓ Unauthorized caller caught: "${err.message}"`);
  }
  assert.ok(unauthError);
  assert.ok(unauthError.message.includes('Access Denied'));
  console.log('  ✅ PASSED: Unauthorized user blocked.\n');

  // Test 4: INSERT ล้มเหลว -> Full Rollback
  console.log('🔹 Test 4: "INSERT ล้มเหลว" -> Full Rollback Check');
  db.reset();
  const statusBefore = db.review_items[0].status;
  const pmDispBefore = db.review_items[0].pm_disposition;
  const evdCountBefore = db.review_evidence_records.length;

  let insertFailError = null;
  try {
    await db.submit_pm_disposition_atomic(
      'pm-proj1-uuid',
      {
        p_item_id: 'item-uuid-001',
        p_pm_disposition: 'ACCEPTED_AS_IS',
        p_pm_disposition_note: 'ทดสอบ Rollback',
      },
      { simulateInsertFailure: true }
    );
  } catch (err) {
    insertFailError = err;
    console.log(`  ✓ Insert failure caught: "${err.message}"`);
  }
  assert.ok(insertFailError);
  assert.strictEqual(db.review_items[0].status, statusBefore, 'Status must match before rollback state');
  assert.strictEqual(db.review_items[0].pm_disposition, pmDispBefore, 'pm_disposition must match before rollback state');
  assert.strictEqual(db.review_evidence_records.length, evdCountBefore, 'Evidence count must match before rollback state');
  console.log('  ✅ PASSED: Rollback verified. All fields intact.\n');

  console.log('🎉 ALL ADVANCED WORKFLOW & ROLLBACK TESTS PASSED (Simulated test runner, 0 writes to production).');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
