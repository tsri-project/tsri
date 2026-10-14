import { useState } from 'react';
import {
  ExecutiveDashboardData,
  Deliverable,
  DocumentItem,
  MeetingItem,
  DOCUMENT_STATUS_BADGES,
  WORK_STATUS_BADGES,
} from '~/types';
import { GateProgressBar } from './GateProgressBar';
import { MetricCards } from './MetricCards';
import { ActionMeetingsPanel } from './ActionMeetingsPanel';
import {
  Layers,
  FileCheck2,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  Scale,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  AlertTriangle,
  Download,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime, formatFileSize } from '~/lib/utils';
import { Link } from '@remix-run/react';

export type WorkspaceType =
  | 'PM_CONTROL_TOWER'
  | 'PROJECT_TASKS_PROGRESS'
  | 'RESEARCH_WORKSPACE'
  | 'HRD_KNOWLEDGE_WORKSPACE'
  | 'STAKEHOLDER_PORTAL';

interface RoleWorkspaceViewProps {
  data: ExecutiveDashboardData;
  activeWorkspace: WorkspaceType;
  onChangeWorkspace: (workspace: WorkspaceType) => void;
}

export function RoleWorkspaceView({
  data,
  activeWorkspace,
  onChangeWorkspace,
}: RoleWorkspaceViewProps) {
  const workspaces: { id: WorkspaceType; name: string; roleDesc: string; badgeColor: string }[] = [
    {
      id: 'PM_CONTROL_TOWER',
      name: 'ภาพรวม & สรุปโครงการ',
      roleDesc: 'ศูนย์ควบคุมโครงการภาพรวม',
      badgeColor: 'bg-[#062B63] text-white shadow-xs',
    },
    {
      id: 'PROJECT_TASKS_PROGRESS',
      name: 'สถานะงาน & ความคืบหน้า',
      roleDesc: 'ติดตาม WBS กิจกรรม และสถานะส่งมอบ',
      badgeColor: 'bg-emerald-600 text-white shadow-xs',
    },
    {
      id: 'RESEARCH_WORKSPACE',
      name: 'งานวิจัย & วิเคราะห์กฎหมาย',
      roleDesc: 'งานวิจัย & Focus Group',
      badgeColor: 'bg-indigo-600 text-white shadow-xs',
    },
    {
      id: 'HRD_KNOWLEDGE_WORKSPACE',
      name: 'KM & สื่อการเรียนรู้',
      roleDesc: 'Knowledge Matrix & สื่อ 15 คลิป',
      badgeColor: 'bg-purple-600 text-white shadow-xs',
    },
    {
      id: 'STAKEHOLDER_PORTAL',
      name: 'พอร์ทัลผู้บริหาร สกสว.',
      roleDesc: 'พอร์ทัลผู้บริหารและบอร์ด',
      badgeColor: 'bg-amber-600 text-white shadow-xs',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Role Workspace Switcher Bar in Light Theme */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#F36C21] flex items-center justify-center font-bold border border-orange-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              ONE LINK ROLE WORKSPACE
              <span className="text-[10px] px-2 py-0.2 bg-[#F36C21] text-white rounded-full font-mono font-bold">
                Auto-Detected
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              สลับมุมมองพื้นที่ทำงานตามบทบาทหน้าที่ (เข้าใช้งานจาก URL เดียวกัน)
            </div>
          </div>
        </div>

        {/* Workspace Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onChangeWorkspace(ws.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeWorkspace === ws.id
                  ? `${ws.badgeColor} ring-2 ring-[#062B63]/10`
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              <span>{ws.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. PM / Project Director — Control Tower */}
      {activeWorkspace === 'PM_CONTROL_TOWER' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-[#062B63] to-[#1356A3] p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#F36C21] uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                👑 PM & PROJECT DIRECTOR WORKSPACE
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">Control Tower — ศูนย์บัญชาการโครงการ</h2>
              <p className="text-xs text-blue-100 mt-1 max-w-2xl">
                กำกับทิศทางยุทธศาสตร์, ควบคุม TOR Coverage, บริหาร Cadence และประสานทีมที่ปรึกษาทุกกลุ่ม
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/tasks"
                className="px-4 py-2.5 bg-white text-[#062B63] hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>สถานะการทำงาน (Tasks)</span>
              </Link>
              <Link
                to="/documents"
                className="px-4 py-2.5 bg-[#F36C21] hover:bg-[#D95813] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>ศูนย์เอกสารโครงการ</span>
              </Link>
            </div>
          </div>

          <GateProgressBar currentGate={data.currentGate} />
          <MetricCards data={data} />
          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 2. Project Tasks & Progress Hub */}
      {activeWorkspace === 'PROJECT_TASKS_PROGRESS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-900 via-[#062B63] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                📊 WORKSTREAM & TASK EXECUTION HUB
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">สถานะการทำงานและความคืบหน้าโครงการ</h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                ติดตามกิจกรรม 5 สายงาน (WS01 - WS05), สถานะส่งมอบ Gate G1-G6 และความคืบหน้ารายสัปดาห์
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/tasks"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>ดูแผนงานทั้งหมด (Tasks)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Progress summary by Workstreams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-mono font-bold text-slate-500">WS01 บริหารโครงการ</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">100%</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Kick-off & Setup เสร็จสมบูรณ์</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-mono font-bold text-slate-500">WS02 วิเคราะห์กฎหมาย</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">85%</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">● จัดหมวด 46 ฉบับเรียบร้อย</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-mono font-bold text-slate-500">WS03 วิจัย & Gap</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">45%</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">● เตรียม Focus Group 2 กลุ่ม</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-mono font-bold text-slate-500">WS04 ข้อเสนอเชิงนโยบาย</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">20%</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">● ร่างกรอบข้อเสนอ 3 ชุด</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-[11px] font-mono font-bold text-slate-500">WS05 KM & การสื่อสาร</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">35%</div>
              <div className="text-[10px] text-purple-600 font-semibold mt-0.5">● สื่อวิดีโอ 15 ตอน & SOP</div>
            </div>
          </div>

          <GateProgressBar currentGate={data.currentGate} />
          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 4. HRD Team — Knowledge Workspace */}
      {activeWorkspace === 'HRD_KNOWLEDGE_WORKSPACE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-900 via-[#062B63] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                🎓 HRD & LEARNING ARCHITECTURE WORKSPACE
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">Knowledge Workspace — พื้นที่ออกแบบการเรียนรู้</h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                พัฒนา Knowledge Matrix, Learning Journey, วิดีโอ 15 ตอน, แบบทดสอบ 12 ชุด, อินโฟกราฟิก 8 ชิ้น และระบบ KM
              </p>
            </div>
            <Link
              to="/knowledge"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto"
            >
              คลังองค์ความรู้ & KM
            </Link>
          </div>

          {/* HRD Deliverable Highlights (Light Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <div className="text-xs text-emerald-700 font-bold mb-1">Knowledge Matrix</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">4 ระดับ</div>
              <div className="text-[11px] text-slate-500 mt-1">Board / ผู้บริหาร / ปฏิบัติการ</div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <div className="text-xs text-emerald-700 font-bold mb-1">ชุดสื่อวิดีโอ</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">15 คลิป</div>
              <div className="text-[11px] text-slate-500 mt-1">ความรู้ 6 ตอน + สั้น 9 ตอน</div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <div className="text-xs text-emerald-700 font-bold mb-1">แบบทดสอบ Scenario</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">12 ชุด</div>
              <div className="text-[11px] text-slate-500 mt-1">ประยุกต์ตามสถานการณ์จริง</div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <div className="text-xs text-emerald-700 font-bold mb-1">คู่มือปฏิบัติงาน SOP</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">2 เล่ม</div>
              <div className="text-[11px] text-slate-500 mt-1">คู่มือบอร์ด + คู่มือปฏิบัติงาน</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Stakeholder / สกสว. — Project Portal */}
      {activeWorkspace === 'STAKEHOLDER_PORTAL' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-900 via-[#062B63] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                🏛️ TSRI STAKEHOLDER & EXECUTIVE PORTAL
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">Project Portal — พอร์ทัลผู้บริหารและผู้มีส่วนได้ส่วนเสีย</h2>
              <p className="text-xs text-amber-100 mt-1 max-w-2xl">
                สรุปความก้าวหน้าโครงการภาพรวม ผลผลิตตาม TOR ที่ส่งมอบแล้ว และรายงานฉบับทางการสำหรับ สกสว.
              </p>
            </div>
            <Link
              to="/reports"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto"
            >
              ดาวน์โหลดรายงานทางการ
            </Link>
          </div>

          <GateProgressBar currentGate={data.currentGate} />
          <MetricCards data={data} />
        </div>
      )}
    </div>
  );
}
