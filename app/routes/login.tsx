import { useState } from 'react';
import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { Form, useActionData, useNavigate, Link } from '@remix-run/react';
import { Building2, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const loader: LoaderFunction = async () => {
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
  }

  // Super Admin Validation
  if (email === 'dencapvision@gmail.com' && password === 'den2235919') {
    return redirect('/dashboard');
  }

  // Demo fallback
  if (password.length >= 6) {
    return redirect('/dashboard');
  }

  return json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
};

export default function LoginRoute() {
  const actionData = useActionData<{ error?: string }>();
  const [email, setEmail] = useState('dencapvision@gmail.com');
  const [password, setPassword] = useState('den2235919');

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            TSRI One Link for All
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            PM & Legal Research Control Center (สกสว.)
          </p>
        </div>

        {/* Super Admin Preset Banner */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-blue-300">Super Admin Account:</span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              นายอนุสรณ์ หนองนา (เด่น) — PM & Learning Lead
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {actionData?.error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-4 text-xs text-rose-400 text-center">
            {actionData.error}
          </div>
        )}

        {/* Login Form */}
        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dencapvision@gmail.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 group"
          >
            <span>เข้าสู่ระบบ Control Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          One Project • One Link • One Source of Truth
        </div>
      </div>
    </div>
  );
}
