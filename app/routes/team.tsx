import { AppLayout } from '~/components/shell/AppLayout';
import { Users2, Shield, UserCheck, Mail, Building } from 'lucide-react';
import { UserRole } from '~/types';

interface MemberItem {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  org: string;
}

const membersList: MemberItem[] = [
  {
    id: '1',
    name: 'ดร.เด่นชัย ปัญญาไว',
    role: 'project_admin',
    roleTitle: 'ผู้อำนวยการโครงการ / ผู้ดูแลระบบ',
    email: 'den.director@tsri.or.th',
    org: 'สกสว.',
  },
  {
    id: '2',
    name: 'น.ส.ภัทรวดี จัดการงาน',
    role: 'pm',
    roleTitle: 'ผู้จัดการโครงการ (Project Manager)',
    email: 'pat.pm@tsri.or.th',
    org: 'สกสว.',
  },
  {
    id: '3',
    name: 'นายกฤษฎา นิติธรรม',
    role: 'legal_advisor',
    roleTitle: 'ที่ปรึกษากฎหมายอาวุโส',
    email: 'kritsada.legal@tsri.or.th',
    org: 'ที่ปรึกษาอิสระ',
  },
  {
    id: '4',
    name: 'ดร.กานต์ นวัตกรรม',
    role: 'researcher',
    roleTitle: 'นักวิจัยหลัก',
    email: 'karn.research@tsri.or.th',
    org: 'สถาบันวิจัย',
  },
  {
    id: '5',
    name: 'นายประสิทธิ์ พัฒนากร',
    role: 'hrd',
    roleTitle: 'ผู้แทนฝ่ายพัฒนาองค์กรและบุคคล',
    email: 'prasit.hrd@tsri.or.th',
    org: 'สกสว.',
  },
];

export default function TeamRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-blue-400 font-mono">
            MODULE 13: TEAM & ROLE-BASED ACCESS CONTROL (RBAC)
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            ทีมงานและสิทธิ์การเข้าถึงระบบ (RBAC Matrix)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            บริหารจัดการสิทธิ์ 7 บทบาท (project_admin, pm, researcher, legal_advisor, hrd, stakeholder, viewer)
          </p>
        </div>

        {/* Team Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {membersList.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                    {m.role}
                  </span>
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{m.name}</h3>
                <div className="text-xs text-blue-300 font-medium mb-3">{m.roleTitle}</div>
                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.org}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{m.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
