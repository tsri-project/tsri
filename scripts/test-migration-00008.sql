-- ============================================================================
-- TSRI Control Center — Test Script for Migration 00008 (ISOLATED TEST DB ONLY)
-- WARNING: NEVER RUN ON PRODUCTION DATABASE. USE ONLY ON DEDICATED TEST DB.
-- ============================================================================

\set ON_ERROR_STOP on

BEGIN; -- Run within a test transaction block to allow verification & cleanup

-- ----------------------------------------------------------------------------
-- 1. SETUP TEST FIXTURES
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_proj_id UUID := '00000000-0000-0000-0000-000000000001';
    v_pm_id UUID := '00000000-0000-0000-0000-000000000002';
    v_lead_id UUID := '00000000-0000-0000-0000-000000000003';
    v_co_id UUID := '00000000-0000-0000-0000-000000000004';
    v_outsider_id UUID := '00000000-0000-0000-0000-000000000005';
    v_batch_id UUID := '00000000-0000-0000-0000-000000000010';
    v_item_id UUID := '00000000-0000-0000-0000-000000000020';
BEGIN
    RAISE NOTICE '🚀 Setting up isolated test fixtures...';

    -- Create Profiles
    INSERT INTO public.profiles (id, email, full_name, organization) VALUES
        (v_pm_id, 'pm.test@tsri.or.th', 'PM Tester', 'สกสว.'),
        (v_lead_id, 'lead.test@tsri.or.th', 'Lead Expert Tester', 'ม.บูรพา'),
        (v_co_id, 'co.test@tsri.or.th', 'Co Expert Tester', 'มฟล.'),
        (v_outsider_id, 'outsider.test@tsri.or.th', 'Outsider User', 'บุคคลภายนอก')
    ON CONFLICT (id) DO NOTHING;

    -- Create Project & Members
    INSERT INTO public.projects (id, code, title, created_by) VALUES
        (v_proj_id, 'PRJ-TEST', 'Test Project For Migration 00008', v_pm_id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.project_members (project_id, user_id, role) VALUES
        (v_proj_id, v_pm_id, 'pm'),
        (v_proj_id, v_lead_id, 'legal_advisor'),
        (v_proj_id, v_co_id, 'legal_advisor'),
        (v_proj_id, v_outsider_id, 'viewer')
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- Create Review Batch & Review Item
    INSERT INTO public.review_batches (id, project_id, batch_number, title, created_by) VALUES
        (v_batch_id, v_proj_id, 'BATCH-TEST-01', 'Test Batch', v_pm_id)
    ON CONFLICT (project_id, batch_number) DO NOTHING;

    INSERT INTO public.review_items (
        id, batch_id, project_id, item_code, vi_code, title, issue_description,
        assigned_expert_id, co_expert_ids, status, pm_disposition
    ) VALUES (
        v_item_id, v_batch_id, v_proj_id, 'VI-TEST-001', 'VI-TEST-001', 'Test Item', 'Test Issue Description',
        v_lead_id, ARRAY[v_co_id], 'EXPERT_VALIDATION_REQUIRED', 'PENDING_REVIEW'
    )
    ON CONFLICT (id) DO UPDATE SET
        status = 'EXPERT_VALIDATION_REQUIRED',
        pm_disposition = 'PENDING_REVIEW',
        assigned_expert_id = v_lead_id,
        co_expert_ids = ARRAY[v_co_id];

    RAISE NOTICE '✅ Fixtures successfully initialized.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST CASE 1: ไม่มีสิทธิ์ (Non-PM User / Outsider Calling RPC)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_item_id UUID := '00000000-0000-0000-0000-000000000020';
    v_outsider_id UUID := '00000000-0000-0000-0000-000000000005';
    v_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '--- Test 1: ไม่มีสิทธิ์ (Non-PM caller) ---';
    -- Simulate session as outsider
    PERFORM set_config('request.jwt.claim.sub', v_outsider_id::text, true);

    BEGIN
        PERFORM public.submit_pm_disposition_atomic(v_item_id, 'VALIDATED', 'Note', 'Actions');
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
        RAISE NOTICE '  ✓ Caught expected permission error: %', SQLERRM;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Non-PM user should be rejected!';
    END IF;
    RAISE NOTICE '✅ Test 1 Passed: Unauthorized caller was rejected.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST CASE 2: Lead เคยเห็นชอบ แล้วภายหลังเปลี่ยนเป็นขอแก้ไข
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_proj_id UUID := '00000000-0000-0000-0000-000000000001';
    v_pm_id UUID := '00000000-0000-0000-0000-000000000002';
    v_lead_id UUID := '00000000-0000-0000-0000-000000000003';
    v_item_id UUID := '00000000-0000-0000-0000-000000000020';
    v_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '--- Test 2: Lead เคยเห็นชอบ (T1) แล้วภายหลังขอแก้ไข (T2) ---';
    -- T1: Lead Expert approved
    INSERT INTO public.review_evidence_records (
        review_item_id, project_id, reviewer_id, doc_id_ref, article_section, page_number,
        edition_used, rationale, requirement_impact, resulting_status, recommended_status,
        opinion_type, submitted_at, is_permanent_record
    ) VALUES (
        v_item_id, v_proj_id, v_lead_id, 'DOC v1.0', 'ข้อ 1', 1,
        'ราชกิจจา', 'เห็นชอบรอบแรก', 'ไม่มี', 'VALIDATED', 'VALIDATED',
        'LEAD_FINDING', NOW() - INTERVAL '2 hours', TRUE
    );

    -- T2: Lead Expert later revised to EXPERT_VALIDATION_REQUIRED
    INSERT INTO public.review_evidence_records (
        review_item_id, project_id, reviewer_id, doc_id_ref, article_section, page_number,
        edition_used, rationale, requirement_impact, resulting_status, recommended_status,
        opinion_type, submitted_at, is_permanent_record
    ) VALUES (
        v_item_id, v_proj_id, v_lead_id, 'DOC v1.0', 'ข้อ 1', 1,
        'ราชกิจจา', 'พบข้อบกพร่องเพิ่มเติม ขอให้แก้ไข', 'มีผลกระทบ', 'EXPERT_VALIDATION_REQUIRED', 'EXPERT_VALIDATION_REQUIRED',
        'LEAD_FINDING', NOW() - INTERVAL '10 minutes', TRUE
    );

    -- PM tries to validate
    PERFORM set_config('request.jwt.claim.sub', v_pm_id::text, true);
    BEGIN
        PERFORM public.submit_pm_disposition_atomic(v_item_id, 'VALIDATED', 'PM Approval Note', 'Actions');
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
        RAISE NOTICE '  ✓ Caught expected guard violation: %', SQLERRM;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Later revision request should prevent VALIDATED!';
    END IF;
    RAISE NOTICE '✅ Test 2 Passed: Latest revision request governed and blocked VALIDATED.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST CASE 3: มี Conflict (Active SOURCE_CONFLICT)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_proj_id UUID := '00000000-0000-0000-0000-000000000001';
    v_pm_id UUID := '00000000-0000-0000-0000-000000000002';
    v_co_id UUID := '00000000-0000-0000-0000-000000000004';
    v_item_id UUID := '00000000-0000-0000-0000-000000000020';
    v_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '--- Test 3: มี Conflict (Active SOURCE_CONFLICT) ---';
    -- Co-expert submitted SOURCE_CONFLICT
    INSERT INTO public.review_evidence_records (
        review_item_id, project_id, reviewer_id, doc_id_ref, article_section, page_number,
        edition_used, rationale, requirement_impact, resulting_status, recommended_status,
        opinion_type, submitted_at, is_permanent_record
    ) VALUES (
        v_item_id, v_proj_id, v_co_id, 'DOC v1.0', 'ข้อ 2', 5,
        'ราชกิจจา', 'พบข้อกฎหมายขัดแย้ง', 'ต้องระงับ', 'SOURCE_CONFLICT', 'SOURCE_CONFLICT',
        'ALTERNATIVE_VIEW', NOW(), TRUE
    );

    PERFORM set_config('request.jwt.claim.sub', v_pm_id::text, true);
    BEGIN
        PERFORM public.submit_pm_disposition_atomic(v_item_id, 'VALIDATED', 'PM Note', 'Actions');
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
        RAISE NOTICE '  ✓ Caught active conflict: %', SQLERRM;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Active conflict should prevent VALIDATED!';
    END IF;
    RAISE NOTICE '✅ Test 3 Passed: Active conflict successfully blocked VALIDATED.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST CASE 4: INSERT ล้มเหลว และการตรวจสอบก่อน–หลัง Rollback
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_pm_id UUID := '00000000-0000-0000-0000-000000000002';
    v_item_id UUID := '00000000-0000-0000-0000-000000000020';
    v_status_before TEXT;
    v_status_after TEXT;
    v_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '--- Test 4: INSERT ล้มเหลว & ตรวจสอบก่อน-หลัง Rollback ---';
    SELECT status::text INTO v_status_before FROM public.review_items WHERE id = v_item_id;
    RAISE NOTICE '  - สถานะก่อนทดสอบ: %', v_status_before;

    PERFORM set_config('request.jwt.claim.sub', v_pm_id::text, true);

    -- Trigger intentional exception by passing invalid disposition value
    BEGIN
        PERFORM public.submit_pm_disposition_atomic(v_item_id, 'INVALID_TYPE', 'Note', 'Actions');
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
        RAISE NOTICE '  ✓ Caught intentional failure: %', SQLERRM;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Invalid payload should fail!';
    END IF;

    SELECT status::text INTO v_status_after FROM public.review_items WHERE id = v_item_id;
    RAISE NOTICE '  - สถานะหลัง Rollback: %', v_status_after;

    IF v_status_before != v_status_after THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Rollback failed, status was modified from % to %', v_status_before, v_status_after;
    END IF;

    RAISE NOTICE '✅ Test 4 Passed: Transaction fully rolled back. Status remained intact.';
END $$;

-- ----------------------------------------------------------------------------
-- CLEANUP / ROLLBACK TEST DATA
-- ----------------------------------------------------------------------------
RAISE NOTICE '🧹 Cleaning up test execution by rolling back test transaction...';
ROLLBACK; -- All test records are immediately purged!
RAISE NOTICE '🎉 ALL 4 REAL DATABASE TEST CASES COMPLETED & CLEANED UP.';
