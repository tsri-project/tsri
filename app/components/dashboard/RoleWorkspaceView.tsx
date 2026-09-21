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
      name: 'PM / Project Director',
      roleDesc: 'Control Tower (ศูนย์ควบคุมโครงการ)',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'RESEARCH_WORKSPACE',
      name: 'Research Team',
      roleDesc: 'Research Workspace (งานวิจัย & ภาคสนาม)',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'LEGAL_REVIEW_CENTER',
      name: 'Legal Advisor',
      roleDesc: 'Review Center (ตรวจรับรองกฎหมาย)',
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'HRD_KNOWLEDGE_WORKSPACE',
      name: 'HRD Team',
      roleDesc: 'Knowledge Workspace (การเรียนรู้ & สื่อ)',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'STAKEHOLDER_PORTAL',
      name: 'Stakeholder / สกสว.',
      roleDesc: 'Project Portal (พอร์ทัลผู้บริหาร)',
      badgeColor: 'bg-amber-600 text-white',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Role Workspace Switcher Bar */}
      <div className="bg-gradient-to-r from-[#062b63] via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-[#1356a3]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f36c21]/20 text-[#f36c21] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              ONE LINK ROLE WORKSPACE
              <span className="text-[10px] px-2 py-0.2 bg-[#f36c21] text-white rounded font-mono font-bold">
                Auto-Detected
              </span>
            </div>
            <div className="text-[11px] text-blue-300">
              มุมมองพื้นที่ทำงานตามบทบาทหน้าที่ (เข้าใช้งานจาก URL เดียวกัน)
            </div>
          </div>
        </div>

        {/* Workspace Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onChangeWorkspace(ws.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeWorkspace === ws.id
                  ? `${ws.badgeColor} shadow-lg ring-2 ring-white/20`
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
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
          <div className="bg-gradient-to-r from-[#062b63] to-[#1356a3] p-5 rounded-2xl border border-white/10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-[#f36c21] uppercase tracking-wider">
                👑 PM & PROJECT DIRECTOR WORKSPACE
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Control Tower — ศูนย์บัญชาการโครงการ</h2>
              <p className="text-xs text-blue-100 mt-1">
                กำกับทิศทางยุทธศาสตร์, บริหาร Cadence, ควบคุม TOR Coverage และบริหารความเสี่ยงระดับสูง
              </p>
            </div>
            <Link
              to="/tor"
              className="px-4 py-2 bg-[#f36c21] hover:bg-[#d95813] text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
            >
              ติดตาม TOR & Deliverables
            </Link>
          </div>

          <GateProgressBar currentGate={data.currentGate} />
          <MetricCards data={data} />
          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 2. Research Team — Research Workspace */}
      {activeWorkspace === 'RESEARCH_WORKSPACE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-900/60 via-[#062b63] to-slate-950 p-5 rounded-2xl border border-indigo-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                🔬 RESEARCH & QUALITATIVE WORKSPACE
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Research Workspace — พื้นที่ทำงานนักวิจัย</h2>
              <p className="text-xs text-slate-300 mt-1">
                รวบรวมข้อมูลภาคสนาม In-depth Interview / Focus Group, จัดทำร่าง Gap Analysis และรายงานข้อเสนอแนะ 3 ชุด
              </p>
            </div>
            <Link
              to="/traceability"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
            >
              เปิด Traceability Explorer
            </Link>
          </div>

          {/* Research Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-2">
                1. ร่างรายงาน Gap Analysis (ข้อ 4.3.2)
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">v0.9 (Draft)</div>
              <p className="text-xs text-slate-400 mt-2">
                เปรียบเทียบกฎหมายกับแนวปฏิบัติจริง (Actual Practice) อยู่ระหว่างส่งที่ปรึกษาตรวจทาน
              </p>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-2">
                2. แผนการสัมภาษณ์ & Focus Group
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">2 กลุ่มเป้าหมาย</div>
              <p className="text-xs text-slate-400 mt-2">
                ระดับผู้บริหาร/บอร์ด และระดับปฏิบัติการ พร้อมชุดคำถามโครงสร้าง
              </p>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-2">
                3. รายงานข้อเสนอแนะเชิงนโยบาย
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">3 ชุด / เล่ม</div>
              <p className="text-xs text-slate-400 mt-2">
                จัดทำรายงานตามขอบเขต TOR ส่งมอบใน Gate G4-G5
              </p>
            </div>
          </div>

          {/* Action Meetings Panel */}
          <ActionMeetingsPanel data={data} />
        </div>
      )}

      {/* 3. Legal Advisor — Review Center */}
      {activeWorkspace === 'LEGAL_REVIEW_CENTER' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-900/60 via-[#062b63] to-slate-950 p-5 rounded-2xl border border-purple-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                ⚖️ LEGAL ADVISORY & VALIDATION WORKSPACE
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Review Center — ศูนย์กลั่นกรองและรับรองกฎหมาย</h2>
              <p className="text-xs text-slate-300 mt-1">
                ตรวจสอบลำดับศักดิ์กฎหมาย 3 ระดับ, ตีความอำนาจมาตรา 58, และตรวจความถูกต้องของคู่มือปฏิบัติงาน 2 ฉบับ
              </p>
            </div>
            <Link
              to="/reviews"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
            >
              รายการรอตรวจทาน ({data.pendingReviewsCount})
            </Link>
          </div>

          {/* Legal Review Queue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              รายการเอกสารและร่างผลงานที่รอการ Review & Validation
            </h3>
            <div className="space-y-3">
              {data.recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                        {doc.document_code}
                      </span>
                      <span className="text-xs text-slate-400">{doc.category}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{doc.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      เวอร์ชันล่าสุด: v{doc.latest_version_number} • {formatThaiDate(doc.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition shadow">
                      บันทึกผลการตรวจรับรอง
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. HRD Team — Knowledge Workspace */}
      {activeWorkspace === 'HRD_KNOWLEDGE_WORKSPACE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-900/60 via-[#062b63] to-slate-950 p-5 rounded-2xl border border-emerald-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                🎓 HRD & LEARNING ARCHITECTURE WORKSPACE
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Knowledge Workspace — พื้นที่ออกแบบการเรียนรู้</h2>
              <p className="text-xs text-slate-300 mt-1">
                พัฒนา Knowledge Matrix, Learning Journey, วิดีโอ 15 คลิป, แบบทดสอบ 12 ชุด, อินโฟกราฟิก 8 ชิ้น และระบบ KM
              </p>
            </div>
            <Link
              to="/knowledge"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
            >
              คลังองค์ความรู้ & KM
            </Link>
          </div>

          {/* HRD Deliverable Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-emerald-300 font-bold mb-1">Knowledge Matrix</div>
              <div className="text-2xl font-extrabold text-white font-mono">4 ระดับ</div>
              <div className="text-[11px] text-slate-400 mt-1">Board / ผู้บริหาร / ปฏิบัติการ</div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-emerald-300 font-bold mb-1">ชุดสื่อวิดีโอ</div>
              <div className="text-2xl font-extrabold text-white font-mono">15 คลิป</div>
              <div className="text-[11px] text-slate-400 mt-1">ความรู้ 6 คลิป + สั้น 9 คลิป</div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-emerald-300 font-bold mb-1">แบบทดสอบ Scenario</div>
              <div className="text-2xl font-extrabold text-white font-mono">12 ชุด</div>
              <div className="text-[11px] text-slate-400 mt-1">ประยุกต์ตามสถานการณ์จริง</div>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center">
              <div className="text-xs text-emerald-300 font-bold mb-1">คู่มือปฏิบัติงาน SOP</div>
              <div className="text-2xl font-extrabold text-white font-mono">2 เล่ม</div>
              <div className="text-[11px] text-slate-400 mt-1">คู่มือบอร์ด + คู่มือผู้ปฏิบัติงาน</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Stakeholder / สกสว. — Project Portal */}
      {activeWorkspace === 'STAKEHOLDER_PORTAL' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-900/60 via-[#062b63] to-slate-950 p-5 rounded-2xl border border-amber-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                🏛️ TSRI STAKEHOLDER & EXECUTIVE PORTAL
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Project Portal — พอร์ทัลผู้บริหารและผู้มีส่วนได้ส่วนเสีย</h2>
              <p className="text-xs text-slate-300 mt-1">
                สรุปความก้าวหน้าโครงการภาพรวม ผลผลิตตาม TOR ที่ส่งมอบแล้ว และรายงานฉบับทางการสำหรับ สกสว.
              </p>
            </div>
            <Link
              to="/reports"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
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
