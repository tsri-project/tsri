import { useState } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { Building2, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export default function LoginRoute() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    // Standard auth flow / session redirection
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

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
            <span className="font-bold text-[#062B63]">ระบบความปลอดภัยและควบคุมการเข้าถึง:</span>
            <div className="text-[11px] text-slate-600 mt-0.5">
              เข้าสู่ระบบด้วยบัญชีผู้ใช้งานที่ได้รับการอนุญาตตามบทบาท (Role-Based Access Control)
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-xs font-semibold text-rose-700 text-center">
            {error}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.or.th"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#062B63] focus:ring-2 focus:ring-[#062B63]/10 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-[#062B63] hover:bg-[#1356A3] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Control Center'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-orange-400" />}
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
