import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';
import { useAuth } from '~/lib/use-auth';
import { Building2, Lock, Mail, ArrowRight, Shield, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { session, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user already has a valid session, redirect to returnTo or /dashboard
  useEffect(() => {
    if (!isAuthLoading && session) {
      navigate(returnTo, { replace: true });
    }
  }, [session, isAuthLoading, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);

    try {
      // Real Supabase Authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('บัญชีนี้ยังไม่ได้ยืนยันอีเมลในระบบ Supabase');
        } else {
          setError(`การเข้าสู่ระบบไม่สำเร็จ: ${authError.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        navigate(returnTo, { replace: true });
      } else {
        setError('ไม่สามารถสร้าง Session ได้ กรุณาลองใหม่อีกครั้ง');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ Supabase Auth');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#062B63] animate-spin" />
          <div className="text-xs font-semibold text-slate-500">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-800">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#062B63] flex items-center justify-center text-white shadow-lg shadow-[#062B63]/20">
            <Building2 className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            TSRI One Link for All
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            PM & Legal Research Control Center (สกสว.)
          </p>
        </div>

        {/* Security / System Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl mb-6 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#062B63] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#062B63]">ระบบความปลอดภัย Supabase Auth:</span>
            <div className="text-[11px] text-slate-600 mt-0.5">
              ระบบตรวจสอบตัวตนจริงผ่านฐานข้อมูล Supabase ด้วยนโยบายความปลอดภัย RLS
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-xs font-semibold text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dencapvision@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] focus:ring-2 focus:ring-[#062B63]/10 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] focus:ring-2 focus:ring-[#062B63]/10 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-[#062B63] hover:bg-[#1356A3] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>กำลังเข้าสู่ระบบผ่าน Supabase...</span>
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ Control Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-orange-400" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
          One Project • One Link • One Source of Truth
        </div>
      </div>
    </div>
  );
}
