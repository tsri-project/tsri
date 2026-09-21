import { AppLayout } from '~/components/shell/AppLayout';
import { Settings, Shield, Key, Bell, Database, Cloud } from 'lucide-react';
import { mockCurrentUser, mockProject } from '~/lib/mock-data';

export default function SettingsRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-blue-400 font-mono">
            SYSTEM SETTINGS & SUPER ADMIN CONTROL
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            ตั้งค่าระบบและสภาพแวดล้อมโครงการ
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            จัดการการเชื่อมต่อ Supabase, Cloudflare R2, LINE OA และการตั้งค่าความปลอดภัย
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Baseline Card */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              ข้อมูลโครงการหลัก (Project Information)
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">รหัสโครงการ: </span>
                <span className="font-mono font-bold text-blue-300">{mockProject.code}</span>
              </div>
              <div>
                <span className="text-slate-400">ชื่อโครงการ: </span>
                <span className="text-white font-medium">{mockProject.title}</span>
              </div>
              <div>
                <span className="text-slate-400">สถานะ Gate ปัจจุบัน: </span>
                <span className="font-mono text-emerald-400 font-bold">{mockProject.current_gate}</span>
              </div>
            </div>
          </div>

          {/* Super Admin Status Card */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              บัญชีผู้ดูแลระบบ (Super Admin)
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">ผู้ดูแล: </span>
                <span className="text-white font-semibold">{mockCurrentUser.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400">อีเมล: </span>
                <span className="font-mono text-blue-300">{mockCurrentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400">สิทธิ์: </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                  Super Admin (project_admin)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
