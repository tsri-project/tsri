import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';
import { useAuth, UserRole } from '~/lib/use-auth';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertCircle,
  Loader2,
  UserPlus,
  CheckCircle2,
  User,
  Briefcase,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '~/lib/utils';

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { session, isLoading: isAuthLoading } = useAuth();

  const [activeMode, setActiveMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrg, setRegOrg] = useState('สกสว.');
  const [regRole, setRegRole] = useState<UserRole>('legal_advisor');
  const [regReason, setRegReason] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user already has a valid session, redirect to returnTo or /dashboard
  useEffect(() => {
    if (!isAuthLoading && session) {
      navigate(returnTo, { replace: true });
    }
  }, [session, isAuthLoading, navigate, returnTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = regEmail.trim();
    if (!trimmedEmail || !regPassword || !regFullName.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (regPassword.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            organization: regOrg.trim(),
            requested_role: regRole,
          },
        },
      });

      if (authErr) {
        setError(`การสมัครสมาชิกล้มเหลว: ${authErr.message}`);
        setIsSubmitting(false);
        return;
      }

      const userId = authData.user?.id;

      // 2. Upsert profile
      if (userId) {
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email: trimmedEmail,
            full_name: regFullName.trim(),
            organization: regOrg.trim() || 'สกสว.',
          });

          // 3. Create user access request if table exists
          await supabase.from('user_access_requests').insert({
            user_id: userId,
            email: trimmedEmail,
            full_name: regFullName.trim(),
            organization: regOrg.trim() || 'สกสว.',
            requested_role: regRole,
            reason: regReason.trim() || 'ขอเข้าร่วมปฏิบัติงานในโครงการ TSRI',
            status: 'PENDING',
          });
        } catch (dbErr) {
          console.warn('Non-blocking access request insertion notice:', dbErr);
        }
      }

      setSuccessMessage(
        'ส่งคำขอเข้าใช้งานเรียบร้อยแล้ว! บัญชีของคุณอยู่ในสถานะรอการอนุมัติสิทธิ์โดย PM Admin (ครูเด่น)'
      );
      setActiveMode('LOGIN');
      setEmail(trimmedEmail);
      setPassword('');
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#062B63] animate-spin" />
          <div className="text-xs font-semibold text-slate-500">
            กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-800">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-5">
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

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveMode('LOGIN');
              setError('');
            }}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer',
              activeMode === 'LOGIN'
                ? 'bg-white text-[#062B63] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('REGISTER');
              setError('');
            }}
            className={cn(
              'flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1',
              activeMode === 'REGISTER'
                ? 'bg-white text-[#062B63] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <UserPlus className="w-3.5 h-3.5 text-orange-500" />
            ขอสิทธิ์ใช้งานทีมงาน
          </button>
        </div>

        {/* Security / System Notice */}
        <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl mb-5 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#062B63] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#062B63]">
              {activeMode === 'LOGIN' ? 'ระบบความปลอดภัย Supabase Auth:' : 'การอนุมัติสิทธิ์เข้าใช้งาน:'}
            </span>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {activeMode === 'LOGIN'
                ? 'ตรวจสอบตัวตนจริงผ่านฐานข้อมูล Supabase ด้วยนโยบายความปลอดภัย RLS'
                : 'สมาชิกใหม่จะต้องได้รับการอนุมัติบทบาทโดย PM Admin (ครูเด่น) ก่อนเริ่มใช้งาน'}
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-xs font-semibold text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-xs font-semibold text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {activeMode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
        )}

        {/* MODE: REGISTER / REQUEST ACCESS */}
        {activeMode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="เช่น ดร.สมชาย ใจดี หรือ นายวิจัย ววน."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อีเมลประจำตัว <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your.email@organization.or.th"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="รหัสผ่านของคุณ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หน่วยงาน / สังกัด
                </label>
                <input
                  type="text"
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="สกสว., มธ., จุฬาฯ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บทบาทที่ขอเข้าใช้งาน
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#062B63]"
                >
                  <option value="legal_advisor">ที่ปรึกษากฎหมาย (Legal Advisor)</option>
                  <option value="researcher">ทีมวิจัย (Researcher)</option>
                  <option value="hrd">ทีม HRD & การเรียนรู้</option>
                  <option value="stakeholder">Stakeholder / บพท.</option>
                  <option value="viewer">ผู้สังเกตการณ์ (Viewer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รายละเอียดงาน / ความรับผิดชอบในโครงการ
              </label>
              <textarea
                rows={2}
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                placeholder="ระบุภารกิจหรือผลผลิตที่รับผิดชอบตาม TOR..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#062B63]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-[#F36C21] hover:bg-[#D95B14] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>กำลังส่งคำขอเข้าใช้งาน...</span>
                </>
              ) : (
                <>
                  <span>ส่งคำขอเข้าใช้งานโครงการ</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-white" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
          One Project • One Link • One Source of Truth
        </div>
      </div>
    </div>
  );
}
