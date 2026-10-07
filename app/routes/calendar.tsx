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
      date: '25 ก.ย. 2569',
      time: '14:00 - 16:00 น.',
      title: 'การประชุมครั้งที่ 2 (MTG-2026-02)',
      type: 'MEETING',
      status: 'COMPLETED',
      gate: 'G1',
      description: 'นำเสนอผลจัดระบบ 4.3.1 (100%), สรุปข้อคิดเห็นที่ปรึกษา 4 ท่าน และวางแผนงานสัมภาษณ์ผู้บริหาร',
    },
    {
      date: '6 ต.ค. 2569',
      time: '14:00 - 15:30 น.',
      title: 'การประชุมสรุปการดำเนินงานและขอคำปรึกษาประเด็นการเก็บข้อมูลการปฏิบัติงานจริงกับฝ่าย HR (MTG-2026-03)',
      type: 'MEETING',
      status: 'COMPLETED',
      gate: 'G2',
      description: 'สรุปภาพรวมความก้าวหน้าโครงการ และขอคำปรึกษาประเด็นการเก็บข้อมูลการปฏิบัติงานจริงร่วมกับฝ่าย HR',
    },
    {
      date: '9 ต.ค. 2569',
      time: '14:00 - 15:30 น.',
      title: 'การประชุมตรวจความพร้อมภาคสนาม & ข้อคิดเห็นร่างฉบับที่ 1 (MTG-2026-04)',
      type: 'MEETING',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'ตรวจความพร้อมเก็บข้อมูล 26 รอบ และรวบรวมข้อคิดเห็นต่อร่างรายงานฉบับที่ 1 (ข้อ 4.3.1)',
    },
    {
      date: '12 – 30 ต.ค. 2569',
      time: '13 วันทำการ (26 รอบ)',
      title: 'กระบวนการสัมภาษณ์และเก็บข้อมูลภาคสนาม 3 ระดับ',
      type: 'FIELDWORK',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'เจ้าหน้าที่ (12, 14–16 ต.ค.), ผู้บริหารต้น/กลาง (19–22 ต.ค.), ผู้บริหารสูงและบอร์ด (26–30 ต.ค.)',
    },
    {
      date: '16 ต.ค. 2569',
      time: 'กำหนดส่งร่างแรก',
      title: 'ส่งร่างรายงานฉบับที่ 1 (ข้อ 4.3.1) & ฐานข้อมูลกฎหมาย (DEL-01 & DEL-05)',
      type: 'MILESTONE',
      status: 'SCHEDULED',
      gate: 'G1',
      description: 'ร่างรายงานรวบรวมและจัดหมวดหมู่กฎหมาย 3 ระดับ พร้อมฐานข้อมูลกฎหมาย',
    },
    {
      date: '6 พ.ย. 2569',
      time: 'กำหนดส่งร่างแรก',
      title: 'ส่งร่างรายงานฉบับที่ 2 (ข้อ 4.3.2): อำนาจหน้าที่และภารกิจ (DEL-02)',
      type: 'MILESTONE',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'รายงานอำนาจหน้าที่ ภารกิจ และผลเปรียบเทียบการปฏิบัติงานจริง C1/C2/A',
    },
    {
      date: '20 พ.ย. 2569',
      time: 'กำหนดส่งร่างแรก',
      title: 'ส่งร่างรายงานฉบับที่ 3 (ข้อ 4.3.3): ความเชื่อมโยงของกฎหมาย (DEL-03)',
      type: 'MILESTONE',
      status: 'SCHEDULED',
      gate: 'G3',
      description: 'แผนผังความสัมพันธ์และผลการจัดลำดับความสำคัญ 4 มิติ',
    },
    {
      date: '11 ธ.ค. 2569',
      time: 'กำหนดส่งร่างแรก',
      title: 'ส่งร่างรายงานฉบับที่ 4 (ข้อ 4.3.4): ช่องว่าง ปัญหา และข้อเสนอ (DEL-04)',
      type: 'MILESTONE',
      status: 'SCHEDULED',
      gate: 'G4',
      description: 'วิเคราะห์ Gap Analysis 6 มิติ และข้อเสนอแนะเชิงนโยบาย/ทางเลือก',
    },
    {
      date: '25 ธ.ค. 2569',
      time: 'กำหนดพร้อมนำส่งภายใน',
      title: 'จุดพร้อมนำส่งชุดผลส่งมอบระยะที่ 1 ครบ 6 รายการ (DEL-01 ถึง DEL-06)',
      type: 'FINAL_DELIVERY',
      status: 'SCHEDULED',
      gate: 'G5',
      description: 'ชุดผลส่งมอบระยะที่ 1 ครบ 6 รายการ พร้อมรายงานความก้าวหน้า 3 เดือน และ Content Matrix',
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
