import { useState } from 'react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockTeamMembers } from '~/lib/mock-data';
import { TeamMemberDetails } from '~/types';
import {
  Users2,
  Shield,
  Briefcase,
  Target,
  FileCheck2,
  HelpCircle,
  Building,
  Mail,
  CheckCircle2,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { cn } from '~/lib/utils';

export default function TeamRoute() {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', name: 'สมาชิกทั้งหมด (All 3 Teams)' },
    { id: 'CORE_PM', name: '1. ทีมบริหารโครงการ (Core PM Team)' },
    { id: 'ADVISORY_LEGAL', name: '2.1 ที่ปรึกษากฎหมาย & ระเบียบ ววน.' },
    { id: 'ADVISORY_PRIVATE', name: '2.2 ที่ปรึกษากฎหมายธุรกิจ & การลงทุน' },
    { id: 'ADVISORY_HRD', name: '2.3 ที่ปรึกษา Learning & HRD' },
  ];

  const filteredMembers =
    activeTab === 'ALL'
      ? mockTeamMembers
      : mockTeamMembers.filter((m) => m.teamCategory === activeTab);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-400 font-mono flex items-center gap-1.5">
                <Users2 className="w-4 h-4" />
                MODULE 13: PROJECT TEAM STRUCTURE & EXPERT ADVISORS
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white mt-1">
                รายชื่อคณะทำงานและทีมที่ปรึกษาโครงการ (3 ทีมหลัก)
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
                โครงสร้างการทำงานแบบบูรณาการตามมติการประชุม Kick-off: ทีมบริหารโครงการ (เจ้าภาพขับเคลื่อน) ➔ ทีมที่ปรึกษา (ผู้ตรวจสอบและรับรองความถูกต้อง) ➔ ทีม HRD (ผู้แปลงองค์ความรู้สู่การเรียนรู้และนำไปใช้จริง)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl self-start md:self-auto">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-mono text-sm">
                {mockTeamMembers.length}
              </div>
              <div className="text-left pr-2">
                <div className="text-xs font-bold text-white">ผู้เชี่ยวชาญ & ทีมงาน</div>
                <div className="text-[10px] text-slate-400">ครบทุกมิติตาม TOR</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Teams Concept Workflow Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs">1</span>
                ทีมบริหารโครงการ (Core PM)
              </div>
              <div className="text-sm font-bold text-white mb-1">
                ผู้ขับเคลื่อนและเจ้าภาพงาน
              </div>
              <p className="text-xs text-slate-400">
                รับผิดชอบการวางแผน บริหาร Timeline รวบรวมข้อมูล จัดทำร่างเอกสาร และติดตามการส่งมอบงานตาม TOR ครบถ้วน 100%
              </p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-blue-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              รวบรวมข้อมูล ➔ จัดระบบ ➔ จัดทำ Draft
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs">2</span>
                ทีมที่ปรึกษาด้านวิชาการและกฎหมาย
              </div>
              <div className="text-sm font-bold text-white mb-1">
                ผู้ตรวจสอบและรับรองความถูกต้อง
              </div>
              <p className="text-xs text-slate-400">
                ให้คำปรึกษา ตรวจสอบลำดับศักดิ์ของกฎหมาย วิเคราะห์ Gap & Risk ให้มุมมองการลงทุน/ธุรกิจ และรับรองผลงานวิชาการ
              </p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-purple-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              Review ➔ วิเคราะห์ ➔ Validation
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">3</span>
                ทีมพัฒนาบุคลากรและการเรียนรู้ (HRD)
              </div>
              <div className="text-sm font-bold text-white mb-1">
                ผู้แปลงความรู้สู่การใช้งานจริง
              </div>
              <p className="text-xs text-slate-400">
                จัดทำ Knowledge Matrix, Learning Journey, ออกแบบวิดีโอ 15 คลิป, แบบทดสอบ 12 ชุด, คู่มือปฏิบัติงาน 2 เล่ม และระบบ KM
              </p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-emerald-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              Knowledge Matrix ➔ Learning ➔ KM
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                activeTab === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                      }
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-blue-500/40 shadow"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {member.name}
                        </h3>
                        {member.nickname && (
                          <span className="text-xs px-2 py-0.5 bg-slate-800 text-blue-300 font-semibold rounded-md border border-slate-700">
                            ({member.nickname})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-300 font-medium line-clamp-1">
                        {member.roleTitle}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0',
                      member.teamCategory === 'CORE_PM'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : member.teamCategory === 'ADVISORY_LEGAL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : member.teamCategory === 'ADVISORY_PRIVATE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    )}
                  >
                    {member.teamCategory === 'CORE_PM' ? 'Core PM' : 'Advisory'}
                  </span>
                </div>

                {/* Organization & Strategic Fit */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{member.organization}</span>
                  </div>

                  {member.expertise && (
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-300">
                      <span className="font-semibold text-blue-400">ความเชี่ยวชาญ: </span>
                      {member.expertise}
                    </div>
                  )}

                  {member.strategicFit && (
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-400">
                      <span className="font-semibold text-slate-300">Strategic Fit ในโครงการ: </span>
                      {member.strategicFit}
                    </div>
                  )}
                </div>

                {/* Main Responsibilities */}
                {member.mainResponsibilities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ภารกิจและความรับผิดชอบหลัก
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 pl-2">
                      {member.mainResponsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specific Consulting Topics */}
                {member.specificConsultingTopics &&
                  member.specificConsultingTopics.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-950/80 rounded-xl border border-blue-500/20">
                      <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                        ประเด็นขอคำปรึกษาเจาะจง
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400 pl-1">
                        {member.specificConsultingTopics.map((topic, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400">▸</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Footer Deliverable Badges */}
              {member.deliverableLinks && member.deliverableLinks.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium">
                    เชื่อมโยงผลผลิต TOR:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {member.deliverableLinks.map((delCode) => (
                      <span
                        key={delCode}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700 rounded"
                      >
                        {delCode}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
