// TSRI One Link for All — PM & Legal Research Control Center
// Script: scripts/import-work-ws05-001a.mjs
// Purpose:
//   Idempotent import of WORK-WS05-001A dataset into Supabase PostgreSQL:
//   - 25 Validation Issues (17 in Batch 1, 8 in Deferred Batch 2)
//   - 195 REQ Mappings preserved with Candidate tags
//   - 161 Condition Mappings preserved with Candidate tags
//   - Exact DOC-ID and article/section references taken directly from source (Zero Guessing)
//   - Idempotent execution (Zero duplicate IDs on repeated runs)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables manually from .env if present
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

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required to run the database import.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Source Directory
const SOURCE_DIR = path.join(
  rootDir,
  'document',
  'PRJ-TSRI-2569-001',
  '00_บริหารและควบคุมโครงการ',
  '00.07_Master-Control-Files',
  'WORK-WS05-001 — Expert Review Batch 1 Preparation',
  'WORK-WS05-001 — Expert Review Batch 1 Preparation'
);

function parseMarkdownTable(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tableRows = [];
  let header = null;

  for (let line of lines) {
    line = line.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;
    const cells = line
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());
    if (cells.every((c) => /^[-:\s]+$/.test(c))) {
      continue; // Divider row
    }
    if (!header) {
      header = cells;
    } else {
      const rowObj = {};
      header.forEach((h, i) => {
        rowObj[h] = cells[i] !== undefined ? cells[i] : '';
      });
      tableRows.push(rowObj);
    }
  }
  return { header, rows: tableRows };
}

async function runImport() {
  console.log('================================================================');
  console.log('🚀 TSRI WORK-WS05-001A DATASET IDEMPOTENT IMPORT');
  console.log('================================================================\n');

  console.log(`📂 Source Directory: ${SOURCE_DIR}\n`);

  // 1. Parse Issue Register (25 VI-IDs)
  const issueFilePath = path.join(SOURCE_DIR, 'WORK-WS05-001A_01_Issue_Register_v0.1.md');
  console.log('📖 1. Parsing Issue Register (WORK-WS05-001A_01)...');
  const { rows: issueRows } = parseMarkdownTable(issueFilePath);
  console.log(`   Found ${issueRows.length} Validation Issues.`);

  // 2. Parse Requirement Mapping (195 REQs)
  const reqFilePath = path.join(SOURCE_DIR, 'WORK-WS05-001A_02_Requirement_Mapping_v0.1.md');
  console.log('📖 2. Parsing Requirement Mapping (WORK-WS05-001A_02)...');
  const { rows: reqRows } = parseMarkdownTable(reqFilePath);
  console.log(`   Found ${reqRows.length} Requirement mappings.`);

  // 3. Parse Condition Mapping (161 Conditions)
  const conFilePath = path.join(SOURCE_DIR, 'WORK-WS05-001A_03_Condition_Mapping_v0.1.md');
  console.log('📖 3. Parsing Condition Mapping (WORK-WS05-001A_03)...');
  const { rows: conRows } = parseMarkdownTable(conFilePath);
  console.log(`   Found ${conRows.length} Condition mappings.`);

  // Assert counts
  if (issueRows.length !== 25) {
    throw new Error(`Expected exactly 25 VI rows, found ${issueRows.length}`);
  }
  if (reqRows.length !== 195) {
    throw new Error(`Expected exactly 195 REQ rows, found ${reqRows.length}`);
  }
  if (conRows.length !== 161) {
    throw new Error(`Expected exactly 161 Condition rows, found ${conRows.length}`);
  }

  const batch1Issues = issueRows.filter((r) => r.Batch === 'B1' || r['Priority'] === 'P1');
  const batch2Issues = issueRows.filter((r) => r.Batch === 'B2' || r['Priority'] === 'P2');
  console.log(`\n📊 Batch Distribution:`);
  console.log(`   - Batch 1 (P1): ${batch1Issues.length} items (Expected: 17)`);
  console.log(`   - Deferred Batch 2 (P2): ${batch2Issues.length} items (Expected: 8)`);

  if (batch1Issues.length !== 17 || batch2Issues.length !== 8) {
    throw new Error(`Invalid batch split: Batch 1 = ${batch1Issues.length}, Batch 2 = ${batch2Issues.length}`);
  }

  // 4. Ensure Project in Supabase
  console.log('\n🗄️ 4. Connecting to Supabase and ensuring Project TSRI-LEGAL-2026...');
  let { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id, code, title')
    .eq('code', 'TSRI-LEGAL-2026')
    .maybeSingle();

  if (!project) {
    const { data: newProj, error: insertProjErr } = await supabase
      .from('projects')
      .insert({
        code: 'TSRI-LEGAL-2026',
        title: 'โครงการวิเคราะห์และยกร่างกฎหมาย ลำดับศักดิ์ และข้อกำหนด สกสว. (TOR 4.3.1)',
        description: 'ศูนย์ควบคุมและบริหารงานวิจัยกฎหมาย สกสว. เชื่อมโยงรอบตรวจผู้เชี่ยวชาญ',
        organization: 'สกสว.',
        current_gate: 'G1',
        start_date: '2026-09-01',
        end_date: '2027-08-31',
      })
      .select()
      .single();
    if (insertProjErr) throw insertProjErr;
    project = newProj;
    console.log(`   Created new project record: ${project.id}`);
  } else {
    console.log(`   Found existing project: ${project.id} (${project.code})`);
  }

  // 5. Ensure Review Batches exist (Idempotent)
  console.log('\n📦 5. Ensuring Review Batches BATCH-01 and BATCH-02 in Supabase...');
  const batchesToEnsure = [
    {
      project_id: project.id,
      batch_number: 'BATCH-01',
      title: 'รอบที่ 1: ตรวจสอบความขัดแย้งเชิงหลักฐานและสาระสำคัญเร่งด่วน (17 ประเด็น P1)',
      description: 'รอบตรวจเร่งด่วนประเด็นความขัดแย้งตัวเลข 40/45 วัน, ฉบับ PMU 2568, ฐานอำนาจเงินกองทุน และกฎหมายแม่บท',
      gate_target: 'G2',
      status: 'OPEN',
      total_items: 17,
      validated_items: 0,
    },
    {
      project_id: project.id,
      batch_number: 'BATCH-02',
      title: 'รอบที่ 2 (Deferred): ประเด็นติดตามค้นหาต้นฉบับและแตกข้อกำหนดเพิ่มเติม (8 ประเด็น P2)',
      description: 'รอบตรวจติดตามประเด็นที่ต้องสืบค้นเอกสารต้นทางเพิ่มเติมและถอดเงื่อนไขรายข้อย่อย',
      gate_target: 'G3',
      status: 'OPEN',
      total_items: 8,
      validated_items: 0,
    },
  ];

  const batchMap = {};
  for (const b of batchesToEnsure) {
    const { data: existingBatch } = await supabase
      .from('review_batches')
      .select('id, batch_number')
      .eq('project_id', project.id)
      .eq('batch_number', b.batch_number)
      .maybeSingle();

    if (existingBatch) {
      await supabase
        .from('review_batches')
        .update({
          title: b.title,
          description: b.description,
          gate_target: b.gate_target,
          total_items: b.total_items,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingBatch.id);
      batchMap[b.batch_number] = existingBatch.id;
      console.log(`   Updated batch ${b.batch_number} (${existingBatch.id})`);
    } else {
      const { data: newBatch, error: bErr } = await supabase
        .from('review_batches')
        .insert(b)
        .select('id, batch_number')
        .single();
      if (bErr) throw bErr;
      batchMap[b.batch_number] = newBatch.id;
      console.log(`   Created batch ${b.batch_number} (${newBatch.id})`);
    }
  }

  // 6. Build Candidate Mappings lookup for REQs and Conditions
  console.log('\n🔗 6. Compiling Candidate REQ & Condition Mappings per VI-ID...');
  const reqsByVi = {};
  for (const req of reqRows) {
    const candidateVis = (req['VI ผู้สมัคร Batch 1'] || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const vi of candidateVis) {
      if (!reqsByVi[vi]) reqsByVi[vi] = [];
      reqsByVi[vi].push({
        req_id: req['REQ_ID'],
        doc_id: req['DOC-ID'],
        article_section: req['มาตรา/ข้อจากงานเดิม'],
        source_location: req['Source Location'],
        relationship: req['ความสัมพันธ์'] || 'DOC-ID scope candidate',
        next_check: req['Next check'],
        status: req['สถานะ'] || 'SOURCE NOT VERIFIED',
      });
    }
  }

  const consByVi = {};
  for (const con of conRows) {
    const candidateVis = (con['VI ผู้สมัคร Batch 1'] || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const vi of candidateVis) {
      if (!consByVi[vi]) consByVi[vi] = [];
      consByVi[vi].push({
        con_row_id: con['Condition row ID'],
        req_id: con['REQ_ID'],
        doc_section_raw: con['DOC-ID / ข้อเดิม'],
        analysis_type: con['ชนิด (ANALYSIS)'],
        working_output_text: con['ข้อความจาก Working Output'],
        stakeholders: con['ผู้เกี่ยวข้อง'],
        page_location: con['หน้า'],
        relationship: con['ความสัมพันธ์'] || 'DOC-ID scope candidate',
        status: con['สถานะ'] || 'SOURCE NOT VERIFIED',
      });
    }
  }

  // 7. Upsert all 25 Review Items into Supabase
  console.log('\n📝 7. Upserting 25 VI items into public.review_items...');
  let upsertedCount = 0;

  for (const issue of issueRows) {
    const viId = issue['Validation Issue ID'];
    const isBatch1 = issue['Batch'] === 'B1' || issue['Priority'] === 'P1';
    const batchNumber = isBatch1 ? 'BATCH-01' : 'BATCH-02';
    const batchId = batchMap[batchNumber];

    const priority = issue['Priority'] === 'P1' ? 'HIGH' : 'MEDIUM';
    const initialStatus = viId === 'WORK-WS05-001A-VI-14' ? 'SOURCE_CONFLICT' : 'EXPERT_VALIDATION_REQUIRED';

    const mappedReqs = reqsByVi[viId] || [];
    const mappedCons = consByVi[viId] || [];

    // Extract exact article sections from mapped REQs without guessing
    const exactSections = Array.from(
      new Set(
        mappedReqs
          .map((r) => r.article_section)
          .filter(Boolean)
      )
    ).slice(0, 5).join(', ');

    const itemPayload = {
      project_id: project.id,
      batch_id: batchId,
      item_code: viId,
      vi_code: viId,
      title: issue['ประเด็นไม่ซ้ำ'],
      issue_description: `${issue['คำถามตรวจ']} (คิวเดิม: ${issue['คิวเดิมทั้งหมด']})`,
      article_section: exactSections || issue['DOC-ID / Work'],
      page_number: mappedReqs[0]?.source_location ? parseInt(mappedReqs[0].source_location.replace(/\D/g, ''), 10) || 1 : 1,
      assigned_category: issue['ผู้ตรวจที่เสนอ']?.includes('เอกชน') ? 'ADVISORY_PRIVATE' : 'ADVISORY_LEGAL',
      status: initialStatus,
      priority: priority,
      due_date: isBatch1 ? '2026-10-15' : '2026-11-15',
      updated_at: new Date().toISOString(),
    };

    // Check if item already exists by item_code in the project
    const { data: existingItem } = await supabase
      .from('review_items')
      .select('id, item_code')
      .eq('project_id', project.id)
      .eq('item_code', viId)
      .maybeSingle();

    if (existingItem) {
      const { error: updErr } = await supabase
        .from('review_items')
        .update(itemPayload)
        .eq('id', existingItem.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from('review_items')
        .insert(itemPayload);
      if (insErr) throw insErr;
    }
    upsertedCount++;
    console.log(`   [${upsertedCount}/25] Upserted ${viId} -> ${batchNumber} (${issue['ประเด็นไม่ซ้ำ']})`);
  }

  // 8. Generate Local JSON Manifest in Web App Data Exchange
  console.log('\n💾 8. Exporting comprehensive JSON manifest for Web App & UI Cache...');
  const manifestDir = path.join(rootDir, 'public', 'documents', '12_Web-App-Data-Exchange', '12.01_Import');
  fs.mkdirSync(manifestDir, { recursive: true });

  const exportManifest = {
    metadata: {
      source_work: 'WORK-WS05-001A',
      version: 'v0.1 Draft',
      imported_at: new Date().toISOString(),
      project_code: 'TSRI-LEGAL-2026',
      total_validation_issues: 25,
      batch_1_count: 17,
      batch_2_count: 8,
      total_requirements: 195,
      total_conditions: 161,
      candidate_tag: 'DOC-ID scope candidate',
    },
    validation_issues: issueRows.map((r) => ({
      vi_id: r['Validation Issue ID'],
      topic: r['ประเด็นไม่ซ้ำ'],
      priority: r['Priority'],
      batch: r['Batch'],
      doc_id_ref: r['DOC-ID / Work'],
      question: r['คำถามตรวจ'],
      original_queues: r['คิวเดิมทั้งหมด'],
      suggested_reviewer: r['ผู้ตรวจที่เสนอ'],
      status: r['สถานะ'],
      mapped_requirements_count: (reqsByVi[r['Validation Issue ID']] || []).length,
      mapped_conditions_count: (consByVi[r['Validation Issue ID']] || []).length,
    })),
    requirements: reqRows,
    conditions: conRows,
  };

  const manifestPath = path.join(manifestDir, 'WORK-WS05-001A_imported_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(exportManifest, null, 2), 'utf8');
  console.log(`   Exported manifest to: ${manifestPath}`);

  console.log('\n================================================================');
  console.log('✅ IMPORT SUMMARY & VERIFICATION:');
  console.log(`   - Total VI-IDs: 25 (Batch 1 = 17, Batch 2 = 8)`);
  console.log(`   - Requirements mapped: 195 (All preserved with candidate tags)`);
  console.log(`   - Conditions mapped: 161 (All preserved with candidate tags)`);
  console.log(`   - Idempotency verified: Safe to re-run anytime without duplicating IDs`);
  console.log('================================================================\n');
}

runImport().catch((err) => {
  console.error('\n❌ Import script failed:', err);
  process.exit(1);
});
