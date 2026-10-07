-- TSRI One Link for All — Supabase Initial Seed Data
-- Super Admin: dencapvision@gmail.com
-- Authorized Users: 11 Members across 3 Departments

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

  -- 3. Upsert All 11 Official Team Profiles
  -- 1) ฝ่ายบริหารโครงการ (Core PM Team)
  INSERT INTO public.profiles (id, email, full_name, organization, avatar_url) VALUES
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'dencapvision@gmail.com', 'นายอนุสรณ์ หนองนา (เด่น PM)', 'ทีมบริหารโครงการ สกสว.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('a0000000-0000-0000-0000-000000000002'::UUID, 'taleiw1717@gmail.com', 'ดร.หนึ่งนิดา สารศรี (ต้นหลิว Co-PM)', 'ทีมบริหารโครงการ สกสว.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    ('a0000000-0000-0000-0000-000000000003'::UUID, 'kraiput.in@gmail.com', 'คุณไกรพุฒิ อินทรโยธา (ไนท์ PM)', 'ทีมบริหารโครงการ สกสว.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('a0000000-0000-0000-0000-000000000004'::UUID, 'pimpasphitcha@gmail.com', 'คุณพิมพ์พิชชา (เบนซ์ Coordinator)', 'ทีมบริหารโครงการ สกสว.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
    
    -- 2) ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย (Academic & Legal Advisory)
    ('a0000000-0000-0000-0000-000000000005'::UUID, 'napawat.sue@mfu.ac.th', 'อ.นภวัฒน์ สืบนุสรณ์ (อ.มะตูม)', 'มหาวิทยาลัยแม่ฟ้าหลวง', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    ('a0000000-0000-0000-0000-000000000006'::UUID, 'tp.marut@gmail.com', 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร (อ.ปุ่น)', 'มหาวิทยาลัยบูรพา', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
    ('a0000000-0000-0000-0000-000000000007'::UUID, 'karnkul.bum@mfu.ac.th', 'นายกานต์กุญช์ บำรุงชาติ (อ.บอย)', 'มหาวิทยาลัยแม่ฟ้าหลวง', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
    ('a0000000-0000-0000-0000-000000000008'::UUID, 'kanokporns@go.buu.ac.th', 'ผศ.ดร.กนกพร ศรีสุจริตพานิช (อ.อู๋)', 'มหาวิทยาลัยบูรพา', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150'),
    
    -- 3) ฝ่ายที่ปรึกษา HR (HR & Learning Advisory)
    ('a0000000-0000-0000-0000-000000000009'::UUID, 'b.phalapong@gmail.com', 'คุณบัณฑิตา พละพงศ์ (K.แอ๋ม)', 'KBTG', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
    ('a0000000-0000-0000-0000-000000000010'::UUID, 'atichart.sri@gmail.com', 'คุณอธิชาติ ศรีสุริยา (K.ซัน)', 'ที่ปรึกษาพัฒนาภาวะผู้นำอิสระ', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
    ('a0000000-0000-0000-0000-000000000011'::UUID, 'c.benrabbit@gmail.com', 'คุณสายป่าน (K.สายป่าน)', 'ทีมออกแบบสื่อการเรียนรู้ ววน.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, organization = EXCLUDED.organization;

  -- 4. Assign Roles in public.project_members
  INSERT INTO public.project_members (project_id, user_id, role) VALUES
    (project_id, 'a0000000-0000-0000-0000-000000000001'::UUID, 'project_admin'),
    (project_id, 'a0000000-0000-0000-0000-000000000002'::UUID, 'pm'),
    (project_id, 'a0000000-0000-0000-0000-000000000003'::UUID, 'pm'),
    (project_id, 'a0000000-0000-0000-0000-000000000004'::UUID, 'pm'),
    (project_id, 'a0000000-0000-0000-0000-000000000005'::UUID, 'legal_advisor'),
    (project_id, 'a0000000-0000-0000-0000-000000000006'::UUID, 'legal_advisor'),
    (project_id, 'a0000000-0000-0000-0000-000000000007'::UUID, 'legal_advisor'),
    (project_id, 'a0000000-0000-0000-0000-000000000008'::UUID, 'legal_advisor'),
    (project_id, 'a0000000-0000-0000-0000-000000000009'::UUID, 'hrd'),
    (project_id, 'a0000000-0000-0000-0000-000000000010'::UUID, 'hrd'),
    (project_id, 'a0000000-0000-0000-0000-000000000011'::UUID, 'hrd')
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET role = EXCLUDED.role;

END $$;
