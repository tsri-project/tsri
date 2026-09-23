# Proposed Review Records

**PRJ-TSRI-2569-001 · TOR 4.3.1 · WS05 · WORK-WS05-001A · v0.1 Draft · 23 กันยายน 2569**

ฐานข้อมูล: WORK-WS02-005 v0.1, Legal Architecture WORK-WS02-004 v0.1 และ DOC-ID ในทะเบียนกลางตามที่ Work เดิมอ้าง. งานต้นทางยังระบุ `SOURCE NOT VERIFIED`; การจัดกลุ่มนี้คือ `ANALYSIS` และทุกคำถามเป็น `EXPERT VALIDATION REQUIRED`. จำนวน 60 คือคิวเดิม ไม่ใช่ 60 คำถามไม่ซ้ำ; แถว 003B-VAL-008/009 ปรากฏสองครั้งภายใต้ EXP ต่างรหัส. การรวมคิวไม่ลบรหัสเดิม. ไม่มีคำตอบหรือการรับรองโดยผู้เชี่ยวชาญในชุดนี้.

**ข้อเสนอเท่านั้น — ห้ามถือเป็นการแก้ Master หรือการอนุมัติ.** ตรวจ ID ซ้ำและเวอร์ชันปัจจุบันของ `03_PROJECT_CONTROL_REGISTER.xlsx` ก่อนเขียนจริง.

| ทะเบียน | ชนิด | ID เสนอ | ค่าเสนอ | เหตุ / เงื่อนไขอนุมัติ |
| --- | --- | --- | --- | --- |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Task | TSK-WS05-001A | EXPERT_REVIEW หลัง PM ส่งแพ็กจริง | อ้าง WORK-WS05-001A / WS05 / TOR 4.3.1; ระบุผู้รับผิดชอบ วันส่ง และหลักฐานแนบ |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Review | REV-WS05-001A-001 (proposed) | 17 VI ใน Batch 1 / PENDING_DISPATCH ก่อนส่ง | ตรวจ REV-ID เดิมและตั้งผู้เชี่ยวชาญ; ห้ามบันทึกว่า reviewed ก่อนรับคำตอบ |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Issue | WORK-WS02-005-ISS-009 | OPEN / SOURCE CONFLICT | เชื่อม VI-14; เก็บข้อ 13 และความเห็นผู้เชี่ยวชาญ |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Issue | WORK-WS02-005-ISS-001–013 | OPEN / ติดตามตามรายการเดิม | ไม่สร้าง Issue ซ้ำ; ผูก VI-IDs ตามสาระ |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Risk | RISK-WS05-001A-001 (proposed) | OPEN / แหล่งทางการและเครื่องมือรองไม่ครบ | เจ้าของทะเบียนติดตามก่อน G2; เช็ก Risk-ID เดิม |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Decision | DEC-WS05-001A-001 (proposed) | PENDING / หลักเกณฑ์รับข้อยุติ G2 | ให้ PM/หัวหน้าวิจัยอนุมัติขอบเขต คำตอบและหลักฐาน |
| 03_PROJECT_CONTROL_REGISTER.xlsx | Gate | G1 / G2 | G1 ยังค้างหลักฐาน; G2 PENDING | ไม่เลื่อน Gate จากการจัดชุดคำถาม |
| 02_MASTER_TRACEABILITY.xlsx | Link | VI-ID → REQ_ID / Condition row ID | Candidate mapping / UNDER_REVIEW | ตรวจความตรงของมาตราและสาระก่อน Master Merge #1 |
| 00_MASTER_DOCUMENT_REGISTER.xlsx | Document Status | DOC-ID ตาม VI | INDEXED / SOURCE NOT VERIFIED ตามฐานงาน 005 | ตรวจ Version, Effective Date, Status กับฉบับทางการก่อนเปลี่ยน |

## Handover

1. PM ตรวจทะเบียน REV/Task/Issue เดิมและรายการไฟล์แนบ แล้วส่ง Batch 1.
2. WORK-WS05-001B รวมคำตอบราย VI พร้อมหลักฐาน, บันทึกข้อคิดเห็นที่ขัดกันแยกไว้.
3. ทีม WS02 แก้ Draft เป็น v0.2 โดยคง v0.1; เสนอ G2 เมื่อครบ Evidence/Validation.
4. หลัง G2 จึงทำ Master Merge #1 และเตรียม TOR 4.3.2.
