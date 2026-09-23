-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260924000007_user_registration_and_pm_admin.sql
-- Purpose:
--   1. Create user_access_requests table for tracking team member signups and approvals
--   2. Establish RLS policies so PM/Admins can view and manage requests
--   3. Create RPC functions approve_user_access_request and reject_user_access_request
--   4. Update project_members RLS so both 'project_admin' and 'pm' can manage members

--------------------------------------------------------------------------------
-- 1. USER ACCESS REQUESTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    organization TEXT,
    requested_role user_role DEFAULT 'viewer',
    reason TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_access_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create their own access request" ON public.user_access_requests;
DROP POLICY IF EXISTS "Users can view own access request" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins and PMs can view all access requests" ON public.user_access_requests;
DROP POLICY IF EXISTS "Admins and PMs can update access requests" ON public.user_access_requests;

-- Authenticated users can insert their own request
CREATE POLICY "Users can create their own access request"
ON public.user_access_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view their own request
CREATE POLICY "Users can view own access request"
ON public.user_access_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins and PMs can view all requests
CREATE POLICY "Admins and PMs can view all access requests"
ON public.user_access_requests FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE user_id = auth.uid() AND role IN ('project_admin', 'pm')
    )
);

-- Admins and PMs can update access requests
CREATE POLICY "Admins and PMs can update access requests"
ON public.user_access_requests FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE user_id = auth.uid() AND role IN ('project_admin', 'pm')
    )
);

-- Allow Admins and PMs to manage project_members
DROP POLICY IF EXISTS "Admins can manage project members" ON public.project_members;
CREATE POLICY "Admins and PMs can manage project members"
ON public.project_members FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members pm_check
        WHERE pm_check.project_id = project_members.project_id 
          AND pm_check.user_id = auth.uid() 
          AND pm_check.role IN ('project_admin', 'pm')
    )
);

--------------------------------------------------------------------------------
-- 2. RPC FUNCTIONS: APPROVE & REJECT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.approve_user_access_request(
    p_request_id UUID,
    p_assigned_role user_role
)
RETURNS JSONB AS $$
DECLARE
    v_request RECORD;
    v_project_id UUID;
    v_caller_role user_role;
BEGIN
    -- Get default project ID
    SELECT id INTO v_project_id FROM public.projects LIMIT 1;
    
    -- Check caller role
    SELECT role INTO v_caller_role 
    FROM public.project_members 
    WHERE project_id = v_project_id AND user_id = auth.uid();
    
    IF v_caller_role NOT IN ('project_admin', 'pm') THEN
        RAISE EXCEPTION 'Unauthorized: Only PM or Project Admin can approve member requests';
    END IF;

    -- Fetch request
    SELECT * INTO v_request FROM public.user_access_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access request not found';
    END IF;

    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, full_name, organization)
    VALUES (v_request.user_id, v_request.email, v_request.full_name, COALESCE(v_request.organization, 'สกสว.'))
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        organization = EXCLUDED.organization;

    -- Insert or update project_members
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_request.user_id, p_assigned_role)
    ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = EXCLUDED.role;

    -- Update request status
    UPDATE public.user_access_requests
    SET status = 'APPROVED',
        requested_role = p_assigned_role,
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true, 'user_id', v_request.user_id, 'role', p_assigned_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_user_access_request(
    p_request_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_project_id UUID;
    v_caller_role user_role;
BEGIN
    -- Get default project ID
    SELECT id INTO v_project_id FROM public.projects LIMIT 1;
    
    -- Check caller role
    SELECT role INTO v_caller_role 
    FROM public.project_members 
    WHERE project_id = v_project_id AND user_id = auth.uid();
    
    IF v_caller_role NOT IN ('project_admin', 'pm') THEN
        RAISE EXCEPTION 'Unauthorized: Only PM or Project Admin can reject member requests';
    END IF;

    -- Update request status
    UPDATE public.user_access_requests
    SET status = 'REJECTED',
        reason = COALESCE(p_reason, reason),
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
