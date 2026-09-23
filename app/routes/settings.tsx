import { AppLayout } from '~/components/shell/AppLayout';
import { Settings, Shield, Key, Bell, Database, Cloud, CheckCircle2, Server } from 'lucide-react';
import { mockCurrentUser, mockProject } from '~/lib/mock-data';

export default function SettingsRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
              SYSTEM SETTINGS & SUPER ADMIN CONTROL
            </span>
            <span className="text-xs font-semibold text-slate-500">
              การกำหนดค่าและสถานะระบบความปลอดภัย
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            ตั้งค่าระบบและสภาพแวดล้อมโครงการ
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            จัดการการเชื่อมต่อ Supabase Database, Cloudflare R2 Vault (`tsri-documents-vault`), และสิทธิ์การเข้าถึงระบบ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Baseline Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#062B63]" />
              ข้อมูลโครงการหลัก (Project Information)
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">รหัสโครงการ: </span>
                <span className="font-mono font-bold text-[#062B63]">{mockProject.code}</span>
              </div>
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ชื่อโครงการ: </span>
                <span className="text-slate-900 font-medium block mt-0.5">{mockProject.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">สถานะ Gate ปัจจุบัน: </span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {mockProject.current_gate} (Source Verification)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">หน่วยงานเจ้าของโครงการ: </span>
                <span className="text-slate-800 font-semibold">{mockProject.organization}</span>
              </div>
            </div>
          </div>

          {/* Super Admin Status Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              บัญชีผู้ดูแลระบบสูงสุด (Super Admin Control)
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ผู้ดูแล: </span>
                <span className="text-slate-900 font-bold">{mockCurrentUser.full_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">อีเมล: </span>
                <span className="font-mono text-slate-700 font-semibold">{mockCurrentUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">สิทธิ์ระบบ: </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold border border-emerald-200">
                  Super Admin (project_admin)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">R2 Storage Vault: </span>
                <span className="font-mono text-blue-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> tsri-documents-vault (46 Files)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
