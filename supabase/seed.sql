-- TSRI One Link for All — Supabase Initial Seed Data
-- Super Admin: dencapvision@gmail.com

DO $$
DECLARE
  super_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
  project_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- 1. Create Super Admin Profile in public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    organization,
    phone,
    avatar_url
  )
  VALUES (
    super_admin_id,
    'dencapvision@gmail.com',
    'นายอนุสรณ์ หนองนา (เด่น)',
    'สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)',
    '081-223-5919',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  )
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

  -- 2. Create Master Project
  INSERT INTO public.projects (
    id,
    code,
    title,
    description,
    organization,
    current_gate,
    start_date,
    end_date,
    baseline_budget,
    created_by
  )
  VALUES (
    project_id,
    'TSRI-LEGAL-2026',
    'โครงการศึกษา วิเคราะห์ และพัฒนาองค์ความรู้ด้านกฎหมาย ระเบียบ และแนวปฏิบัติที่เกี่ยวข้องกับการดำเนินงานของ สกสว.',
    'โครงการพัฒนาระบบบริหารความรู้และควบคุมการปฏิบัติตามกฎหมาย นโยบาย ววน. และระเบียบ สกสว. ครบวงจร',
    'สกสว.',
    'G1',
    '2026-01-15',
    '2026-10-31',
    4500000.00,
    super_admin_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Assign Super Admin to Project as project_admin
  INSERT INTO public.project_members (
    project_id,
    user_id,
    role
  )
  VALUES (
    project_id,
    super_admin_id,
    'project_admin'
  )
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET role = 'project_admin';

END $$;
