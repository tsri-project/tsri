-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260924000008_atomic_pm_disposition_rpc.sql
-- Purpose:
--   1. Clean up old function signatures of submit_pm_disposition_atomic.
--   2. Enforce single atomic RPC transaction for PM Disposition.
--   3. Strict authorization: Only auth.uid() with project_members.role in ('project_admin', 'pm') of the target project.
--      Explicitly rejects non-members, non-authenticated callers, other projects' PMs, and advisory roles.
--   4. Strict Schema-Grounded Workflow Guard:
--      - "เห็นชอบ" (Approved): Checks the LATEST submitted finding from assigned Lead Expert (recommended_status = 'VALIDATED').
--        If Lead Expert previously approved but later submitted a revision request (EXPERT_VALIDATION_REQUIRED / SOURCE_CONFLICT),
--        the latest status governs and VALIDATED is strictly rejected.
--      - "ขัดแย้ง" (Conflict): Any record with recommended_status = 'SOURCE_CONFLICT' or resulting_status = 'SOURCE_CONFLICT' blocks VALIDATED.
--      - "ขอแก้ไข" (Revision): If Lead Expert latest recommendation != 'VALIDATED', VALIDATED is strictly rejected.
--   5. Secure search_path = public, pg_temp and strict EXECUTE permissions.
--   6. Derives VI-ID, document_id, document_version_id, and doc_id_ref strictly from database rows.
--   7. Never creates fake/synthetic file metadata (stores NULL if no actual file attached).

-- Drop any previous signatures of submit_pm_disposition_atomic
DROP FUNCTION IF EXISTS public.submit_pm_disposition_atomic(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.submit_pm_disposition_atomic(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT);
DROP FUNCTION IF EXISTS public.submit_pm_disposition_atomic(UUID, pm_disposition_type, TEXT, TEXT, TEXT, TEXT, BIGINT);

CREATE OR REPLACE FUNCTION public.submit_pm_disposition_atomic(
    p_item_id UUID,
    p_pm_disposition TEXT,
    p_pm_disposition_note TEXT,
    p_pm_action_items TEXT,
    p_evidence_storage_key TEXT DEFAULT NULL,
    p_evidence_file_name TEXT DEFAULT NULL,
    p_evidence_file_size BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_item RECORD;
    v_caller_role user_role;
    v_new_status verification_status;
    v_latest_lead_status verification_status;
    v_has_active_conflict BOOLEAN;
    v_evd_id UUID;
    v_disposition_enum pm_disposition_type;
    v_real_vi_code TEXT;
    v_doc_code TEXT;
    v_version_number TEXT;
    v_doc_id_ref TEXT;
BEGIN
    -- 1. Check Authenticated Session
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Authenticated user session required (auth.uid() is null)';
    END IF;

    -- 2. Fetch Target Review Item from DB
    SELECT * INTO v_item FROM public.review_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Review item with ID % not found', p_item_id;
    END IF;

    -- 3. Strict PM / Project Admin Role Validation for THIS Project
    SELECT role INTO v_caller_role 
    FROM public.project_members 
    WHERE project_id = v_item.project_id AND user_id = v_caller_uid;

    IF NOT FOUND OR v_caller_role IS NULL OR v_caller_role NOT IN ('project_admin', 'pm') THEN
        RAISE EXCEPTION 'Access Denied: Only PM or Project Admin of project % can record PM disposition (Caller: %, Role: %)',
            v_item.project_id, v_caller_uid, COALESCE(v_caller_role::text, 'NON_MEMBER');
    END IF;

    -- 4. Cast and Validate Disposition Type
    BEGIN
        v_disposition_enum := p_pm_disposition::pm_disposition_type;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid pm_disposition value: %', p_pm_disposition;
    END;

    -- 5. Strict Schema-Grounded Workflow Validation
    IF v_disposition_enum = 'VALIDATED' THEN
        -- Check 5.1: VI must have an assigned Lead Expert
        IF v_item.assigned_expert_id IS NULL THEN
            RAISE EXCEPTION 'Workflow Guard Violation: Cannot approve VALIDATED on VI % because no Lead Expert is assigned.',
                COALESCE(v_item.vi_code, v_item.item_code);
        END IF;

        -- Check 5.2: Check for active unresolved "ขัดแย้ง" (SOURCE_CONFLICT)
        SELECT EXISTS (
            SELECT 1 FROM public.review_evidence_records
            WHERE review_item_id = v_item.id
              AND (
                  reviewer_id = v_item.assigned_expert_id
                  OR
                  (v_item.co_expert_ids IS NOT NULL AND reviewer_id = ANY(v_item.co_expert_ids))
              )
              AND (recommended_status = 'SOURCE_CONFLICT' OR resulting_status = 'SOURCE_CONFLICT')
        ) INTO v_has_active_conflict;

        IF v_has_active_conflict THEN
            RAISE EXCEPTION 'Workflow Guard Violation: Cannot approve VALIDATED on VI % because there is an active unresolved SOURCE_CONFLICT from an assigned expert.',
                COALESCE(v_item.vi_code, v_item.item_code);
        END IF;

        -- Check 5.3: Check "เห็นชอบ" strictly from the LATEST submitted finding of the assigned Lead Expert
        SELECT recommended_status
        INTO v_latest_lead_status
        FROM public.review_evidence_records
        WHERE review_item_id = v_item.id
          AND reviewer_id = v_item.assigned_expert_id
          AND submitted_at IS NOT NULL
          AND is_permanent_record = TRUE
        ORDER BY submitted_at DESC, created_at DESC
        LIMIT 1;

        IF v_latest_lead_status IS NULL OR v_latest_lead_status != 'VALIDATED' THEN
            RAISE EXCEPTION 'Workflow Guard Violation: Cannot set pm_disposition to VALIDATED on VI % because the latest finding from assigned Lead Expert (Expert: %) is "%" (not VALIDATED).',
                COALESCE(v_item.vi_code, v_item.item_code),
                v_item.assigned_expert_id,
                COALESCE(v_latest_lead_status::text, 'NO_SUBMISSION');
        END IF;

        v_new_status := 'VALIDATED'::verification_status;
    ELSIF v_disposition_enum = 'REVISION_REQUESTED' THEN
        v_new_status := 'SOURCE_CONFLICT'::verification_status;
    ELSIF v_item.status = 'VALIDATED' THEN
        v_new_status := 'EXPERT_VALIDATION_REQUIRED'::verification_status;
    ELSE
        v_new_status := v_item.status;
    END IF;

    -- 6. Derive VI-ID and Document Version Metadata Strictly from Database Records
    v_real_vi_code := COALESCE(v_item.vi_code, v_item.item_code);

    IF v_item.document_version_id IS NOT NULL THEN
        SELECT d.document_code, dv.version_number
        INTO v_doc_code, v_version_number
        FROM public.document_versions dv
        JOIN public.documents d ON d.id = dv.document_id
        WHERE dv.id = v_item.document_version_id;
    ELSIF v_item.document_id IS NOT NULL THEN
        SELECT document_code INTO v_doc_code FROM public.documents WHERE id = v_item.document_id;
        v_version_number := '1.0';
    END IF;

    v_doc_code := COALESCE(v_doc_code, 'DOC');
    v_version_number := COALESCE(v_version_number, '1.0');
    v_doc_id_ref := v_doc_code || ' v' || v_version_number;

    -- 7. Atomic Step A: UPDATE review_items
    UPDATE public.review_items
    SET status = v_new_status,
        pm_disposition = v_disposition_enum,
        pm_disposition_note = p_pm_disposition_note,
        pm_disposition_by = v_caller_uid,
        pm_disposition_at = NOW(),
        pm_action_items = p_pm_action_items,
        updated_at = NOW()
    WHERE id = p_item_id;

    -- 8. Atomic Step B: INSERT review_evidence_records
    v_evd_id := gen_random_uuid();
    INSERT INTO public.review_evidence_records (
        id,
        review_item_id,
        project_id,
        reviewer_id,
        review_date,
        submitted_at,
        doc_id_ref,
        doc_code_ref,
        document_id,
        document_version_id,
        vi_code,
        article_section,
        page_number,
        edition_used,
        rationale,
        requirement_impact,
        storage_r2_key,
        evidence_file_name,
        evidence_file_size,
        resulting_status,
        recommended_status,
        is_permanent_record,
        created_at
    ) VALUES (
        v_evd_id,
        v_item.id,
        v_item.project_id,
        v_caller_uid,
        NOW(),
        NOW(),
        v_doc_id_ref,
        v_doc_code,
        v_item.document_id,
        v_item.document_version_id,
        v_real_vi_code,
        COALESCE(v_item.article_section, 'N/A'),
        COALESCE(v_item.page_number, 1),
        'มติที่ประชุมคณะที่ปรึกษาและผู้จัดการโครงการ (PM Disposition)',
        '[PM Disposition: ' || p_pm_disposition || '] ' || COALESCE(p_pm_disposition_note, ''),
        CASE 
            WHEN v_new_status = 'VALIDATED' THEN 'ผ่านการรับรองจาก PM บรรจุใน Inception Report (DEL-01)'
            ELSE 'ต้องปรับปรุงตามข้อสั่งการของ PM'
        END,
        p_evidence_storage_key,
        p_evidence_file_name,
        p_evidence_file_size,
        v_new_status,
        v_new_status,
        TRUE,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'item_id', p_item_id,
        'status', v_new_status,
        'pm_disposition', p_pm_disposition,
        'evidence_record_id', v_evd_id,
        'pm_id', v_caller_uid,
        'updated_at', NOW()
    );
END;
$$;

-- Revoke all default public access and grant execute only to authenticated users
REVOKE ALL ON FUNCTION public.submit_pm_disposition_atomic(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_pm_disposition_atomic(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) TO authenticated;
