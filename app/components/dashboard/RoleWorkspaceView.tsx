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
  | 'RESEARCH_WORKSPACE'
  | 'LEGAL_REVIEW_CENTER'
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
      name: 'PM / Control Tower',
      roleDesc: 'ศูนย์ควบคุมโครงการภาพรวม',
      badgeColor: 'bg-[#062B63] text-white shadow-xs',
    },
    {
      id: 'RESEARCH_WORKSPACE',
      name: 'Research Team',
      roleDesc: 'งานวิจัย & Focus Group',
      badgeColor: 'bg-indigo-600 text-white shadow-xs',
    },
    {
      id: 'LEGAL_REVIEW_CENTER',
      name: 'Legal Advisors',
      roleDesc: 'ศูนย์กลั่นกรองกฎหมาย (Batch 1)',
      badgeColor: 'bg-purple-600 text-white shadow-xs',
    },
    {
      id: 'HRD_KNOWLEDGE_WORKSPACE',
      name: 'HRD & Learning',
      roleDesc: 'Knowledge Matrix & สื่อ 15 คลิป',
      badgeColor: 'bg-emerald-600 text-white shadow-xs',
    },
    {
      id: 'STAKEHOLDER_PORTAL',
      name: 'Stakeholder / สกสว.',
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
                to="/reviews"
                className="px-4 py-2.5 bg-white text-[#062B63] hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition"
              >
                ศูนย์กลั่นกรอง (Batch 1)
              </Link>
              <Link
                to="/tor"
                className="px-4 py-2.5 bg-[#F36C21] hover:bg-[#D95813] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                ติดตาม TOR & Deliverables
              </Link>
            </div>
          </div>

          <GateProgressBar currentGate={data.currentGate} />
          <MetricCards data={data} />
          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 2. Research Team — Research Workspace */}
      {activeWorkspace === 'RESEARCH_WORKSPACE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-900 via-[#062B63] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                🔬 RESEARCH & QUALITATIVE WORKSPACE
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">Research Workspace — พื้นที่ทำงานนักวิจัย</h2>
              <p className="text-xs text-indigo-100 mt-1 max-w-2xl">
                รวบรวมข้อมูลภาคสนาม In-depth Interview / Focus Group, จัดทำร่าง Gap Analysis และรายงานข้อเสนอแนะ 3 ชุด
              </p>
            </div>
            <Link
              to="/traceability"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto"
            >
              เปิด Traceability Explorer
            </Link>
          </div>

          {/* Research Progress Cards (Light Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-indigo-600 uppercase mb-2">
                1. ร่างรายงาน Gap Analysis (ข้อ 4.3.2)
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">v0.9 (Draft)</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                เปรียบเทียบกฎหมายกับแนวปฏิบัติจริง (Actual Practice) อยู่ระหว่างส่งที่ปรึกษาตรวจทาน
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-indigo-600 uppercase mb-2">
                2. แผนการสัมภาษณ์ & Focus Group
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">2 กลุ่มเป้าหมาย</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                ระดับผู้บริหาร/บอร์ด กสว. และระดับปฏิบัติการ สกสว./PMU พร้อมชุดคำถามโครงสร้าง
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-indigo-600 uppercase mb-2">
                3. รายงานข้อเสนอแนะเชิงนโยบาย
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">3 ชุด / เล่ม</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                จัดทำรายงานตามขอบเขต TOR ส่งมอบใน Gate G4-G5
              </p>
            </div>
          </div>

          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 3. Legal Advisor — Review Center */}
      {activeWorkspace === 'LEGAL_REVIEW_CENTER' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-900 via-[#062B63] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                ⚖️ LEGAL ADVISORY & VALIDATION WORKSPACE
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-1.5">Review Center — ศูนย์กลั่นกรองและรับรองกฎหมาย</h2>
              <p className="text-xs text-purple-100 mt-1 max-w-2xl">
                ตรวจสอบลำดับศักดิ์กฎหมาย 3 ระดับ, ตีความอำนาจมาตรา 58, และตรวจความถูกต้องของคู่มือปฏิบัติงาน 2 ฉบับ
              </p>
            </div>
            <Link
              to="/reviews"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>เข้าสู่ Expert Review Center (Batch 1)</span>
            </Link>
          </div>

          {/* Legal Review Summary Cards in Light Theme */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-600" />
                สถานะการตรวจทาน Batch 1 รายบุคคล (Assigned Advisor Progress)
              </h3>
              <Link to="/reviews" className="text-xs text-[#1356A3] font-bold hover:underline flex items-center gap-1">
                เปิดระบบตรวจ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-bold text-slate-900">ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร</div>
                <div className="text-[11px] text-slate-500 mt-0.5">อำนาจหน้าที่บอร์ด & ม.58</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    ● VALIDATED
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-bold text-slate-900">นายกานต์กุญช์ บำรุงชาติ</div>
                <div className="text-[11px] text-slate-500 mt-0.5">ระเบียบกองทุน ววน. FF/SF</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-300">
                    ● SOURCE CONFLICT
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-bold text-slate-900">อ.นภวัฒน์ สืบนุสรณ์</div>
                <div className="text-[11px] text-slate-500 mt-0.5">ลำดับศักดิ์ พ.ร.บ. (ฉบับที่ 2) 2568</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                    ● EXPERT REQUIRED
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs font-bold text-slate-900">ผศ.ดร.กนกพร ศรีสุจริตพานิช</div>
                <div className="text-[11px] text-slate-500 mt-0.5">การเงินพัสดุ & ทรัพยากร</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-300">
                    ● NOT VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
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
