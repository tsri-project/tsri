-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260923000003_expert_review_assigned_rls_and_validation_guard.sql
-- Purpose: 
--   1. Restrict Advisors to only read and submit answers for review items assigned to them.
--   2. Disallow Advisors from setting status to 'VALIDATED' directly (only PM / Project Admin can validate).
--   3. Enable PM / Project Admin to fully manage review batches, rounds, and items.
--   4. Block all access from unrelated/unauthorized users.

--------------------------------------------------------------------------------
-- 1. DROP EXISTING POLICIES TO REPLACE WITH STRICT REFINED POLICIES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view review batches" ON public.review_batches;
DROP POLICY IF EXISTS "PM and Admin can manage review batches" ON public.review_batches;

DROP POLICY IF EXISTS "Members can view review items" ON public.review_items;
DROP POLICY IF EXISTS "PM and Admin can insert or update review items" ON public.review_items;
DROP POLICY IF EXISTS "Assigned experts can update their review item status" ON public.review_items;

DROP POLICY IF EXISTS "Members can view evidence records" ON public.review_evidence_records;
DROP POLICY IF EXISTS "Assigned reviewers and PM can insert evidence records" ON public.review_evidence_records;

--------------------------------------------------------------------------------
-- 2. HELPER SECURITY DEFINER FUNCTIONS FOR ROLES & ASSIGNMENTS
--------------------------------------------------------------------------------

-- Check if the current user is a PM or Admin for a project
CREATE OR REPLACE FUNCTION public.is_pm_or_admin(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = p_id 
          AND user_id = auth.uid()
          AND role IN ('project_admin', 'pm')
    ) OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = p_id AND created_by = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is an assigned expert for a review item
CREATE OR REPLACE FUNCTION public.is_assigned_review_expert(r_item_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.review_items
        WHERE id = r_item_id 
          AND assigned_expert_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY: REVIEW BATCHES (รอบตรวจ)
--------------------------------------------------------------------------------

-- 3.1 SELECT: PM / Admin / Project Members can view batches in their project
CREATE POLICY "Project members can view review batches"
ON public.review_batches FOR SELECT TO authenticated
USING (public.is_project_member(project_id));

-- 3.2 ALL (INSERT, UPDATE, DELETE): Only PM and Admin can manage review batches (rounds/cycles)
CREATE POLICY "PM and Admin can manage review batches"
ON public.review_batches FOR ALL TO authenticated
USING (public.is_pm_or_admin(project_id))
WITH CHECK (public.is_pm_or_admin(project_id));

--------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY: REVIEW ITEMS (รายการตรวจพิจารณา)
--------------------------------------------------------------------------------

-- 4.1 SELECT:
-- - PM / Admin / Researchers can view all review items in the project.
-- - Advisors / Experts can ONLY view review items assigned to them.
-- - Unrelated users cannot view any items.
CREATE POLICY "Role based read review items"
ON public.review_items FOR SELECT TO authenticated
USING (
    -- PM, Admin, Researcher can inspect all items in project
    (public.is_project_member(project_id) AND public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher'))
    OR
    -- Assigned advisor can only see items assigned to them
    (assigned_expert_id = auth.uid())
);

-- 4.2 INSERT / DELETE:
-- - Only PM and Admin can create or remove review items
CREATE POLICY "PM and Admin can insert or delete review items"
ON public.review_items FOR ALL TO authenticated
USING (public.is_pm_or_admin(project_id))
WITH CHECK (public.is_pm_or_admin(project_id));

-- 4.3 UPDATE:
-- - PM and Admin can update everything (including setting status to 'VALIDATED')
-- - Assigned Advisor can update their assigned item, but CANNOT set status to 'VALIDATED'
CREATE POLICY "Assigned advisor can update assigned item without self validation"
ON public.review_items FOR UPDATE TO authenticated
USING (
    -- Must be PM/Admin OR the assigned expert
    public.is_pm_or_admin(project_id) OR assigned_expert_id = auth.uid()
)
WITH CHECK (
    -- If PM/Admin: any valid status allowed
    public.is_pm_or_admin(project_id)
    OR
    -- If Advisor: can only update if assigned to them AND status is NOT VALIDATED
    (
        assigned_expert_id = auth.uid() 
        AND status IN ('EXPERT_VALIDATION_REQUIRED', 'SOURCE_NOT_VERIFIED', 'SOURCE_CONFLICT')
    )
);

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY: REVIEW EVIDENCE RECORDS (การส่งคำตอบและหลักฐาน)
--------------------------------------------------------------------------------

-- 5.1 SELECT:
-- - PM / Admin / Researchers can view all evidence records.
-- - Advisors can view records of items assigned to them OR records they authored.
CREATE POLICY "Role based select evidence records"
ON public.review_evidence_records FOR SELECT TO authenticated
USING (
    (public.is_project_member(project_id) AND public.get_project_role(project_id) IN ('project_admin', 'pm', 'researcher'))
    OR
    (reviewer_id = auth.uid())
    OR
    (public.is_assigned_review_expert(review_item_id))
);

-- 5.2 INSERT:
-- - PM / Admin can insert any evidence record.
-- - Assigned Advisor can insert evidence records ONLY for items assigned to them,
--   must specify reviewer_id = auth.uid(), and resulting_status CANNOT be 'VALIDATED'.
CREATE POLICY "Assigned advisor and PM insert evidence records"
ON public.review_evidence_records FOR INSERT TO authenticated
WITH CHECK (
    -- Case 1: PM / Admin
    public.is_pm_or_admin(project_id)
    OR
    -- Case 2: Assigned Advisor submitting own evidence without self-validating
    (
        reviewer_id = auth.uid()
        AND public.is_assigned_review_expert(review_item_id)
        AND resulting_status IN ('EXPERT_VALIDATION_REQUIRED', 'SOURCE_NOT_VERIFIED', 'SOURCE_CONFLICT')
    )
);

-- 5.3 UPDATE:
-- - Reviewer can update their own evidence record (cannot self-validate).
-- - PM / Admin can update any record.
CREATE POLICY "Reviewer and PM update evidence records"
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

-- 5.4 DELETE:
-- - Reviewer can delete own draft evidence record or PM/Admin.
CREATE POLICY "Reviewer and PM delete evidence records"
ON public.review_evidence_records FOR DELETE TO authenticated
USING (
    public.is_pm_or_admin(project_id) OR reviewer_id = auth.uid()
);

--------------------------------------------------------------------------------
-- 6. DATABASE TRIGGER GUARDS (AIRTIGHT VALIDATION CONTROL)
--------------------------------------------------------------------------------

-- Trigger Function: Enforce that only PM / Project Admin can transition review_items to VALIDATED
CREATE OR REPLACE FUNCTION public.guard_review_item_validation_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to VALIDATED or item is already VALIDATED and modified
    IF (NEW.status = 'VALIDATED' AND OLD.status IS DISTINCT FROM 'VALIDATED') THEN
        IF NOT public.is_pm_or_admin(NEW.project_id) THEN
            RAISE EXCEPTION 'Access Denied: Only PM or Project Admin can approve and set review item status to VALIDATED. Current user role cannot self-validate.';
        END IF;
    END IF;

    -- If an assigned advisor is updating the item, prevent changing assignment or project
    IF NOT public.is_pm_or_admin(NEW.project_id) THEN
        IF NEW.assigned_expert_id IS DISTINCT FROM OLD.assigned_expert_id THEN
            RAISE EXCEPTION 'Access Denied: Advisors cannot reassign review items.';
        END IF;
        IF NEW.batch_id IS DISTINCT FROM OLD.batch_id OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
            RAISE EXCEPTION 'Access Denied: Advisors cannot alter batch or project linkage.';
        END IF;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_review_item_validation_status ON public.review_items;
CREATE TRIGGER trg_guard_review_item_validation_status
    BEFORE UPDATE ON public.review_items
    FOR EACH ROW EXECUTE PROCEDURE public.guard_review_item_validation_status();

-- Trigger Function: Enforce that evidence records cannot have resulting_status 'VALIDATED' unless inserted/updated by PM/Admin
CREATE OR REPLACE FUNCTION public.guard_evidence_record_validation_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resulting_status = 'VALIDATED' THEN
        IF NOT public.is_pm_or_admin(NEW.project_id) THEN
            RAISE EXCEPTION 'Access Denied: Only PM or Project Admin can record a VALIDATED resulting status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_guard_evidence_record_validation_status ON public.review_evidence_records;
CREATE TRIGGER trg_guard_evidence_record_validation_status
    BEFORE INSERT OR UPDATE ON public.review_evidence_records
    FOR EACH ROW EXECUTE PROCEDURE public.guard_evidence_record_validation_status();
