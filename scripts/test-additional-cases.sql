-- ============================================================================
-- TSRI Control Center — Test Script for 2 Additional PM Disposition Cases
-- (1) Happy Path Approval & (2) Post-Update Rollback
-- WARNING: NEVER RUN ON PRODUCTION DATABASE. USE ONLY ON DEDICATED TEST DB.
-- ============================================================================

\set ON_ERROR_STOP on

-- 1. Helper Trigger to simulate evidence INSERT failure AFTER review_items UPDATE succeeds
CREATE OR REPLACE FUNCTION public._test_simulate_evidence_insert_failure()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rationale LIKE '%[PM Disposition:%' AND current_setting('test.simulate_insert_failure', true) = 'on' THEN
        RAISE EXCEPTION 'SIMULATED_TRIGGER_ERROR: INSERT into review_evidence_records failed after UPDATE review_items';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS _trg_test_simulate_insert_failure ON public.review_evidence_records;
CREATE TRIGGER _trg_test_simulate_insert_failure
    BEFORE INSERT ON public.review_evidence_records
    FOR EACH ROW EXECUTE PROCEDURE public._test_simulate_evidence_insert_failure();

-- 2. Run Test Cases
DO $$
DECLARE
    v_proj_id UUID := '11111111-1111-1111-1111-111111111111';
    v_pm_id UUID := '22222222-2222-2222-2222-222222222222';
    v_lead_expert_id UUID := '33333333-3333-3333-3333-333333333333';
    v_item_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_batch_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_res JSONB;
    v_status verification_status;
    v_disposition pm_disposition_type;
    v_note TEXT;
    v_evd_count INT;
    v_status_before verification_status;
    v_disposition_before pm_disposition_type;
    v_count_before INT;
    v_status_after verification_status;
    v_disposition_after pm_disposition_type;
    v_count_after INT;
    v_caught BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '======================================================================';
    RAISE NOTICE '🚀 เริ่มต้นรันการทดสอบ 2 กรณีพิเศษ (Positive Case & Post-Update Rollback)';
    RAISE NOTICE '======================================================================';

    -- Mock Auth Users & Profiles
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES 
        (v_pm_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pm_test@tsri.or.th', 'encrypted', NOW(), '{"provider":"email"}', '{"full_name":"PM Tester"}', NOW(), NOW()),
        (v_lead_expert_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lead_test@tsri.or.th', 'encrypted', NOW(), '{"provider":"email"}', '{"full_name":"Lead Expert"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, email, full_name, organization)
    VALUES 
        (v_pm_id, 'pm_test@tsri.or.th', 'PM Tester', 'สกสว.'),
        (v_lead_expert_id, 'lead_test@tsri.or.th', 'Lead Expert Tester', 'ผู้เชี่ยวชาญ')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.projects (id, code, title, start_date, end_date)
    VALUES (v_proj_id, 'TEST-PROJ-001', 'Test Project', CURRENT_DATE, CURRENT_DATE + 30)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES 
        (v_proj_id, v_pm_id, 'pm'),
        (v_proj_id, v_lead_expert_id, 'legal_advisor')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    INSERT INTO public.review_batches (id, project_id, batch_number, title)
    VALUES (v_batch_id, v_proj_id, 'BATCH-TEST-01', 'Test Batch')
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================================
    -- กรณีที่ (1): PM ที่มีสิทธิ์ และ Lead เห็นชอบ บันทึกสำเร็จ (Happy Path)
    -- =========================================================================
    RAISE NOTICE '--- [กรณี 1] ทดสอบ PM อนุมัติสำเร็จเมื่อ Lead Expert เห็นชอบ ---';
    
    INSERT INTO public.review_items (
        id, batch_id, project_id, item_code, vi_code, title, issue_description, status, pm_disposition,
        assigned_expert_id, assigned_expert_status
    ) VALUES (
        v_item_id, v_batch_id, v_proj_id, 'VI-TEST-01', 'VI-TEST-01', 'Test Item 1', 'Desc',
        'EXPERT_VALIDATION_REQUIRED', 'PENDING_REVIEW',
        v_lead_expert_id, 'ASSIGNED'
    ) ON CONFLICT (id) DO UPDATE SET
        status = 'EXPERT_VALIDATION_REQUIRED',
        pm_disposition = 'PENDING_REVIEW',
        assigned_expert_id = v_lead_expert_id;

    -- Lead Expert ส่งผลเห็นชอบ (VALIDATED)
    INSERT INTO public.review_evidence_records (
        id, review_item_id, project_id, reviewer_id, opinion_type,
        doc_id_ref, doc_code_ref, vi_code,
        article_section, page_number, edition_used, rationale, requirement_impact,
        recommended_status, resulting_status, is_permanent_record,
        submitted_at, created_at
    ) VALUES (
        gen_random_uuid(), v_item_id, v_proj_id, v_lead_expert_id, 'LEAD_FINDING',
        'LAW-001 v1.0', 'LAW-001', 'VI-TEST-01',
        'ข้อ 5', 12, 'ฉบับราชกิจจานุเบกษา', 'ตรวจครบถ้วน เห็นชอบตามข้อเสนอ', 'สอดคล้องกับ TOR',
        'VALIDATED', 'VALIDATED', TRUE,
        NOW(), NOW()
    );

    SELECT status, pm_disposition INTO v_status, v_disposition FROM public.review_items WHERE id = v_item_id;
    SELECT count(*) INTO v_evd_count FROM public.review_evidence_records WHERE review_item_id = v_item_id;
    RAISE NOTICE '  - ข้อมูลก่อนอนุมัติ: Status = %, PM Disposition = %, Evidence Count = %', v_status, v_disposition, v_evd_count;

    PERFORM set_config('request.jwt.claim.sub', v_pm_id::text, true);
    PERFORM set_config('test.simulate_insert_failure', 'off', true);

    v_res := public.submit_pm_disposition_atomic(
        v_item_id, 'VALIDATED', 'PM เห็นชอบตามมติที่ประชุม มอบหมายบรรจุลง Inception Report', 'จัดพิมพ์เอกสารแนบ'
    );

    SELECT status, pm_disposition, pm_disposition_note INTO v_status, v_disposition, v_note FROM public.review_items WHERE id = v_item_id;
    SELECT count(*) INTO v_evd_count FROM public.review_evidence_records WHERE review_item_id = v_item_id;
    RAISE NOTICE '  - ข้อมูลหลังอนุมัติ: Status = %, PM Disposition = %, Evidence Count = %', v_status, v_disposition, v_evd_count;
    RAISE NOTICE '  - มติที่บันทึก: %', v_note;

    IF v_status = 'VALIDATED' AND v_disposition = 'VALIDATED' AND v_evd_count = 2 AND (v_res->>'success')::boolean = true AND v_res->>'evidence_record_id' IS NOT NULL THEN
        RAISE NOTICE '✅ กรณีที่ 1 PASS: PM อนุมัติสำเร็จ สถานะและระเบียน Evidence ถูกบันทึกครบถ้วนสมบูรณ์ (RPC success = true, evidence_record_id = %)', v_res->>'evidence_record_id';
    ELSE
        RAISE EXCEPTION 'กรณีที่ 1 FAILED: Expected VALIDATED status and new evidence record';
    END IF;

    -- =========================================================================
    -- กรณีที่ (2): บังคับให้ INSERT evidence ล้มเหลว "หลัง UPDATE สำเร็จ" (Rollback Test)
    -- =========================================================================
    RAISE NOTICE '--- [กรณี 2] ทดสอบ Rollback เมื่อ INSERT Evidence ล้มเหลวหลัง UPDATE สำเร็จ ---';

    UPDATE public.review_items 
    SET status = 'EXPERT_VALIDATION_REQUIRED', pm_disposition = 'PENDING_REVIEW', pm_disposition_note = NULL
    WHERE id = v_item_id;

    SELECT status, pm_disposition INTO v_status_before, v_disposition_before FROM public.review_items WHERE id = v_item_id;
    SELECT count(*) INTO v_count_before FROM public.review_evidence_records WHERE review_item_id = v_item_id;
    RAISE NOTICE '  - ค่าก่อนเกิด Error: Status = %, Disposition = %, Evidence Count = %', 
        v_status_before, v_disposition_before, v_count_before;

    PERFORM set_config('test.simulate_insert_failure', 'on', true);

    BEGIN
        v_res := public.submit_pm_disposition_atomic(
            v_item_id, 'VALIDATED', 'PM Note that will fail on evidence insert', 'Action Items'
        );
        RAISE EXCEPTION 'กรณีที่ 2 FAILED: Expected simulated trigger error, but RPC succeeded';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%SIMULATED_TRIGGER_ERROR%' THEN
            v_caught := TRUE;
            RAISE NOTICE '  ✓ ดักจับข้อผิดพลาดการ INSERT Evidence ตามที่จำลอง: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'กรณีที่ 2 FAILED: Unexpected error caught: % %', SQLSTATE, SQLERRM;
        END IF;
    END;

    PERFORM set_config('test.simulate_insert_failure', 'off', true);

    SELECT status, pm_disposition INTO v_status_after, v_disposition_after FROM public.review_items WHERE id = v_item_id;
    SELECT count(*) INTO v_count_after FROM public.review_evidence_records WHERE review_item_id = v_item_id;
    RAISE NOTICE '  - ค่าหลัง Rollback: Status = % (ต้องเป็น %), Disposition = % (ต้องเป็น %), Evidence Count = % (ต้องเป็น %)',
        v_status_after, v_status_before, v_disposition_after, v_disposition_before, v_count_after, v_count_before;

    IF v_status_before = v_status_after 
       AND v_disposition_before = v_disposition_after 
       AND v_count_before = v_count_after THEN
        RAISE NOTICE '✅ กรณีที่ 2 PASS: การ Rollback สมบูรณ์ 100%% การ UPDATE review_items ถูกยกเลิกกลับสู่สถานะเดิมทั้งหมด';
    ELSE
        RAISE EXCEPTION 'กรณีที่ 2 FAILED: Rollback failed, data was partially updated!';
    END IF;

    RAISE NOTICE '======================================================================';
    RAISE NOTICE '🎉 ผ่านการทดสอบเพิ่มเติมทั้ง 2 กรณีอย่างถูกต้องสมบูรณ์ (100%% Atomicity)';
    RAISE NOTICE '======================================================================';

    RAISE EXCEPTION 'ROLLBACK_CLEANUP_SIGNAL';
EXCEPTION 
    WHEN OTHERS THEN
        IF SQLERRM = 'ROLLBACK_CLEANUP_SIGNAL' THEN
            RAISE NOTICE '🧹 ล้างข้อมูลทดสอบทั้งหมดออกจากฐานข้อมูลเรียบร้อยแล้ว (Clean State)';
        ELSE
            RAISE;
        END IF;
END $$;

-- 3. ลบ Trigger Helper ชั่วคราวออก
DROP TRIGGER IF EXISTS _trg_test_simulate_insert_failure ON public.review_evidence_records;
DROP FUNCTION IF EXISTS public._test_simulate_evidence_insert_failure();
