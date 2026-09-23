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

  // Option 2 Policy: public.review_evidence_records FOR INSERT (Collaborative Co-Review)
  insertEvidenceRecord(user, record) {
    if (!this.isProjectMember(record.project_id, user.id)) {
      throw new Error('RLS Violation: Only project members can submit evidence/opinions.');
    }
    if (record.reviewer_id !== user.id) {
      throw new Error('RLS Violation: reviewer_id must match authenticated user.');
    }
    if (record.resulting_status === 'VALIDATED' && !this.isPmOrAdmin(record.project_id, user.id)) {
      throw new Error('Trigger Guard: Only PM can submit a VALIDATED resulting status.');
    }

    const evd = { id: `evd-${Date.now()}`, ...record, created_at: new Date().toISOString() };
    this.evidence.push(evd);
    return evd;
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
      resulting_status: 'EXPERT_VALIDATION_REQUIRED',
    });
    if (!evd.id) throw new Error('Failed to insert supporting evidence');
  });

  assert('ที่ปรึกษาภาครัฐ (อ.กานต์กุญช์) ส่งข้อสังเกตแย้ง (ALTERNATIVE_VIEW) ในข้อเอกชนได้', () => {
    const evd = sim.insertEvidenceRecord(USERS.PUB_ADV_02, {
      project_id: SAMPLE_PROJECT_ID,
      review_item_id: 'rev-05',
      reviewer_id: USERS.PUB_ADV_02.id,
      opinion_type: 'ALTERNATIVE_VIEW',
      resulting_status: 'SOURCE_CONFLICT',
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

  console.log('\n--- 3. การป้องกันการ Self-Validate และอำนาจปิดประเด็นของ PM ---');
  assert('ที่ปรึกษาเจ้าภาพหลัก (Lead) ไม่สามารถกด VALIDATED ปิดข้อเองได้ (ถูกบล็อก)', () => {
    try {
      sim.updateReviewItemStatus(USERS.PUB_ADV_01, 'rev-01', 'VALIDATED');
      throw new Error('Should have blocked advisor validation');
    } catch (e) {
      if (!e.message.includes('Trigger Guard')) throw e;
    }
  });

  assert('PM สามารถอนุมัติเปลี่ยนสถานะเป็น VALIDATED ตามฉันทามติที่ประชุมได้สำเร็จ', () => {
    const item = sim.updateReviewItemStatus(USERS.PM, 'rev-01', 'VALIDATED');
    if (item.status !== 'VALIDATED') throw new Error('PM validation failed');
  });

  console.log('\n--- 4. การจัดการรอบตรวจโดย PM (Batch & Round Management) ---');
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
  console.log(`📊 ผลการทดสอบโมเดล Option 2: ผ่าน ${passed}/${total} การทดสอบ (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');
}

runTests();
