-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260923000002_expert_review_batches_and_rls.sql
-- Purpose: Expert Review Center schema, Distinct Verification Statuses, Evidence Audit Trail & RLS

--------------------------------------------------------------------------------
-- 1. ENUMS & TYPES
--------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'SOURCE_NOT_VERIFIED',
        'SOURCE_CONFLICT',
        'EXPERT_VALIDATION_REQUIRED',
        'VALIDATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

--------------------------------------------------------------------------------
-- 2. REVIEW BATCHES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL, -- e.g. BATCH-01, BATCH-02
    title TEXT NOT NULL,
    description TEXT,
    gate_target project_gate NOT NULL DEFAULT 'G2', -- Gate that depends on this batch
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, IN_REVIEW, COMPLETED, ARCHIVED
    total_items INT DEFAULT 0,
    validated_items INT DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, batch_number)
);

--------------------------------------------------------------------------------
-- 3. REVIEW ITEMS TABLE (Specific items to be audited)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.review_batches(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL, -- e.g. REV-B1-001
    title TEXT NOT NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    document_version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
    deliverable_id UUID REFERENCES public.tor_deliverables(id) ON DELETE SET NULL,
    article_section TEXT, -- e.g. มาตรา 58, ข้อ 14 (1)
    page_number INT,
    issue_description TEXT NOT NULL,
    assigned_expert_id UUID REFERENCES public.profiles(id),
    assigned_category TEXT, -- ADVISORY_LEGAL, ADVISORY_PRIVATE, ADVISORY_HRD
    status verification_status NOT NULL DEFAULT 'EXPERT_VALIDATION_REQUIRED',
    priority TEXT NOT NULL DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(batch_id, item_code)
);

--------------------------------------------------------------------------------
-- 4. REVIEW EVIDENCE RECORDS (Audit Trail & Evidence-backed answers)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_evidence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_item_id UUID NOT NULL REFERENCES public.review_items(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    doc_id_ref TEXT NOT NULL, -- e.g. LAW-001 v1.0
    article_section TEXT NOT NULL, -- e.g. มาตรา 58 วรรคสอง
    page_number INT NOT NULL,
    edition_used TEXT NOT NULL, -- e.g. ราชกิจจานุเบกษา เล่ม 136 ตอนที่ 59 ก
    rationale TEXT NOT NULL, -- คำวินิจฉัย / เหตุผลทางกฎหมาย
    requirement_impact TEXT NOT NULL, -- ผลกระทบต่อ TOR REQ และข้อกำหนดโครงการ
    storage_r2_key TEXT, -- File key in Cloudflare R2
    evidence_file_name TEXT,
    evidence_file_size BIGINT,
    resulting_status verification_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

ALTER TABLE public.review_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_evidence_records ENABLE ROW LEVEL SECURITY;

-- 5.1 Review Batches
CREATE POLICY "Members can view review batches"
ON public.review_batches FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "PM and Admin can manage review batches"
ON public.review_batches FOR ALL TO authenticated
USING (public.get_project_role(project_id) IN ('project_admin', 'pm'));

-- 5.2 Review Items
-- Rule: Members can view all items in batch; Assigned experts have quick query capability
CREATE POLICY "Members can view review items"
ON public.review_items FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "PM and Admin can insert or update review items"
ON public.review_items FOR ALL TO authenticated
USING (public.get_project_role(project_id) IN ('project_admin', 'pm'));

CREATE POLICY "Assigned experts can update their review item status"
ON public.review_items FOR UPDATE TO authenticated
USING (assigned_expert_id = auth.uid() OR public.get_project_role(project_id) IN ('project_admin', 'pm'));

-- 5.3 Review Evidence Records
CREATE POLICY "Members can view evidence records"
ON public.review_evidence_records FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

CREATE POLICY "Assigned reviewers and PM can insert evidence records"
ON public.review_evidence_records FOR INSERT TO authenticated
WITH CHECK (
    reviewer_id = auth.uid() OR 
    public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher')
);

--------------------------------------------------------------------------------
-- 6. TRIGGERS: AUTO-UPDATE BATCH COUNTERS & PREVENT OVERWRITES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_review_batch_counts()
RETURNS TRIGGER AS $$
DECLARE
    target_batch UUID;
    t_count INT;
    v_count INT;
BEGIN
    target_batch := COALESCE(NEW.batch_id, OLD.batch_id);
    
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'VALIDATED')
    INTO t_count, v_count
    FROM public.review_items
    WHERE batch_id = target_batch;

    UPDATE public.review_batches
    SET total_items = t_count,
        validated_items = v_count,
        updated_at = NOW()
    WHERE id = target_batch;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batch_counts_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON public.review_items
    FOR EACH ROW EXECUTE PROCEDURE public.sync_review_batch_counts();
