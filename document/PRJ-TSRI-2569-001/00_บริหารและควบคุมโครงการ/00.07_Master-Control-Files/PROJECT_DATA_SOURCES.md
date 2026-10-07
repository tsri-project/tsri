# ทะเบียนฐานข้อมูลและแหล่งจัดเก็บเอกสารโครงการ
## โครงการศึกษา วิเคราะห์ และพัฒนาองค์ความรู้ด้านกฎหมาย ระเบียบ และแนวปฏิบัติ สกสว.
**รหัสโครงการ:** `PRJ-TSRI-2569-001` | **หมวด:** `00.07 Master Control Files`

---

### 1. แหล่งจัดเก็บเอกสารหลัก (Primary Cloud Storage & Databases)

| ฐานข้อมูล / โฟลเดอร์ | รายละเอียด | URL / Link |
| :--- | :--- | :--- |
| **📁 โฟลเดอร์รวมเอกสารโครงการหลัก (Google Drive Root)** | ศูนย์รวมเอกสาร 14 หมวดงานวิจัยของโครงการ สกสว. ทั้งหมด | [Google Drive Master Repository](https://drive.google.com/drive/folders/1OZQaNmTQmaWFJfdcMwkatS8RP7Wuc9d8?usp=drive_link) |
| **📁 โฟลเดอร์แผนงาน หมวด 00.03 (Timeline & Milestone)** | โฟลเดอร์จัดเก็บแผนดำเนินงาน แผนส่งมอบ และ Gantt Chart | [Google Drive หมวด 00.03](https://drive.google.com/drive/u/0/folders/1czzJh_4vNz-rjnFeh20I8oTiEEISNKKE) |
| **📄 แผนดำเนินงาน ต.ค. - ธ.ค. 2569 (รุ่น 0.2)** | เอกสารรายละเอียดแผนงาน 40 รายการ 6 ผลส่งมอบ 26 รอบประชุม | [Google Docs แผนดำเนินงาน](https://docs.google.com/document/d/1DB5cSVghqAdi_jfz2O5xDf6-zq91C2AjKbkZ5djfhMA/edit?tab=t.0) |
| **📊 Gantt Chart แผนดำเนินงาน (Google Sheets)** | แผนภูมิ Gantt Chart 40 รายการกิจกรรม และผลส่งมอบ 6 รายการ | [Google Sheets Gantt Chart](https://docs.google.com/spreadsheets/d/1rbh_WArSWEuq_fQKjpoClCptraoK1ZzW/edit?gid=247959143#gid=247959143) |
| **📑 ทะเบียนเอกสารกลาง (00_MASTER_DOCUMENT_REGISTER)** | ทะเบียนควบคุมประวัติเอกสาร เวอร์ชัน และสถานะความถูกต้อง | [Google Sheets ทะเบียนเอกสารกลาง](https://drive.google.com/file/d/1QEoyLtep0lRTkXFG9ujMtNJvXzU6RxW1/view) |
| **📈 ทะเบียนควบคุมโครงการ (03_PROJECT_CONTROL_REGISTER)** | ทะเบียนควบคุมงาน กิจกรรม ความเสี่ยง มติที่ประชุม และการตรวจรับ | [Google Sheets ทะเบียนควบคุมโครงการ](https://drive.google.com/file/d/17BQKfpvB8qLyU2DqfNTwl1AAk4D6SE2l/view) |
| **☁️ Cloudflare R2 Object Storage** | ที่จัดเก็บไฟล์เอกสารและเวอร์ชันสำหรับ Web Application | Bucket: `tsri-documents-vault` |
| **🗄️ Supabase PostgreSQL Database** | ฐานข้อมูลเชิงสัมพันธ์ พร้อม RLS Security และระบบ Legal Traceability | Supabase Managed Cloud |

---

### 2. โครงสร้าง 14 หมวดหมู่ข้อมูลใน Google Drive และ Workspace

1. **`00_บริหารและควบคุมโครงการ`**
   - `00.01_TOR-สัญญา` (TOR-PROJ-001-2569)
   - `00.02_คำสั่งแต่งตั้ง` (ORD-TSRI-001-2569)
   - `00.03_แผนงาน-Timeline-Milestone` (REP-PROJ-PLAN-001-2569)
   - `00.04_รายงานการประชุม` (MOM-PROJ-001-2569, MOM-PROJ-002-2569, MTG 03–26)
   - `00.05_Risk-Issue-Decision-Change` (RAID Register)
   - `00.06_การติดต่อประสานงาน`
   - `00.07_Master-Control-Files` (00_MASTER_DOCUMENT_REGISTER, 01_LEGAL_INVENTORY, 02_MASTER_TRACEABILITY, 03_PROJECT_CONTROL_REGISTER)
2. **`01_กฎหมายแม่บท`** (LAW-NSC-001-2562, LAW-NSC-002-2568, LAW-SRI-001-2562, LAW-HED-001-2562, LAW-GOV-001-2545)
3. **`02_กฎหมายลำดับรอง`** (ระเบียบสภาฯ, ระเบียบ กสว., ประกาศ กสว., หลักเกณฑ์กองทุน ววน.)
4. **`03_กฎหมายที่เกี่ยวข้อง`** (พ.ร.บ. จัดซื้อจัดจ้างฯ 2560, พ.ร.บ. วินัยการเงินการคลังฯ 2561, ระเบียบกระทรวงการคลังฯ)
5. **`04_เอกสารการปฏิบัติงานจริง-สกสว`** (ประกาศ สกสว., คำสั่งภายใน, คู่มือการปฏิบัติงาน, SOP เดิม)
6. **`05_การเก็บข้อมูลภาคสนาม`** (เครื่องมือสัมภาษณ์ 26 รอบ, บันทึกการสัมภาษณ์ 3 ระดับ, สรุปประเด็น)
7. **`06_งานวิเคราะห์และสังเคราะห์`** (Legal Gap Analysis, Authority Mapping, Compliance Matrix)
8. **`07_Expert-Review-Validation`** (Expert Review Package Batch 1-3, Evidence Audit Records)
9. **`08_Knowledge-Learning`** (Content Matrix, สื่อวิดีโอ 15 คลิป, แบบทดสอบ 12 ชุด, อินโฟกราฟิก 8 ชิ้น, คู่มือ 2 เล่ม)
10. **`09_รายงานโครงการ`** (รายงานความก้าวหน้า 3 เดือน, รายงานวิจัยฉบับสมบูรณ์)
11. **`10_ผลส่งมอบ-Deliverables`** (DEL-01 ถึง DEL-06)
12. **`11_ข้อมูลสำหรับ-GPT-AI`** (Legal RAG Context, Chunks, Embeddings, Prompt Baselines)
13. **`12_Web-App-Data-Exchange`** (JSON / CSV Data Feeds, Schema Sync)
14. **`99_Archive`** (เอกสารประวัติฉบับเดิมที่ถูกแทนที่)
