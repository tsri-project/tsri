import { useState } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockMeetings } from '~/lib/mock-data';
import { MeetingItem, ProjectGate } from '~/types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Users,
  CheckCircle,
  FileText,
  MapPin,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime } from '~/lib/utils';

export const clientLoader = async () => {
  return { meetings: mockMeetings };
};

export default function CalendarRoute() {
  const { meetings: initialMeetings } = useLoaderData<{ meetings: MeetingItem[] }>();
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);

  const timelineEvents = [
    {
      date: '18 ก.ย. 2569',
      time: '17:00 - 18:30 น.',
      title: 'การประชุม Kick-off โครงการ (MTG-2026-01)',
      type: 'MEETING',
      status: 'COMPLETED',
      gate: 'G0',
      description: 'กำหนดบทบาท 3 ทีมที่ปรึกษา ส่งมอบกรอบ Baseline กฎหมาย และเริ่มกระบวนการจัดระบบเอกสาร',
    },
    {
      date: '18 – 25 ก.ย. 2569',
      time: 'ตลอดช่วงสัปดาห์',
      title: 'ช่วงการตรวจสอบและเพิ่มเติมข้อคิดเห็นของคณะที่ปรึกษา (WORK-WS05-001A v0.1)',
      type: 'REVIEW_WINDOW',
      status: 'IN_PROGRESS',
      gate: 'G1 ➔ G2',
      description: 'ที่ปรึกษา 4 ท่านตรวจทานบทบัญญัติ บันทึก Evidence Audit Trail ใน Expert Review Center',
    },
    {
      date: '25 ก.ย. 2569',
      time: '14:00 - 16:00 น.',
      title: 'การประชุมครั้งที่ 2 เพื่ออัปเดตการดำเนินงานและสรุปข้อคิดเห็นของที่ปรึกษา (MTG-2026-02)',
      type: 'MEETING',
      status: 'SCHEDULED',
      gate: 'G1 ➔ G2',
      description: 'นำเสนอผลจัดระบบ 4.3.1 (100%), รายงานข้อคิดเห็นที่ปรึกษา, พิจารณา Friction งบ FF/SF และเตรียมปลดล็อก Gate G2',
    },
    {
      date: '26 ก.ย. – 15 ต.ค. 2569',
      time: 'ตามตารางนัดหมาย',
      title: 'กระบวนการสัมภาษณ์เชิงลึกระดับบอร์ดและผู้บริหาร สกสว. (WORK-WS03-002)',
      type: 'INTERVIEW',
      status: 'PLANNED',
      gate: 'G2 ➔ G3',
      description: 'สัมภาษณ์ผู้บริหาร สกสว., ผู้แทน กสว., PMU เพื่อวิเคราะห์ Gap Analysis ข้อ 4.3.2',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                MODULE 7: PROJECT CALENDAR & CADENCE
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ปฏิทินนัดหมายและไทม์ไลน์โครงการ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ปฏิทินนัดหมายและเหตุการณ์สำคัญ (Project Timeline)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ติดตามรอบการประชุม (Meeting Cadence), กำหนดการตรวจสอบ Expert Review Package, และหมุดหมาย Gate Milestones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/meetings"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              ดูรายการบันทึก MOM
            </Link>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#062B63]" />
              กำหนดการสำคัญในระยะ Gate G1 ➔ Gate G2 (กันยายน – ตุลาคม 2569)
            </h3>
            <span className="text-xs font-medium text-slate-500">
              สถานะปัจจุบัน: กำลังดำเนินการสัปดาห์ที่ 2
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-200">
            {timelineEvents.map((evt, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-10">
                <div
                  className={`absolute left-2.5 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                    evt.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-white ring-2 ring-emerald-200'
                      : evt.status === 'IN_PROGRESS'
                      ? 'bg-[#F36C21] border-white ring-4 ring-orange-100 animate-pulse'
                      : 'bg-slate-300 border-white'
                  }`}
                />

                <div
                  className={`flex-1 p-5 rounded-2xl border transition ${
                    evt.status === 'IN_PROGRESS'
                      ? 'bg-orange-50/40 border-orange-200 shadow-sm'
                      : evt.status === 'COMPLETED'
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200 shadow-2xs">
                        {evt.date}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {evt.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        Gate {evt.gate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          evt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : evt.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800 font-extrabold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {evt.status === 'COMPLETED'
                          ? 'เสร็จสิ้น'
                          : evt.status === 'IN_PROGRESS'
                          ? 'กำลังดำเนินการ (Active)'
                          : 'ตามแผน'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
