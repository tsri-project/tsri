// TSRI One Link for All — PM & Legal Research Control Center
// Test Suite: Option 2 Collaborative Review RLS & Consensus Verification
// Scenario:
//   - 4 Public Sector Legal Advisors
//   - 2 Private Sector & Investment Legal Advisors
//   - Open collaborative reading & cross-review evidence submission
//   - Anti-self-validation guard + PM final validation authority

console.log('================================================================');
console.log('🧪 TSRI EXPERT REVIEW CENTER — COLLABORATIVE OPTION 2 RLS TEST');
console.log('================================================================\n');

const USERS = {
  PM: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'นายอนุสรณ์ หนองนา (เด่น) & คุณไกรพุฒิ (ไนท์)',
    role: 'pm',
    team: 'PM_OFFICE',
  },
  // 4 Public Sector Advisors
  PUB_ADV_01: {
    id: '22222222-2222-2222-2222-222222222221',
    name: 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร',
    role: 'legal_advisor',
    team: 'PUBLIC_SECTOR',
  },
  PUB_ADV_02: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'นายกานต์กุญช์ บำรุงชาติ',
    role: 'legal_advisor',
    team: 'PUBLIC_SECTOR',
  },
  PUB_ADV_03: {
    id: '22222222-2222-2222-2222-222222222223',
    name: 'อ.นภวัฒน์ สืบนุสรณ์',
    role: 'legal_advisor',
    team: 'PUBLIC_SECTOR',
  },
  PUB_ADV_04: {
    id: '22222222-2222-2222-2222-222222222224',
    name: 'ผศ.ดร.กนกพร ศรีสุจริตพานิช',
    role: 'legal_advisor',
    team: 'PUBLIC_SECTOR',
  },
  // 2 Private Sector Advisors
  PRIV_ADV_05: {
    id: '33333333-3333-3333-3333-333333333335',
    name: 'คุณธนา & คุณเอ๋',
    role: 'legal_advisor',
    team: 'PRIVATE_SECTOR',
  },
  PRIV_ADV_06: {
    id: '33333333-3333-3333-3333-333333333336',
    name: 'คุณบัณฑิตา พละพงศ์',
    role: 'hrd',
    team: 'PRIVATE_SECTOR',
  },
  // External / Unrelated
  UNRELATED: {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'ผู้ไม่เกี่ยวข้อง',
    role: 'viewer',
    team: 'EXTERNAL',
  },
};

const SAMPLE_PROJECT_ID = 'proj-tsri-2569';
const SAMPLE_BATCH_ID = 'batch-01';

const SAMPLE_ITEMS = [
  {
    id: 'rev-01',
    project_id: SAMPLE_PROJECT_ID,
    batch_id: SAMPLE_BATCH_ID,
    item_code: 'REV-B1-001',
    title: 'มาตรา 58 การร่วมลงทุน',
    assigned_expert_id: USERS.PUB_ADV_01.id, // Lead: Public 01
    lead_team: 'PUBLIC_SECTOR',
    status: 'EXPERT_VALIDATION_REQUIRED',
  },
  {
    id: 'rev-05',
    project_id: SAMPLE_PROJECT_ID,
    batch_id: SAMPLE_BATCH_ID,
    item_code: 'REV-B1-005',
    title: 'กลไกส่งเสริมการลงทุน Deep Tech ภาคเอกชน',
    assigned_expert_id: USERS.PRIV_ADV_05.id, // Lead: Private 05
    lead_team: 'PRIVATE_SECTOR',
    status: 'EXPERT_VALIDATION_REQUIRED',
  },
];

class CollaborativeRlsSimulator {
  constructor() {
    this.items = JSON.parse(JSON.stringify(SAMPLE_ITEMS));
    this.evidence = [];
    this.batches = [{ id: SAMPLE_BATCH_ID, project_id: SAMPLE_PROJECT_ID, batch_number: 'BATCH-01' }];
    this.memberships = [
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PM.id, role: 'pm' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PUB_ADV_01.id, role: 'legal_advisor' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PUB_ADV_02.id, role: 'legal_advisor' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PUB_ADV_03.id, role: 'legal_advisor' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PUB_ADV_04.id, role: 'legal_advisor' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PRIV_ADV_05.id, role: 'legal_advisor' },
      { project_id: SAMPLE_PROJECT_ID, user_id: USERS.PRIV_ADV_06.id, role: 'hrd' },
    ];
  }

  isProjectMember(projectId, userId) {
    return this.memberships.some((m) => m.project_id === projectId && m.user_id === userId);
  }

  isPmOrAdmin(projectId, userId) {
    const mem = this.memberships.find((m) => m.project_id === projectId && m.user_id === userId);
    return mem && (mem.role === 'pm' || mem.role === 'project_admin');
  }

  // Option 2 Policy: public.review_items FOR SELECT (Open Read for all members)
  selectReviewItems(user) {
    if (!this.isProjectMember(SAMPLE_PROJECT_ID, user.id)) return [];
    return this.items;
  }

  // Option 2 Policy: public.review_evidence_records FOR INSERT (Collaborative Co-Review & Permanent Audit)
  insertEvidenceRecord(user, record) {
    if (!this.isProjectMember(record.project_id, user.id)) {
      throw new Error('RLS Violation: Only project members can submit evidence/opinions.');
    }
    if (record.reviewer_id !== user.id) {
      throw new Error('RLS Violation: reviewer_id must match authenticated user.');
    }

    const submittedTimestamp = new Date().toISOString();
    const evd = {
      id: `evd-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      vi_code: record.vi_code || 'VI-UNKNOWN',
      document_id: record.document_id || '00000000-0000-0000-0000-000000000001',
      document_version_id: record.document_version_id || '00000000-0000-0000-0000-000000000001',
      doc_code_ref: record.doc_code_ref || 'DOC-001',
      article_section: record.article_section || 'มาตรา 1',
      page_number: record.page_number || 1,
      rationale: record.rationale || 'เหตุผลประกอบ',
      recommended_status: record.recommended_status || record.resulting_status || 'EXPERT_VALIDATION_REQUIRED',
      submitted_at: submittedTimestamp,
      is_permanent_record: true,
      ...record,
      created_at: submittedTimestamp,
    };

    this.evidence.push(evd);

    // ANTI AUTO-VALIDATION RULE TRIGGER:
    // Inserting an expert response NEVER auto-promotes the review item or project gate to VALIDATED.
    const item = this.items.find((i) => i.id === record.review_item_id);
    if (item) {
      if (evd.recommended_status === 'SOURCE_CONFLICT') {
        item.status = 'SOURCE_CONFLICT';
      }
      // If recommended_status is VALIDATED, do NOT set item.status = VALIDATED!
      // item stays in its current status (e.g. EXPERT_VALIDATION_REQUIRED) until PM disposition.
    }

    return evd;
  }

  // Option 2 Policy: public.review_evidence_records FOR UPDATE/DELETE (Immutability)
  updateEvidenceRecord(user, evidenceId, updates) {
    throw new Error('Audit Guard: Permanent expert response records cannot be updated or modified.');
  }

  deleteEvidenceRecord(user, evidenceId) {
    throw new Error('Audit Guard: Permanent expert response records cannot be deleted.');
  }

  // PM Disposition Management (Separate from expert responses)
  setPmDisposition(user, itemId, { disposition, note, actionItems }) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    if (!this.isPmOrAdmin(item.project_id, user.id)) {
      throw new Error('RLS Violation: Only PM or Project Admin can record PM disposition decisions.');
    }

    const timestamp = new Date().toISOString();
    item.pm_disposition = disposition;
    item.pm_disposition_note = note;
    item.pm_disposition_by = user.name;
    item.pm_disposition_at = timestamp;
    item.pm_action_items = actionItems || [];

    if (disposition === 'VALIDATED') {
      item.status = 'VALIDATED';
    } else if (disposition === 'REVISION_REQUESTED') {
      item.status = 'SOURCE_CONFLICT';
    }

    return item;
  }

  // Option 2 Policy: public.review_items FOR UPDATE (Anti-self-validation)
  updateReviewItemStatus(user, itemId, targetStatus) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    const isPm = this.isPmOrAdmin(item.project_id, user.id);
    const isLead = item.assigned_expert_id === user.id;

    if (!isPm && !isLead) {
      throw new Error('RLS Violation: Only Lead Expert or PM can update item fields.');
    }

    if (targetStatus === 'VALIDATED' && !isPm) {
      throw new Error('Trigger Guard: Only PM or Project Admin can validate and close review items.');
    }

    item.status = targetStatus;
    return item;
  }

  // PM Batch Management
  manageBatch(user, batchData) {
    if (!this.isPmOrAdmin(batchData.project_id, user.id)) {
      throw new Error('RLS Violation: Only PM can manage review batches.');
    }
    this.batches.push(batchData);
    return batchData;
  }
}

function runTests() {
  const sim = new CollaborativeRlsSimulator();
  let passed = 0;
  let total = 0;

  function assert(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  console.log('--- 1. สิทธิ์การเปิดอ่านร่วมกัน (Collaborative Open Read) ---');
  assert('ที่ปรึกษาภาครัฐทั้ง 4 ท่าน สามารถอ่าน review_items ได้ทุกรายการ', () => {
    [USERS.PUB_ADV_01, USERS.PUB_ADV_02, USERS.PUB_ADV_03, USERS.PUB_ADV_04].forEach((u) => {
      const items = sim.selectReviewItems(u);
      if (items.length !== 2) throw new Error(`${u.name} should see 2 items, saw ${items.length}`);
    });
  });

  assert('ที่ปรึกษาภาคเอกชนทั้ง 2 ท่าน สามารถอ่าน review_items ได้ทุกรายการ', () => {
    [USERS.PRIV_ADV_05, USERS.PRIV_ADV_06].forEach((u) => {
      const items = sim.selectReviewItems(u);
      if (items.length !== 2) throw new Error(`${u.name} should see 2 items, saw ${items.length}`);
    });
  });

  assert('ผู้ไม่เกี่ยวข้องภายนอก ไม่สามารถอ่าน review_items ได้เลย', () => {
    const items = sim.selectReviewItems(USERS.UNRELATED);
    if (items.length !== 0) throw new Error('Unrelated user should see 0 items');
  });

  console.log('\n--- 2. การให้ความเห็นร่วมข้ามทีม (Cross-Team Collaborative Co-Review) ---');
  assert('ที่ปรึกษาเอกชน (คุณธนา) ส่งความเห็นเสริม (SUPPORTING) ในข้อ ม.58 ที่ภาครัฐเป็น Lead ได้', () => {
    const evd = sim.insertEvidenceRecord(USERS.PRIV_ADV_05, {
      project_id: SAMPLE_PROJECT_ID,
      review_item_id: 'rev-01',
      reviewer_id: USERS.PRIV_ADV_05.id,
      opinion_type: 'SUPPORTING',
      vi_code: 'VI-B1-001',
      doc_code_ref: 'LAW-001 v1.0',
      document_version_id: '11111111-2222-3333-4444-555555555555',
      article_section: 'มาตรา 58 วรรคสอง',
      page_number: 14,
      rationale: 'สนับสนุนข้อวิเคราะห์ภาครัฐว่าการร่วมลงทุนเอกชนต้องผ่านบอร์ด กสว.',
      recommended_status: 'EXPERT_VALIDATION_REQUIRED',
    });
    if (!evd.id || !evd.is_permanent_record || !evd.submitted_at) throw new Error('Failed to insert permanent supporting evidence');
  });

  assert('ที่ปรึกษาภาครัฐ (อ.กานต์กุญช์) ส่งข้อสังเกตแย้ง (ALTERNATIVE_VIEW) ในข้อเอกชนได้', () => {
    const evd = sim.insertEvidenceRecord(USERS.PUB_ADV_02, {
      project_id: SAMPLE_PROJECT_ID,
      review_item_id: 'rev-05',
      reviewer_id: USERS.PUB_ADV_02.id,
      opinion_type: 'ALTERNATIVE_VIEW',
      vi_code: 'VI-B1-005',
      doc_code_ref: 'LAW-002 v1.0',
      document_version_id: '22222222-3333-4444-5555-666666666666',
      article_section: 'ข้อ 12 (3)',
      page_number: 8,
      rationale: 'พบเงื่อนไขขัดต่อระเบียบกองทุน ววน. เรื่องสิทธิประโยชน์ใน IP',
      recommended_status: 'SOURCE_CONFLICT',
    });
    if (!evd.id) throw new Error('Failed to insert alternative view evidence');
  });

  assert('ที่ปรึกษาไม่สามารถสวมรอยส่งความเห็นในนามผู้อื่นได้ (reviewer_id mismatch)', () => {
    try {
      sim.insertEvidenceRecord(USERS.PUB_ADV_01, {
        project_id: SAMPLE_PROJECT_ID,
        review_item_id: 'rev-01',
        reviewer_id: USERS.PRIV_ADV_05.id,
        resulting_status: 'SOURCE_CONFLICT',
      });
      throw new Error('Should have rejected identity mismatch');
    } catch (e) {
      if (!e.message.includes('RLS Violation')) throw e;
    }
  });

  console.log('\n--- 3. การป้องกัน Anti Auto-Validate & ความเป็นระเบียนถาวร (Audit Integrity) ---');
  assert('Expert Response ที่เสนอ recommended_status = VALIDATED ต้องไม่เปลี่ยน item/gate เป็น VALIDATED อัตโนมัติ', () => {
    sim.insertEvidenceRecord(USERS.PUB_ADV_01, {
      project_id: SAMPLE_PROJECT_ID,
      review_item_id: 'rev-01',
      reviewer_id: USERS.PUB_ADV_01.id,
      opinion_type: 'LEAD_FINDING',
      vi_code: 'VI-B1-001',
      doc_code_ref: 'LAW-001 v1.0',
      document_version_id: '11111111-2222-3333-4444-555555555555',
      article_section: 'มาตรา 58',
      page_number: 14,
      rationale: 'ผลตรวจผ่านเกณฑ์กฎหมายครบถ้วน',
      recommended_status: 'VALIDATED',
    });
    const item = sim.items.find((i) => i.id === 'rev-01');
    if (item.status === 'VALIDATED') {
      throw new Error('Anti-Auto-Validate FAILED: Item was automatically validated by expert response!');
    }
  });

  assert('ระเบียนความเห็นผู้เชี่ยวชาญถาวร (Permanent Record) ห้ามแก้ไขหรือลบ (Immutable Audit Trail)', () => {
    try {
      sim.updateEvidenceRecord(USERS.PUB_ADV_01, 'evd-01', { rationale: 'แก้ไขข้อความ' });
      throw new Error('Should have blocked evidence update');
    } catch (e) {
      if (!e.message.includes('Audit Guard')) throw e;
    }

    try {
      sim.deleteEvidenceRecord(USERS.PUB_ADV_01, 'evd-01');
      throw new Error('Should have blocked evidence deletion');
    } catch (e) {
      if (!e.message.includes('Audit Guard')) throw e;
    }
  });

  console.log('\n--- 4. การแยกช่อง PM Disposition & การรับรอง Gate อย่างเป็นเอกเทศ ---');
  assert('ที่ปรึกษาไม่สามารถบันทึกช่อง PM Disposition ได้ (ถูกบล็อกด้วย RLS)', () => {
    try {
      sim.setPmDisposition(USERS.PRIV_ADV_05, 'rev-01', {
        disposition: 'VALIDATED',
        note: 'พยายามลงมติแทน PM',
      });
      throw new Error('Should have blocked advisor from recording PM disposition');
    } catch (e) {
      if (!e.message.includes('RLS Violation')) throw e;
    }
  });

  assert('PM สามารถลงมติ PM Disposition = VALIDATED พร้อม Action Items เพื่อปิดข้อและรับรอง Gate ได้สำเร็จ', () => {
    const updated = sim.setPmDisposition(USERS.PM, 'rev-01', {
      disposition: 'VALIDATED',
      note: 'คณะที่ปรึกษาทั้ง 2 ทีมมีฉันทามติรับรอง PM อนุมัติบรรจุใน Inception Report (DEL-01)',
      actionItems: ['แนบผลตรวจในภาคผนวก ก.', 'ส่งมอบเอกสารให้ สกสว.'],
    });
    if (updated.status !== 'VALIDATED' || updated.pm_disposition !== 'VALIDATED' || !updated.pm_disposition_at) {
      throw new Error('PM disposition validation failed');
    }
  });

  assert('PM สามารถลงมติ ACCEPTED_WITH_CONDITIONS โดยไม่เปลี่ยนสถานะเป็น VALIDATED จนกว่าจะทำตามเงื่อนไข', () => {
    const updated = sim.setPmDisposition(USERS.PM, 'rev-05', {
      disposition: 'ACCEPTED_WITH_CONDITIONS',
      note: 'รับผลตรวจแบบมีเงื่อนไข ให้ทีมเอกชนส่งหนังสือหารือเพิ่มเติม',
      actionItems: ['จัดทำบันทึกข้อตกลงร่วมทุนฉบับร่าง'],
    });
    if (updated.status === 'VALIDATED') {
      throw new Error('Conditional acceptance should not set status to VALIDATED');
    }
    if (updated.pm_disposition !== 'ACCEPTED_WITH_CONDITIONS') {
      throw new Error('PM disposition setting failed');
    }
  });

  console.log('\n--- 5. การจัดการรอบตรวจโดย PM (Batch & Round Management) ---');
  assert('PM สามารถเปิดรอบตรวจใหม่ (BATCH-02) สำหรับ Gate G3 ได้', () => {
    const b = sim.manageBatch(USERS.PM, {
      id: 'batch-02',
      project_id: SAMPLE_PROJECT_ID,
      batch_number: 'BATCH-02',
    });
    if (b.batch_number !== 'BATCH-02') throw new Error('Batch creation failed');
  });

  assert('ที่ปรึกษาไม่สามารถสร้างหรือลบรอบตรวจได้ (ถูกบล็อก)', () => {
    try {
      sim.manageBatch(USERS.PRIV_ADV_05, {
        id: 'batch-03',
        project_id: SAMPLE_PROJECT_ID,
        batch_number: 'BATCH-03',
      });
      throw new Error('Should have blocked advisor from creating batch');
    } catch (e) {
      if (!e.message.includes('RLS Violation')) throw e;
    }
  });

  console.log('\n================================================================');
  console.log(`📊 ผลการทดสอบ: ผ่าน ${passed}/${total} การทดสอบ (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');
}

runTests();
