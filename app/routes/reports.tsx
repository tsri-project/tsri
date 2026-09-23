import { AppLayout } from '~/components/shell/AppLayout';
import { FileBarChart, FileText, Download, Calendar, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { Link } from '@remix-run/react';
import { mockDeliverables } from '~/lib/mock-data';

export default function ReportsRoute() {
  const reports = [
    {
      code: 'REP-01',
      title: 'รายงานการวิเคราะห์และรวบรวมบทบัญญัติกฎหมาย ระเบียบ และคำสั่งที่เกี่ยวข้องกับ สกสว. (Inception Report)',
      deliverable: 'DEL-01 (TOR 4.3.1)',
      status: 'APPROVED',
      date: '31 มี.ค. 2569',
      pages: 145,
      weight: '20%',
    },
    {
      code: 'REP-02',
      title: 'รายงานการวิเคราะห์ช่องว่าง (Legal & Operational Gap Analysis) และผลกระทบต่อภารกิจ',
      deliverable: 'DEL-02 (TOR 4.3.2, 4.3.3, 4.3.4)',
      status: 'IN_PROGRESS',
      date: '31 พ.ค. 2569',
      pages: 180,
      weight: '25%',
    },
    {
      code: 'REP-03',
      title: 'ร่างคู่มือและแนวปฏิบัติการดำเนินงานตามกฎหมายระเบียบใหม่ (Standard Operating Procedure Guide)',
      deliverable: 'DEL-03 (TOR 4.3.5)',
      status: 'PLANNED',
      date: '31 ก.ค. 2569',
      pages: 120,
      weight: '25%',
    },
    {
      code: 'REP-04',
      title: 'ชุดองค์ความรู้และระบบ Legal Traceability Explorer ฉบับสมบูรณ์ (Final Report)',
      deliverable: 'DEL-04 (TOR 4.3.1 - 4.3.5)',
      status: 'PLANNED',
      date: '30 ก.ย. 2569',
      pages: 250,
      weight: '30%',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 12: FORMAL REPORTS & DELIVERABLES
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ศูนย์รายงานฉบับทางการและเอกสารส่งมอบ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ศูนย์รายงานฉบับทางการและเอกสารส่งมอบ (Formal Reports)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ติดตามรายงานส่งมอบผลผลิต 4 ฉบับตามสัญญา TOR, รายงาน Inception Report, และรายงาน Gap Analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <div
              key={rep.code}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                    {rep.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      rep.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rep.status === 'APPROVED' ? 'อนุมัติแล้ว' : rep.status === 'IN_PROGRESS' ? 'กำลังยกร่าง' : 'ตามแผน'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {rep.title}
                </h3>
                <div className="text-xs text-indigo-700 font-semibold mb-3">
                  เชื่อมโยง: {rep.deliverable}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  กำหนดส่ง: {rep.date}
                </span>
                <span className="font-mono font-bold text-slate-800">
                  น้ำหนัก {rep.weight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
