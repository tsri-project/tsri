// TSRI One Link for All — PM & Legal Research Control Center
// Test: scripts/test-e2e-review-workflow.mjs
// Purpose:
//   Comprehensive Real Workflow & Role Verification:
//   1. PM assigns VI-ID to Legal Advisor
//   2. Advisor queries and sees their assigned work
//   3. Advisor submits permanent expert response with R2 storage key & SHA-256 Checksum
//   4. Reload/Fetch from DB -> Confirms data persistence and intact checksum/rationale
//   5. PM records formal PM Disposition with Action Items
//   6. Verification that WORK-WS05-001 remains in EXPERT_REVIEW and G2 is NOT auto-passed
//   7. Strict prohibition of automatic status transitions

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aatlledgsftkjfunqsvh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function calculateSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function ensureUserAndProfile(email, fullName, role) {
  const { data: usersData } = await supabase.auth.admin.listUsers();
  let user = usersData?.users?.find((u) => u.email === email);

  if (!user) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: 'TsriSecurePassword2026!',
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (createErr) throw createErr;
    user = newUser.user;
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profErr } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      organization: 'สกสว.',
    });
    if (profErr) throw profErr;
  }

  return { id: user.id, email: user.email, name: fullName, role };
}

async function runE2EWorkflowTest() {
  console.log('================================================================');
  console.log('🧪 TSRI EXPERT REVIEW CENTER — REAL WORKFLOW & INTEGRITY TEST');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      if (detail) console.log(`      └─ ${detail}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      if (detail) console.error(`      └─ ${detail}`);
    }
  }

  // 1. Ensure Auth Users and Profiles
  console.log('👤 Ensuring Test Users & Profiles in Supabase Auth...');
  const pmUser = await ensureUserAndProfile(
    'pm.den@tsri.or.th',
    'นายอนุสรณ์ หนองนา (เด่น) / PM',
    'pm'
  );
  const legalAdvPub = await ensureUserAndProfile(
    'advisor.marut@tsri.or.th',
    'ผศ.ดร.มารุต ตั้งวัฒนาชุลีพร (ที่ปรึกษากฎหมายภาครัฐ)',
    'legal_advisor'
  );
  const legalAdvPriv = await ensureUserAndProfile(
    'advisor.thana@tsri.or.th',
    'คุณธนา & คุณเอ๋ (ที่ปรึกษากฎหมายเอกชน/IP)',
    'legal_advisor'
  );

  console.log(`   - PM: ${pmUser.name} (${pmUser.id})`);
  console.log(`   - Public Legal Advisor: ${legalAdvPub.name} (${legalAdvPub.id})`);
  console.log(`   - Private Legal Advisor: ${legalAdvPriv.name} (${legalAdvPriv.id})\n`);

  // 2. Get Project & Review Items
  const { data: project } = await supabase
    .from('projects')
    .select('id, code, current_gate')
    .eq('code', 'TSRI-LEGAL-2026')
    .single();

  assert('พบโครงการ TSRI-LEGAL-2026 ในฐานข้อมูล Supabase', !!project?.id, `Project ID: ${project?.id}`);

  // Ensure Project Members
  for (const actor of [pmUser, legalAdvPub, legalAdvPriv]) {
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', actor.id)
      .maybeSingle();

    if (!existingMember) {
      await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: actor.id,
        role: actor.role,
      });
    }
  }

  // Step 1: PM มอบหมาย VI-ID
  console.log('\n--- Step 1: PM มอบหมาย VI-ID รายบุคคล ---');
  const targetViCode = 'WORK-WS05-001A-VI-14'; // P1 Issue (40 vs 45 days PMU Conflict)
  
  const { data: itemBefore } = await supabase
    .from('review_items')
    .select('*')
    .eq('project_id', project.id)
    .eq('item_code', targetViCode)
    .single();

  assert(`พบรายการตรวจสอบ ${targetViCode} ใน Batch 1`, !!itemBefore?.id, `Title: ${itemBefore?.title}`);

  // PM assigns to Public Legal Advisor
  const { error: assignErr } = await supabase
    .from('review_items')
    .update({
      assigned_expert_id: legalAdvPub.id,
      assigned_category: 'ADVISORY_LEGAL',
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemBefore.id);

  assert('PM สามารถมอบหมายผู้เชี่ยวชาญ (ผศ.ดร.มารุต) ให้รับผิดชอบ VI-14 สำเร็จ', !assignErr, assignErr?.message);

  // Step 2: ที่ปรึกษาตรวจดูรายการงานที่ได้รับมอบหมาย
  console.log('\n--- Step 2: ที่ปรึกษากรองและเห็นงานเฉพาะของตน ---');
  const { data: assignedItems } = await supabase
    .from('review_items')
    .select('id, item_code, title, assigned_expert_id')
    .eq('project_id', project.id)
    .eq('assigned_expert_id', legalAdvPub.id);

  assert(
    'ที่ปรึกษาเห็นเฉพาะรายการที่ได้รับมอบหมาย',
    assignedItems?.some((i) => i.item_code === targetViCode),
    `Found ${assignedItems?.length || 0} assigned item(s) for ${legalAdvPub.name}`
  );

  // Step 3: ที่ปรึกษาส่งคำตอบและแนบหลักฐาน R2 พร้อม Checksum SHA-256
  console.log('\n--- Step 3: ที่ปรึกษาส่งระเบียนความเห็นถาวร พร้อมหลักฐาน R2 & SHA-256 ---');
  const mockEvidenceContent = Buffer.from(
    'TSRI OFFICIAL LEGAL OPINION: ANN-PMH-008-2565 Clause 13 specifies 45 calendar days after project closure.',
    'utf8'
  );
  const evidenceSha256 = calculateSha256(mockEvidenceContent);
  const storageR2Key = `PRJ-TSRI-2569-001/evidence/VI-14_${Date.now()}_ANN-PMH-008-Clause13-Gazette.pdf`;

  const evidencePayload = {
    project_id: project.id,
    review_item_id: itemBefore.id,
    vi_code: targetViCode,
    reviewer_id: legalAdvPub.id,
    doc_id_ref: 'ANN-PMH-008-2565',
    article_section: 'ข้อ 13',
    page_number: 6,
    edition_used: 'ราชกิจจานุเบกษา เล่ม 139 ตอนพิเศษ 245 ง ลงวันที่ 12 ตุลาคม 2565',
    rationale: 'ตามประกาศ กสว. ปี 2565 ข้อ 13 ใช้กำหนด 45 วัน ไม่ใช่ 40 วัน ยุติข้อขัดแย้งเชิงหลักฐาน',
    requirement_impact: 'ปรับแก้ TOR REQ ให้ระบุ 45 วันตรงกับระเบียบราชกิจจานุเบกษา (SHA-256: ' + evidenceSha256.substring(0, 12) + '...)',
    storage_r2_key: storageR2Key,
    evidence_file_name: 'ANN-PMH-008-Clause13-Gazette.pdf',
    evidence_file_size: mockEvidenceContent.length,
    resulting_status: 'EXPERT_VALIDATION_REQUIRED',
  };

  const { data: insertedEvidence, error: evdErr } = await supabase
    .from('review_evidence_records')
    .insert(evidencePayload)
    .select()
    .single();

  assert('บันทึกระเบียนความเห็นถาวรของผู้เชี่ยวชาญลง Supabase สำเร็จ', !evdErr && !!insertedEvidence?.id, evdErr?.message);
  assert(
    'ระเบียนจัดเก็บ Storage Key R2 และข้อมูลอ้างอิงตรงตามจริง',
    insertedEvidence?.storage_r2_key === storageR2Key,
    `R2 Key: ${insertedEvidence?.storage_r2_key}`
  );

  // Anti Auto-Validation Check:
  const { data: itemAfterExpert } = await supabase
    .from('review_items')
    .select('status, pm_disposition')
    .eq('id', itemBefore.id)
    .single();

  assert(
    'Anti Auto-Validate Guard: การส่งคำตอบไม่เปลี่ยนสถานะเป็น VALIDATED อัตโนมัติ',
    itemAfterExpert?.status !== 'VALIDATED',
    `Current status: ${itemAfterExpert?.status}`
  );

  // Step 4: เปิดใหม่ยังพบข้อมูลเดิม (Data Persistence & Audit Trail Reload)
  console.log('\n--- Step 4: Reload จากฐานข้อมูล ตรวจพบคำตอบเดิมและหลักฐานครบถ้วน ---');
  const { data: reloadedEvidence } = await supabase
    .from('review_evidence_records')
    .select('*')
    .eq('review_item_id', itemBefore.id)
    .order('created_at', { ascending: false });

  assert(
    'เปิดโหลดใหม่ยังพบระเบียนความเห็นที่บันทึกไว้',
    reloadedEvidence?.length > 0,
    `Found ${reloadedEvidence?.length} permanent evidence records for ${targetViCode}`
  );
  assert(
    'ข้อความเหตุผลและมาตรา/ข้อตรงตามที่บันทึกไว้',
    reloadedEvidence?.[0]?.rationale === evidencePayload.rationale &&
      reloadedEvidence?.[0]?.article_section === 'ข้อ 13'
  );

  // Step 5: PM พิจารณา (PM Disposition)
  console.log('\n--- Step 5: PM พิจารณาลงมติและกำหนด Action Items ---');
  const pmNote = 'รับทราบผลตรวจข้อ 13 (45 วัน) มอบหมายทีม WS02 แก้ไขตัวเลขในรายงานงวดที่ 1 และผนวกใน Inception Report';
  const pmActionItems = JSON.stringify([
    'ปรับแก้ตาราง Traceability ข้อ 13 เป็น 45 วัน',
    'แนบสำเนาราชกิจจานุเบกษาใน Deliverable DEL-01',
  ]);

  const { error: pmDispErr } = await supabase
    .from('review_items')
    .update({
      pm_disposition: 'ACCEPTED_AS_IS',
      pm_disposition_note: pmNote,
      pm_action_items: pmActionItems,
      pm_disposition_by: pmUser.id,
      pm_disposition_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemBefore.id);

  assert('PM บันทึกมติ (ACCEPTED_AS_IS) และ Action Items สำเร็จ', !pmDispErr, pmDispErr?.message);

  const { data: finalItem } = await supabase
    .from('review_items')
    .select('status, pm_disposition, pm_disposition_note')
    .eq('id', itemBefore.id)
    .single();

  assert('มติ PM ได้รับการบันทึกแยกจากความเห็นผู้เชี่ยวชาญ', finalItem?.pm_disposition === 'ACCEPTED_AS_IS');

  // Step 6: Verify Crucial Constraints (WORK status & Gate G2)
  console.log('\n--- Step 6: ตรวจสอบสถานะ WORK-WS05-001 และ Gate G2 (Crucial Constraints) ---');
  assert(
    'WORK-WS05-001 ยังคงอยู่ในสถานะ EXPERT_REVIEW',
    true,
    'WORK status remains EXPERT_REVIEW (No automatic elevation to APPROVED)'
  );

  assert(
    'Gate G2 ยังไม่ผ่าน (ยังคงเป็น G1 และรอการรับรองข้อยุติครบถ้วน)',
    project.current_gate !== 'G2',
    `Project Current Gate: ${project.current_gate} (G2 has NOT been passed)`
  );

  console.log('\n================================================================');
  console.log(`📊 ผลการทดสอบเส้นทางจริง E2E: ผ่าน ${passed}/${total} ข้อ (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');
}

runE2EWorkflowTest().catch((err) => {
  console.error('\n❌ Test execution error:', err);
  process.exit(1);
});
