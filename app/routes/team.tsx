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
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 13: PROJECT TEAM & EXPERT ADVISORS
              </span>
              <span className="text-xs font-semibold text-slate-500">
                โครงสร้างคณะทำงานและที่ปรึกษาโครงการ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              รายชื่อคณะทำงานและทีมที่ปรึกษาโครงการ (3 ทีมหลัก)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              โครงสร้างการทำงานแบบบูรณาการตามมติการประชุม Kick-off: ทีมบริหารโครงการ (เจ้าภาพขับเคลื่อน) ➔ ทีมที่ปรึกษา (ผู้ตรวจสอบและรับรองความถูกต้องตาม WORK-WS05-001A) ➔ ทีม HRD (ผู้แปลงองค์ความรู้สู่การเรียนรู้และนำไปใช้จริง)
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl self-start md:self-auto shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#062B63] text-white flex items-center justify-center font-bold font-mono text-base">
              {mockTeamMembers.length}
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-bold text-slate-800">ผู้เชี่ยวชาญ & ทีมงาน</div>
              <div className="text-[11px] text-slate-500">3 คณะทำงานหลัก</div>
            </div>
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5',
                activeTab === cat.id
                  ? 'bg-[#062B63] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {member.name} {member.nickname && <span className="text-slate-500 font-normal">({member.nickname})</span>}
                    </h3>
                    <div className="text-xs text-[#062B63] font-semibold mt-0.5">
                      {member.roleTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{member.organization}</span>
                    </div>
                  </div>
                </div>

                {member.strategicFit && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mb-4 leading-relaxed">
                    <span className="font-bold text-slate-900">บทบาทเชิงยุทธศาสตร์: </span>
                    {member.strategicFit}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#F36C21]" />
                    ความรับผิดชอบหลัก:
                  </div>
                  <ul className="space-y-1 pl-4 text-slate-600 list-disc text-[11px] leading-relaxed">
                    {member.mainResponsibilities.slice(0, 3).map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                {member.email && (
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {member.email}
                  </span>
                )}
                {member.deliverableLinks && (
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold border border-slate-200">
                    {member.deliverableLinks.join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
