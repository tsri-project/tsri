-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260922000001_initial_schema_and_rls.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
--------------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
    'project_admin',
    'pm',
    'researcher',
    'legal_advisor',
    'hrd',
    'stakeholder',
    'viewer'
);

CREATE TYPE project_gate AS ENUM (
    'G0', -- Project Baseline
    'G1', -- Source Verification
    'G2', -- Research Validation
    'G3', -- Analysis Validation
    'G4', -- Knowledge Validation
    'G5', -- Acceptance Readiness
    'G6'  -- Release
);

CREATE TYPE document_prefix AS ENUM (
    'LAW',   -- พระราชบัญญัติ / กฎหมายหลัก
    'REG',   -- กฎกระทรวง / ระเบียบ
    'ANN',   -- ประกาศ
    'RULE',  -- ข้อบังคับ
    'RES',   -- มติคณะกรรมการ / มติ ครม.
    'ORD',   -- คำสั่ง
    'GUIDE', -- แนวปฏิบัติ / คู่มือ
    'FORM',  -- แบบฟอร์ม
    'TOR',   -- ขอบเขตของงาน / สัญญา
    'MOM',   -- บันทึกการประชุม
    'REP',   -- รายงานความก้าวหน้า
    'REV',   -- ผลการตรวจพิจารณา
    'EVD',   -- เอกสารหลักฐาน
    'DEL'    -- ผลผลิตส่งมอบ
);

CREATE TYPE document_status AS ENUM (
    'RAW',
    'INDEXED',
    'UNDER_REVIEW',
    'VERIFIED',
    'VALIDATED',
    'SUPERSEDED',
    'REPEALED',
    'ARCHIVED'
);

CREATE TYPE work_status AS ENUM (
    'BACKLOG',
    'IN_PROGRESS',
    'INTERNAL_REVIEW',
    'EXPERT_REVIEW',
    'REVISION',
    'VALIDATED',
    'ACCEPTANCE_REVIEW',
    'APPROVED',
    'RELEASED'
);

--------------------------------------------------------------------------------
-- 2. USER PROFILES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    organization TEXT DEFAULT 'สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 3. PROJECTS & MEMBERS (Every project table must reference project_id)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. TSRI-LEGAL-2026
    title TEXT NOT NULL,
    description TEXT,
    organization TEXT DEFAULT 'สกสว.',
    current_gate project_gate NOT NULL DEFAULT 'G0',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    baseline_budget NUMERIC(15, 2) DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

--------------------------------------------------------------------------------
-- 4. TOR & DELIVERABLES MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tor_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. DEL-01, DEL-02
    title TEXT NOT NULL,
    description TEXT,
    mandate_ref TEXT, -- Reference to Legal Mandate/Function
    weight_percentage NUMERIC(5, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    gate_milestone project_gate NOT NULL DEFAULT 'G1',
    status work_status NOT NULL DEFAULT 'BACKLOG',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, code)
);

--------------------------------------------------------------------------------
-- 5. DOCUMENT CENTER & VERSIONS
-- Rule: Never overwrite validated document versions.
-- document -> document_versions
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    prefix_code document_prefix NOT NULL,
    document_code TEXT NOT NULL, -- e.g. LAW-001, TOR-01, MOM-2026-03
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. กฎหมายจัดตั้ง, ระเบียบการเงิน, รายงานผล
    issuing_body TEXT, -- e.g. คณะรัฐมนตรี, สกสว., บพท.
    effective_date DATE,
    status document_status NOT NULL DEFAULT 'RAW',
    latest_version_number TEXT DEFAULT '1.0',
    tags TEXT[] DEFAULT '{}',
    is_confidential BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, document_code)
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL, -- e.g. 1.0, 1.1, 2.0
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_mime_type TEXT NOT NULL,
    storage_r2_key TEXT NOT NULL,
    storage_url TEXT,
    checksum_sha256 TEXT,
    change_summary TEXT,
    status document_status NOT NULL DEFAULT 'UNDER_REVIEW',
    validated_by UUID REFERENCES public.profiles(id),
    validated_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

--------------------------------------------------------------------------------
-- 6. MEETINGS & MOM CENTER
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    meeting_number TEXT NOT NULL, -- e.g. MOM-01/2026
    title TEXT NOT NULL,
    agenda TEXT,
    meeting_type TEXT DEFAULT 'คณะทำงาน', -- คณะกรรมการ, ผู้เชี่ยวชาญ, ประชุมภายใน
    gate_ref project_gate,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 120,
    location_or_link TEXT,
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    mom_document_version_id UUID REFERENCES public.document_versions(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, meeting_number)
);

CREATE TABLE IF NOT EXISTS public.meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    guest_name TEXT,
    guest_org TEXT,
    role_in_meeting TEXT DEFAULT 'ผู้เข้าร่วม',
    attended BOOLEAN DEFAULT TRUE
);

--------------------------------------------------------------------------------
-- 7. AUDIT & ACTIVITY LOGGING
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, VALIDATE, GATE_CHANGE
    entity_table TEXT NOT NULL, -- documents, tor_deliverables, meetings, etc.
    entity_id UUID NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tor_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is member of project
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_id = p_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role in project
CREATE OR REPLACE FUNCTION public.get_project_role(p_id UUID)
RETURNS user_role AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role INTO u_role FROM public.project_members 
    WHERE project_id = p_id AND user_id = auth.uid();
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view all profiles, update own
CREATE POLICY "Profiles viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Projects: Members can select, admins/pm can insert/update
CREATE POLICY "Project members can view project"
ON public.projects FOR SELECT TO authenticated
USING (public.is_project_member(id) OR created_by = auth.uid());

CREATE POLICY "Admins and PMs can update project"
ON public.projects FOR UPDATE TO authenticated
USING (public.get_project_role(id) IN ('project_admin', 'pm') OR created_by = auth.uid());

-- Project Members: Viewable by members, editable by project_admin
CREATE POLICY "Members can view project membership"
ON public.project_members FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Admins can manage project members"
ON public.project_members FOR ALL TO authenticated
USING (public.get_project_role(project_id) = 'project_admin');

-- TOR Deliverables: Viewable by members, editable by admin/pm/researcher
CREATE POLICY "Members can view deliverables"
ON public.tor_deliverables FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Editors can modify deliverables"
ON public.tor_deliverables FOR ALL TO authenticated
USING (public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher'));

-- Documents & Versions: Viewable by members, insertable/editable by editors
CREATE POLICY "Members can view documents"
ON public.documents FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Editors can modify documents"
ON public.documents FOR ALL TO authenticated
USING (public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher', 'legal_advisor'));

CREATE POLICY "Members can view document versions"
ON public.document_versions FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create document versions"
ON public.document_versions FOR INSERT TO authenticated
WITH CHECK (public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher', 'legal_advisor'));

-- Meetings: Viewable by members, manageable by pm/admin/researcher
CREATE POLICY "Members can view meetings"
ON public.meetings FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Organizers can manage meetings"
ON public.meetings FOR ALL TO authenticated
USING (public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher'));

-- Activity Logs: Read-only for members, insertable via system
CREATE POLICY "Members can view activity logs"
ON public.activity_logs FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Authenticated users can create activity logs"
ON public.activity_logs FOR INSERT TO authenticated
WITH CHECK (public.is_project_member(project_id));

--------------------------------------------------------------------------------
-- 9. TRIGGERS FOR UPDATED_AT & IMMUTABILITY PROTECTION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_documents_modtime
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_tor_deliverables_modtime
    BEFORE UPDATE ON public.tor_deliverables
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER update_meetings_modtime
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Rule: Prevent updating a validated document version file/details
CREATE OR REPLACE FUNCTION public.protect_validated_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'VALIDATED' AND NEW.status != 'SUPERSEDED' AND NEW.status != 'REPEALED' AND NEW.status != 'ARCHIVED' THEN
        RAISE EXCEPTION 'Cannot modify or overwrite a VALIDATED document version. Please create a new version.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_validated_document_versions
    BEFORE UPDATE ON public.document_versions
    FOR EACH ROW EXECUTE PROCEDURE public.protect_validated_versions();
