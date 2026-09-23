-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260923000004_lead_and_collaborative_expert_reviews_rls.sql
-- Purpose:
--   Option 2 Implementation: Lead Expert Assignment + Open Collaborative Co-Review
--   1. Public (4 experts) & Private (2 experts) advisors can read ALL review items & documents.
--   2. Each review item has a Lead Expert (เจ้าภาพหลัก) responsible for the primary finding.
--   3. All 6 advisors can submit collaborative evidence records (Supporting, Alternative/Dissenting, or Lead finding).
--   4. Advisors cannot self-validate (Only PM / Admin can validate and close issues).
--   5. PM / Admin manages review batches and cycles.

--------------------------------------------------------------------------------
-- 1. ENUMS & COLUMN EXTENSIONS
--------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE review_opinion_type AS ENUM (
        'LEAD_FINDING',        -- ความเห็น/ผลการตรวจของเจ้าภาพหลัก
        'SUPPORTING',          -- ความเห็นสนับสนุน / ข้อมูลเสริม
        'ALTERNATIVE_VIEW',    -- ความเห็นแย้ง / ข้อสังเกตเชิงพาณิชย์หรือกฎหมายต่างมุมมอง
        'CONSENSUS_NOTE'       -- มติที่ประชุม / ข้อสรุปของ PM
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE advisor_team_group AS ENUM (
        'PUBLIC_SECTOR',       -- ทีมที่ปรึกษาวิชาการและกฎหมายภาครัฐ (4 ท่าน)
        'PRIVATE_SECTOR',      -- ทีมที่ปรึกษากฎหมายภาคเอกชนและการร่วมลงทุน (2 ท่าน)
        'PM_OFFICE'            -- สำนักงานผู้จัดการโครงการ (PM/Research Core)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add opinion_type & reviewer_team to review_evidence_records if not present
ALTER TABLE public.review_evidence_records 
    ADD COLUMN IF NOT EXISTS opinion_type review_opinion_type DEFAULT 'LEAD_FINDING',
    ADD COLUMN IF NOT EXISTS reviewer_team advisor_team_group DEFAULT 'PUBLIC_SECTOR';

-- Add co_expert_ids to review_items for tracking multi-expert collaboration
ALTER TABLE public.review_items 
    ADD COLUMN IF NOT EXISTS co_expert_ids UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS lead_team advisor_team_group DEFAULT 'PUBLIC_SECTOR';

--------------------------------------------------------------------------------
-- 2. DROP OBSOLETE RESTRICTIVE POLICIES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Role based read review items" ON public.review_items;
DROP POLICY IF EXISTS "Assigned advisor can update assigned item without self validation" ON public.review_items;
DROP POLICY IF EXISTS "Role based select evidence records" ON public.review_evidence_records;
DROP POLICY IF EXISTS "Assigned advisor and PM insert evidence records" ON public.review_evidence_records;
DROP POLICY IF EXISTS "Reviewer and PM update evidence records" ON public.review_evidence_records;
DROP POLICY IF EXISTS "Reviewer and PM delete evidence records" ON public.review_evidence_records;

--------------------------------------------------------------------------------
-- 3. RLS POLICIES FOR COLLABORATIVE CO-REVIEW
--------------------------------------------------------------------------------

-- 3.1 REVIEW ITEMS: OPEN READ FOR ALL PROJECT ADVISORS & PM
-- ทุกท่าน (4 ท่านภาครัฐ + 2 ท่านเอกชน + PM) สามารถเปิดอ่านทุกประเด็นเพื่อการทำงานร่วมกันอย่างโปร่งใส
CREATE POLICY "Collaborative open read review items for project members"
ON public.review_items FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

-- 3.2 REVIEW ITEMS: UPDATE
-- - Lead Expert สามารถอัปเดตรายละเอียดและสถานะร่าง (ห้ามตั้งเป็น VALIDATED)
-- - PM / Admin สามารถแก้ไขและอนุมัติเป็น VALIDATED ได้
CREATE POLICY "Lead expert update draft and PM full update on review items"
ON public.review_items FOR UPDATE TO authenticated
USING (
    public.is_pm_or_admin(project_id) OR assigned_expert_id = auth.uid()
)
WITH CHECK (
    public.is_pm_or_admin(project_id)
    OR
    (
        assigned_expert_id = auth.uid()
        AND status IN ('EXPERT_VALIDATION_REQUIRED', 'SOURCE_NOT_VERIFIED', 'SOURCE_CONFLICT')
    )
);

-- 3.3 REVIEW EVIDENCE RECORDS: OPEN READ
-- สมาชิกโครงการทุกคนสามารถอ่านความเห็น/หลักฐานของทุกฝ่ายเพื่อเทียบเคียงมุมมอง
CREATE POLICY "Collaborative open read evidence records for project members"
ON public.review_evidence_records FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

-- 3.4 REVIEW EVIDENCE RECORDS: COLLABORATIVE INSERT
-- ที่ปรึกษาทุกคน (ทั้ง 6 ท่าน) และ PM สามารถส่งความเห็น/หลักฐานในทุกข้อได้ โดยบันทึก reviewer_id ของตนเอง
CREATE POLICY "Advisors and PM collaborative insert evidence records"
ON public.review_evidence_records FOR INSERT TO authenticated
WITH CHECK (
    -- PM / Admin can insert any record
    public.is_pm_or_admin(project_id)
    OR
    -- Any project member (advisors) can insert their own evidence record, but CANNOT self-validate
    (
        public.is_project_member(project_id)
        AND reviewer_id = auth.uid()
        AND resulting_status IN ('EXPERT_VALIDATION_REQUIRED', 'SOURCE_NOT_VERIFIED', 'SOURCE_CONFLICT')
    )
);

-- 3.5 REVIEW EVIDENCE RECORDS: UPDATE & DELETE
-- เจ้าของความเห็น (reviewer_id) หรือ PM สามารถแก้ไข/ลบความเห็นของตนเองได้
CREATE POLICY "Author or PM update evidence records"
ON public.review_evidence_records FOR UPDATE TO authenticated
USING (
    public.is_pm_or_admin(project_id) OR reviewer_id = auth.uid()
)
WITH CHECK (
    public.is_pm_or_admin(project_id)
    OR
    (
        reviewer_id = auth.uid()
        AND resulting_status IN ('EXPERT_VALIDATION_REQUIRED', 'SOURCE_NOT_VERIFIED', 'SOURCE_CONFLICT')
    )
);

CREATE POLICY "Author or PM delete evidence records"
ON public.review_evidence_records FOR DELETE TO authenticated
USING (
    public.is_pm_or_admin(project_id) OR reviewer_id = auth.uid()
);

--------------------------------------------------------------------------------
-- 4. TRIGGER GUARDS (PREVENT SELF-VALIDATION & MAINTAIN AUDIT TRAIL)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.guard_collaborative_review_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- Enforce that only PM or Project Admin can transition review_items to VALIDATED
    IF (NEW.status = 'VALIDATED' AND OLD.status IS DISTINCT FROM 'VALIDATED') THEN
        IF NOT public.is_pm_or_admin(NEW.project_id) THEN
            RAISE EXCEPTION 'Access Denied: Only PM or Project Admin can approve and set review item status to VALIDATED after multi-expert consensus. Advisors cannot self-validate.';
        END IF;
    END IF;

    -- Non-PM cannot reassign lead expert or change project/batch
    IF NOT public.is_pm_or_admin(NEW.project_id) THEN
        IF NEW.assigned_expert_id IS DISTINCT FROM OLD.assigned_expert_id THEN
            RAISE EXCEPTION 'Access Denied: Only PM can reassign the Lead Expert.';
        END IF;
        IF NEW.batch_id IS DISTINCT FROM OLD.batch_id OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
            RAISE EXCEPTION 'Access Denied: Only PM can alter batch or project linkage.';
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_review_item_validation_status ON public.review_items;
CREATE TRIGGER trg_guard_review_item_validation_status
    BEFORE UPDATE ON public.review_items
    FOR EACH ROW EXECUTE PROCEDURE public.guard_collaborative_review_validation();
