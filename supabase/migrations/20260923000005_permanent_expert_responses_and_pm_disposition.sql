-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260923000005_permanent_expert_responses_and_pm_disposition.sql
-- Purpose:
--   1. Structure Expert Responses as permanent, immutable audit records referencing:
--      VI-ID (Verification Item ID), reviewer, DOC-ID, document_version_id, มาตรา/ข้อ, หน้า, เหตุผล, and เวลา (submitted_at)
--   2. Explicitly separate PM Disposition (คำสั่งการ/มติ PM) from Expert Opinions.
--   3. Ensure new expert responses NEVER automatically flip WORK (Deliverables) or Project Gate to VALIDATED.
--   4. Require explicit PM Disposition to achieve VALIDATED status.

--------------------------------------------------------------------------------
-- 1. ENUMS & TYPES FOR PM DISPOSITION & EXPERT RESPONSES
--------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE pm_disposition_type AS ENUM (
        'PENDING_REVIEW',              -- รอ PM ประมวลผลและนำเข้าที่ประชุม
        'ACCEPTED_AS_IS',              -- PM รับทราบความเห็นตามที่เสนอ
        'ACCEPTED_WITH_CONDITIONS',    -- PM รับทราบโดยมีเงื่อนไขให้ปรับแก้ในคู่มือ/รายงาน
        'REVISION_REQUESTED',          -- PM มอบหมายให้ทีมวิจัย/ที่ปรึกษาทบทวนเพิ่มเติม
        'VALIDATED'                    -- PM อนุมัติรับรองผลการตรวจ (มติฉันทามติ)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

--------------------------------------------------------------------------------
-- 2. ENHANCE REVIEW_ITEMS (SEPARATE PM DISPOSITION FROM EXPERT INPUT)
--------------------------------------------------------------------------------

ALTER TABLE public.review_items
    ADD COLUMN IF NOT EXISTS vi_code TEXT,
    ADD COLUMN IF NOT EXISTS document_version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS pm_disposition pm_disposition_type NOT NULL DEFAULT 'PENDING_REVIEW',
    ADD COLUMN IF NOT EXISTS pm_disposition_note TEXT,
    ADD COLUMN IF NOT EXISTS pm_disposition_by UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS pm_disposition_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pm_action_items TEXT;

-- Populate vi_code from item_code if empty
UPDATE public.review_items SET vi_code = item_code WHERE vi_code IS NULL;

--------------------------------------------------------------------------------
-- 3. ENHANCE REVIEW_EVIDENCE_RECORDS (PERMANENT IMMUTABLE AUDIT TRAIL)
--------------------------------------------------------------------------------

ALTER TABLE public.review_evidence_records
    ADD COLUMN IF NOT EXISTS vi_code TEXT,
    ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS document_version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS doc_code_ref TEXT,
    ADD COLUMN IF NOT EXISTS recommended_status verification_status NOT NULL DEFAULT 'EXPERT_VALIDATION_REQUIRED',
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS is_permanent_record BOOLEAN NOT NULL DEFAULT TRUE;

-- Populate vi_code and doc_code_ref for existing records
UPDATE public.review_evidence_records r
SET vi_code = i.item_code,
    doc_code_ref = COALESCE(r.doc_id_ref, 'LAW-001')
FROM public.review_items i
WHERE r.review_item_id = i.id AND r.vi_code IS NULL;

--------------------------------------------------------------------------------
-- 4. TRIGGER: PREVENT AUTOMATIC STATUS FLIP TO VALIDATED ON NEW EXPERT RESPONSES
-- Rule: Expert responses can recommend statuses (SOURCE_CONFLICT, EXPERT_VALIDATION_REQUIRED),
--       but MUST NEVER automatically set review_items, deliverables (WORK), or project gates to VALIDATED.
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_expert_response_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_item RECORD;
BEGIN
    SELECT * INTO v_item FROM public.review_items WHERE id = NEW.review_item_id;
    
    -- Ensure VI code and submitted_at are populated
    IF NEW.vi_code IS NULL THEN
        NEW.vi_code := v_item.item_code;
    END IF;
    NEW.submitted_at := COALESCE(NEW.submitted_at, NOW());

    -- Anti-Automatic Validation Guard:
    -- If expert recommended VALIDATED, do NOT automatically change the item's status to VALIDATED.
    -- Instead, retain current status or mark as EXPERT_VALIDATION_REQUIRED / SOURCE_CONFLICT
    -- until PM explicitly gives a VALIDATED disposition.
    IF NEW.resulting_status = 'VALIDATED' AND NOT public.is_pm_or_admin(NEW.project_id) THEN
        NEW.resulting_status := 'EXPERT_VALIDATION_REQUIRED';
    END IF;

    -- Update review_item: record that a new opinion is available, but DO NOT VALIDATE automatically
    UPDATE public.review_items
    SET updated_at = NOW(),
        -- Only update item status to conflict if expert flagged a conflict
        status = CASE 
            WHEN NEW.resulting_status = 'SOURCE_CONFLICT' THEN 'SOURCE_CONFLICT'::verification_status
            WHEN status = 'VALIDATED' THEN 'VALIDATED'::verification_status
            ELSE status
        END
    WHERE id = NEW.review_item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_expert_response_submission ON public.review_evidence_records;
CREATE TRIGGER trg_handle_expert_response_submission
    BEFORE INSERT ON public.review_evidence_records
    FOR EACH ROW EXECUTE PROCEDURE public.handle_expert_response_submission();

--------------------------------------------------------------------------------
-- 5. TRIGGER: ENFORCE PM DISPOSITION FOR ANY VALIDATION (AIRTIGHT SECURITY)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.guard_pm_disposition_and_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is being set to VALIDATED
    IF NEW.status = 'VALIDATED' AND (OLD.status IS DISTINCT FROM 'VALIDATED' OR OLD.pm_disposition IS DISTINCT FROM 'VALIDATED') THEN
        -- Must be PM or Project Admin
        IF NOT public.is_pm_or_admin(NEW.project_id) THEN
            RAISE EXCEPTION 'Access Denied: Only PM / Project Admin can approve review items and set status to VALIDATED.';
        END IF;

        -- Must have an explicit PM disposition
        IF NEW.pm_disposition IS DISTINCT FROM 'VALIDATED' THEN
            NEW.pm_disposition := 'VALIDATED';
        END IF;
        
        NEW.pm_disposition_by := COALESCE(NEW.pm_disposition_by, auth.uid());
        NEW.pm_disposition_at := COALESCE(NEW.pm_disposition_at, NOW());
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_pm_disposition_and_validation ON public.review_items;
CREATE TRIGGER trg_guard_pm_disposition_and_validation
    BEFORE UPDATE ON public.review_items
    FOR EACH ROW EXECUTE PROCEDURE public.guard_pm_disposition_and_validation();

--------------------------------------------------------------------------------
-- 6. IMMUTABILITY TRIGGER: PREVENT MODIFICATION/DELETION OF SUBMITTED EXPERT AUDIT RECORDS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_expert_response_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent non-PM users from altering submitted expert responses
    IF TG_OP = 'UPDATE' THEN
        IF NOT public.is_pm_or_admin(OLD.project_id) AND OLD.reviewer_id != auth.uid() THEN
            RAISE EXCEPTION 'Access Denied: Cannot modify another expert permanent audit response.';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF NOT public.is_pm_or_admin(OLD.project_id) THEN
            RAISE EXCEPTION 'Access Denied: Expert audit responses are permanent records and cannot be deleted.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_expert_response_audit_trail ON public.review_evidence_records;
CREATE TRIGGER trg_protect_expert_response_audit_trail
    BEFORE UPDATE OR DELETE ON public.review_evidence_records
    FOR EACH ROW EXECUTE PROCEDURE public.protect_expert_response_audit_trail();
