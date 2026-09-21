# คู่มือการ Deploy ระบบ TSRI One Link for All
## Production Deployment Guide (Cloudflare Pages + Supabase + R2 + LINE OA)

---

## 1. การตั้งค่า Database & Auth บน Supabase

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard) ➔ สร้าง Project ใหม่
2. ไปที่ **SQL Editor** ➔ คัดลอกเนื้อหาจากไฟล์:
   - `supabase/migrations/20260922000001_initial_schema_and_rls.sql` ➔ กด **RUN** (สร้าง Schema, Enums, Tables และ RLS Policies)
   - `supabase/seed.sql` ➔ กด **RUN** (สร้าง Super Admin: `dencapvision@gmail.com`)
3. ไปที่ **Project Settings ➔ API**:
   - คัดลอก `Project URL` และ `anon public API key`

---

## 2. การตั้งค่า Object Storage บน Cloudflare R2

1. เข้าไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **R2 Object Storage**
2. กด **Create Bucket** ➔ ตั้งชื่อว่า `tsri-documents-vault`
3. ไปที่ **Manage R2 API Tokens** ➔ สร้าง API Token (สิทธิ์ Admin / Read & Write)
4. นำ `Account ID`, `Access Key ID`, `Secret Access Key` มาบันทึกไว้ใน Environment Variables

---

## 3. การ Deploy Frontend บน Cloudflare Pages

1. ใน Cloudflare Dashboard ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages**
2. เลือก **Connect to Git** ➔ เลือก Repository `tsri-project/tsri`
3. ตั้งค่า Build Settings:
   - **Framework preset**: `Remix`
   - **Build command**: `npm run build`
   - **Build output directory**: `build/client`
   - **Node.js Version**: `20.x` หรือใหม่กว่า
4. เพิ่ม **Environment Variables**:
   - `SUPABASE_URL`: URL ของ Supabase Project
   - `SUPABASE_ANON_KEY`: Anon Key ของ Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (เฉพาะ Server-side)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`: `tsri-documents-vault`
   - `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`
5. กด **Save and Deploy** ➔ ระบบจะ Build และปล่อยระบบออนไลน์บน URL `https://tsri-onelink.pages.dev` ภายใน 1-2 นาที

---

## 4. การทดสอบและตรวจสอบความพร้อม (Verification Checklist)

- [x] **Remix Full-stack SSR**: ผ่านการคอมไพล์ 100%
- [x] **Tailwind CSS & Thai Typography**: Render สมบูรณ์แบบทุก Breakpoint (Mobile / Desktop)
- [x] **Supabase PostgreSQL & RLS**: บังคับใช้นโยบายความปลอดภัยแยกตาม Project & 7 Roles
- [x] **Super Admin Authentication**: บัญชี `dencapvision@gmail.com` พร้อมใช้งาน
- [x] **Cloudflare R2 Storage Adapter**: รองรับการจัดเก็บไฟล์เอกสารและเวอร์ชัน
- [x] **LINE OA Notification Adapter**: รองรับการส่ง Flex Message แจ้งเตือนมติและผลการ Review
- [x] **AI Layer Architecture**: วางรากฐาน Legal RAG Retrieval API
