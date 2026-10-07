import { redirect, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { supabase } from "~/lib/supabase.client";
import { useAuth } from "~/lib/use-auth";
import { Loader2, Building2 } from "lucide-react";

export const clientLoader = async () => {
  if (typeof window !== "undefined") {
    // 1. Check local session
    const local = localStorage.getItem("tsri_auth_session");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed?.user?.email) {
          return redirect("/dashboard");
        }
      } catch (e) {}
    }
  }

  // 2. Check Supabase session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return redirect("/dashboard");
    }
  } catch (err) {
    console.warn("Session check fallback:", err);
  }

  // 3. Unauthenticated -> Go directly to Login
  return redirect("/login");
};

export default function IndexRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#062B63] flex items-center justify-center text-white shadow-lg shadow-[#062B63]/20">
          <Building2 className="w-7 h-7 text-orange-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#062B63] mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span>กำลังนำท่านเข้าสู่หน้าระบบ...</span>
        </div>
      </div>
    </div>
  );
}
