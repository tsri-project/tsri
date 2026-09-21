# TSRI One Link for All — PM & Legal Research Control Center
> ศูนย์บัญชาการวิจัยกฎหมายและบริหารโครงการ สกสว. (TSRI)

---

## 🌟 คอนเซปต์หลัก
- **One Project**
- **One Link**
- **One Source of Truth**

---

## 🛠️ Technology Stack
- **Frontend & Full-stack SSR**: Remix (Vite) + TypeScript
- **Styling**: Tailwind CSS (Thai typography & HSL Color Tokens)
- **Database & Auth**: Supabase PostgreSQL + Row Level Security (RLS)
- **Document & Storage Vault**: Cloudflare R2
- **Notification**: LINE OA Messaging API

---

## 🏛️ 13 ระบบหลัก (Main Modules)
1. **Executive Dashboard**: สถานะ Gate G0-G6, TOR Coverage, Deliverables, Pending Reviews, Upcoming Meetings, Open Risk/Decision, My Actions, Recent Documents
2. **TOR & Deliverables**: ติดตามข้อกำหนดสัญญา ผลผลิต น้ำหนักคะแนน และ Milestones
3. **Project Tasks**: แผนงานย่อยและกิจกรรม WBS
4. **Document Center & Versions**: ทะเบียนเอกสารและประวัติเวอร์ชัน (Immutable History)
5. **Legal Inventory**: คลังกฎหมาย พระราชบัญญัติ ระเบียบ ข้อบังคับ
6. **Traceability Explorer**: สายธารความเชื่อมโยง 12 Nodes ตั้งแต่กฎหมายจนถึงผลการเรียนรู้
7. **Calendar**: ปฏิทินกำหนดการและนัดหมาย
8. **Meeting Center**: บันทึกการประชุม (MOM) และการกลั่นกรอง Gate
9. **Review Center**: กระบวนการตรวจทานและรับรองเอกสาร
10. **RAID & Decision Log**: ทะเบียนความเสี่ยงและมติการตัดสินใจ
11. **Knowledge & Learning**: คลังองค์ความรู้และคู่มือแนวปฏิบัติ SOP
12. **Reports**: ศูนย์รวมรายงานฉบับทางการ
13. **Team & RBAC**: จัดการสมาชิก 7 บทบาทตามสิทธิ์

---

## 🔒 Security & Versioning Rules
- **RLS Policy**: เปิดใช้งาน Supabase RLS ทุกตารางที่มี `project_id`
- **Immutable Document Versions**: เอกสารที่ผ่านการ `VALIDATED` จะไม่ถูกเขียนทับ ต้องขึ้นเวอร์ชันใหม่เสมอ
- **Activity Log**: มี Trigger บันทึก Audit Trail ทุกการเปลี่ยนแปลงที่สำคัญ

---

## 🚀 วิธีการติดตั้งและรันระบบ (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด Development
npm run dev

# ตรวจสอบ TypeScript Type Safety
npm run typecheck

# สร้าง Production Build
npm run build
```
