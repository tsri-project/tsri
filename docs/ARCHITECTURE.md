# สถาปัตยกรรมระบบ TSRI One Link for All
## PM & Legal Research Control Center (สกสว.)

> **แนวคิดหลัก:** One Project | One Link | One Source of Truth  
> **วัตถุประสงค์:** บริหารโครงการศึกษา วิเคราะห์ และพัฒนาองค์ความรู้ด้านกฎหมาย ระเบียบ และแนวปฏิบัติที่เกี่ยวข้องกับการดำเนินงานของ สกสว.

---

## 1. หลักการสถาปัตยกรรม (Architecture Principle)

### 1.1 วงจรบริหารโครงการ (Project Delivery Lifecycle)
```
TOR 
 └── Requirement 
      └── Work 
           └── Deliverable 
                └── Evidence 
                     └── Review 
                          └── Validation 
                               └── Acceptance 
                                    └── Release
```

### 1.2 การเชื่อมโยงทางกฎหมายและการปฏิบัติ (Legal Traceability)
```
Document (เอกสาร/กฎหมาย/ระเบียบ)
 └── Provision (บทบัญญัติ/มาตรา/ข้อ)
      └── Requirement (ข้อกำหนด)
           └── Mandate (อำนาจหน้าที่ตามกฎหมาย)
                └── Function (ภารกิจของ สกสว.)
                     └── Work (งานวิจัย/งานโครงการ)
                          └── Process (กระบวนการทำงาน)
                               └── Role (บทบาทผู้รับผิดชอบ)
                                    └── Evidence (หลักฐานยืนยัน)
                                         └── Actual Practice (แนวปฏิบัติจริง)
                                              └── Gap (ช่องว่าง/ปัญหา)
                                                   └── Learning (องค์ความรู้และข้อเสนอแนะ)
```

---

## 2. Project Gates & Quality Milestones

| Gate ID | Gate Name | วัตถุประสงค์และเงื่อนไขการผ่าน Gate |
|---|---|---|
| **G0** | **Project Baseline** | ยืนยันกรอบ TOR, ขอบเขตงาน, ทีมงาน, แผนงานหลัก และ Baseline Budget |
| **G1** | **Source Verification** | รวบรวมและตรวจสอบความถูกต้องของกฎหมาย ระเบียบ และเอกสารต้นทางครบถ้วน |
| **G2** | **Research Validation** | ผ่านการกลั่นกรองระเบียบวิธีวิจัยและผลการศึกษาเบื้องต้น |
| **G3** | **Analysis Validation** | วิเคราะห์ช่องว่าง (Gap Analysis), ความสอดคล้องทางกฎหมาย และผลกระทบเสร็จสิ้น |
| **G4** | **Knowledge Validation** | สรุปองค์ความรู้, แนวปฏิบัติที่ดี (Best Practices) และคู่มือเสร็จสมบูรณ์ |
| **G5** | **Acceptance Readiness** | ตรวจสอบความพร้อมส่งมอบงาน Deliverable ตาม TOR ครบถ้วน 100% พร้อมตรวจรับ |
| **G6** | **Release & Handover** | อนุมัติการตรวจรับขั้นสุดท้าย เผยแพร่ชุดความรู้และส่งมอบให้ สกสว. นำไปใช้งาน |

---

## 3. Technology Stack & Integration Architecture

| Layer | เทคโนโลยี | รายละเอียดและมาตรฐาน |
|---|---|---|
| **Frontend & SSR** | **Remix (Full-stack)** | TypeScript 100%, React, Server/Client Loaders & Actions |
| **Styling** | **Tailwind CSS** | Custom Design System (HSL tokens, Dark/Light Mode, Responsive) |
| **Database** | **Supabase PostgreSQL** | Schema มี `project_id` ทุกตาราง, Triggers สำหรับ `activity_log` |
| **Security & Auth** | **Supabase Auth + RLS** | Row Level Security บังคับสิทธิ์ตาม `project_members` และ RBAC |
| **Object Storage** | **Cloudflare R2** | จัดเก็บไฟล์เอกสารต้นฉบับและเวอร์ชันเอกสาร ผ่าน Signed URLs |
| **Edge Proxy** | **Cloudflare Workers** | Reverse proxy, Cache control, Image optimization, Webhook gateways |
| **Notifications** | **LINE OA Messaging API** | แจ้งเตือนการอนุมัติ Gate, เอกสารรอตรวจ, และนัดหมายการประชุม |

---

## 4. Role-Based Access Control (RBAC)

1. `project_admin` — ผู้ดูแลระบบโครงการ ควบคุมสิทธิ์ สมาชิก และตั้งค่าระบบ
2. `pm` — ผู้จัดการโครงการ บริหารจัดการ TOR, Deliverables, แผนงาน และความเสี่ยง
3. `researcher` — นักวิจัย จัดทำเอกสาร บันทึกผลการวิเคราะห์ และแนบหลักฐาน
4. `legal_advisor` — ที่ปรึกษากฎหมาย ตรวจสอบความถูกต้องของบทบัญญัติและ Gap Analysis
5. `hrd` — ผู้แทนฝ่ายพัฒนาองค์กร ตรวจสอบ Function, Process และ Role mapping
6. `stakeholder` — ผู้มีส่วนได้ส่วนเสีย ติดตามความก้าวหน้าและให้ข้อคิดเห็น
7. `viewer` — ผู้มีสิทธิ์อ่านอย่างเดียว ไม่สามารถแก้ไขข้อมูลได้

---

## 5. Document Classification & Version Control Rules

### 5.1 Document Prefix Codes
- `LAW` — พระราชบัญญัติ / กฎหมายหลัก
- `REG` — กฎกระทรวง / ระเบียบ
- `ANN` — ประกาศ
- `RULE` — ข้อบังคับ
- `RES` — มติคณะกรรมการ / มติ ครม.
- `ORD` — คำสั่ง
- `GUIDE` — แนวปฏิบัติ / คู่มือ
- `FORM` — แบบฟอร์ม
- `TOR` — ขอบเขตของงาน / สัญญา
- `MOM` — บันทึกการประชุม (Minutes of Meeting)
- `REP` — รายงานความก้าวหน้า / รายงานฉบับสมบูรณ์
- `REV` — เอกสารผลการตรวจพิจารณา
- `EVD` — เอกสารหลักฐาน (Evidence)
- `DEL` — ผลผลิตที่ส่งมอบ (Deliverable)

### 5.2 Document Lifecycle Status
```
RAW ──► INDEXED ──► UNDER_REVIEW ──► VERIFIED ──► VALIDATED ──► [ SUPERSEDED / REPEALED / ARCHIVED ]
```

### 5.3 Versioning Integrity Policy
- ห้ามเขียนทับ (Overwrite) เอกสารที่อยู่ในสถานะ `VALIDATED`
- โครงสร้างตารางแยกชัดเจน: `documents` (หัวข้อและ Metadata) ➔ `document_versions` (ไฟล์และประวัติการแก้ไข)
- การ Review หรือ Link กับ Deliverable ทุกรายการจะต้องระบุ `document_version_id` เสมอ

---

## 6. Directory Structure (Remix App)

```
tsri-project/
├── app/
│   ├── components/
│   │   ├── shell/         # AppHeader, Sidebar, MobileNav, GlobalSearch
│   │   ├── dashboard/     # GateWidget, TORProgress, PendingReview, etc.
│   │   ├── documents/     # DocList, DocViewer, VersionHistory, Uploader
│   │   ├── calendar/      # CalendarGrid, MeetingCard, AgendaItem
│   │   └── common/        # Badge, Button, Modal, Card, Table
│   ├── routes/
│   │   ├── _index.tsx     # Landing or Redirect to /projects
│   │   ├── login.tsx      # Auth Login
│   │   ├── dashboard.tsx  # Executive Dashboard
│   │   ├── documents.tsx  # Document Center
│   │   ├── calendar.tsx   # Calendar & Meetings
│   │   ├── tor.tsx        # TOR & Deliverables
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts    # Supabase Client & Helpers
│   │   ├── r2.ts          # Storage integration
│   │   └── utils.ts       # Formatting, date utils, Thai localized strings
│   ├── types/             # TypeScript Interfaces & Database Types
│   ├── root.tsx           # Remix Root layout & Tailwind imports
│   └── styles/
│       └── app.css        # Tailwind & Global Design Tokens
├── docs/
│   └── ARCHITECTURE.md    # This file
├── supabase/
│   └── migrations/
│       └── 20260922000001_initial_schema_and_rls.sql
├── package.json
├── tsconfig.json
└── vite.config.ts
```
