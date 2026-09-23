-- TSRI One Link for All — PM & Legal Research Control Center
-- Migration: 20260923000006_fix_pm_helper_function.sql
-- Purpose: Create is_pm_or_admin helper function to resolve trigger dependency

CREATE OR REPLACE FUNCTION public.is_pm_or_admin(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(public.get_project_role(p_id) IN ('project_admin', 'pm'), FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
