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
      time: '10:00 - 11:30 น.',
      title: 'สัมภาษณ์ รศ.ดร.นพพร ลีปรีชานนท์ (รอง ผอ. สกสว.)',
      type: 'INTERVIEW',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'การสัมภาษณ์เชิงลึกโดยทีมที่ปรึกษาวิชาการ ประเด็นอำนาจหน้าที่ ยุทธศาสตร์ และการพัฒนาระบบ ววน.',
    },
    {
      date: '9 ต.ค. 2569',
      time: '14:00 - 15:30 น.',
      title: 'แจ้งความคืบหน้าการเข้าสัมภาษณ์และเก็บข้อมูล พร้อมตัวอย่างประเด็นคำถาม (MTG-2026-04)',
      type: 'MEETING',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'แจ้งความคืบหน้าแนวทางการเข้าสัมภาษณ์และเก็บข้อมูลภาคสนาม พร้อมนำเสนอตัวอย่างประเด็นคำถามสำหรับแต่ละกลุ่มผู้ให้ข้อมูล',
    },
    {
      date: '14 ต.ค. 2569',
      time: '10:00 - 11:30 น.',
      title: 'สัมภาษณ์ ศ.ดร.วิษณุ มีอยู่ (รอง ผอ. สกสว.)',
      type: 'INTERVIEW',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'การสัมภาษณ์เชิงลึกโดยทีมที่ปรึกษาวิชาการ ประเด็นการบริหารกองทุน ววน. การเงินและงบประมาณ',
    },
    {
      date: '16 ต.ค. 2569',
      time: '10:00 - 11:30 น.',
      title: 'สัมภาษณ์ ศ.ดร.คมกฤต เล็กสกุล (รอง ผอ. สกสว.)',
      type: 'INTERVIEW',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'การสัมภาษณ์เชิงลึกโดยทีมที่ปรึกษาวิชาการ ประเด็นการจัดสรรงบประมาณ FF/SF และการติดตามประเมินผล',
    },
    {
      date: '16 ต.ค. 2569',
      time: 'กำหนดส่งร่างแรก',
      title: 'ทบทวนกฎหมาย & ส่งร่างรายงานฉบับที่ 1 (ข้อ 4.3.1) & ฐานข้อมูลกฎหมาย (DEL-01 & DEL-05)',
      type: 'MILESTONE',
      status: 'SCHEDULED',
      gate: 'G1',
      description: 'ทบทวนกฎหมาย 3 ระดับ พร้อมจัดส่งร่างรายงานรวบรวมและจัดหมวดหมู่กฎหมายและฐานข้อมูลกฎหมาย',
    },
    {
      date: '19 – 23 ต.ค. 2569',
      time: 'ช่วงเวลานัดหมาย',
      title: 'สัมภาษณ์ ศ.ดร.จักรพันธ์ สุทธิรัตน์ (รอง ผอ. สกสว.)',
      type: 'INTERVIEW',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'การสัมภาษณ์เชิงลึกโดยทีมที่ปรึกษาวิชาการ ประเด็นการขับเคลื่อนงานวิจัยสู่การใช้ประโยชน์และทรัพย์สินทางปัญญา (TRIUP Act)',
    },
    {
      date: '29 ต.ค. 2569',
      time: '14:00 - 15:30 น.',
      title: 'สัมภาษณ์ ผศ.ดร.พูลศักดิ์ โกษียาภรณ์ (รอง ผอ. สกสว.)',
      type: 'INTERVIEW',
      status: 'SCHEDULED',
      gate: 'G2',
      description: 'การสัมภาษณ์เชิงลึกโดยทีมที่ปรึกษาวิชาการ ประเด็นการบริหารจัดการองค์กร ทรัพยากรมนุษย์ และการพัฒนาระบบงาน',
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

        {/* Deputy Directors Interview Schedule Table/Cards (Oct 2026) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#062B63] text-white rounded-full">
                  FIELDWORK SCHEDULE
                </span>
                <span className="text-xs font-bold text-orange-600 font-mono">
                  ตุลาคม 2569
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1356A3]" />
                กำหนดการขอสัมภาษณ์ รองผู้อำนวยการ สกสว. ทั้ง 5 ท่าน (โดยทีมที่ปรึกษาวิชาการ)
              </h2>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1Y4uCfXDbjjm3fe63wmDSi29neiYbOwaF?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span>Google Drive ประเด็นสัมภาษณ์</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. รศ.ดร.นพพร ลีปรีชานนท์ */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-[#1356A3]/40 transition group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#062B63] text-xs font-bold font-mono rounded-lg border border-blue-200">
                    9 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">10:00 - 11:30 น.</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1356A3] transition">
                  รศ.ดร.นพพร ลีปรีชานนท์
                </h3>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  รองผู้อำนวยการ สกสว.
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <strong>ประเด็นสัมภาษณ์:</strong> ขอบเขตอำนาจหน้าที่ ยุทธศาสตร์ แผน ววน. และการพัฒนาระบบ ววน.
                </p>
              </div>
            </div>

            {/* 2. ศ.ดร.วิษณุ มีอยู่ */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-[#1356A3]/40 transition group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#062B63] text-xs font-bold font-mono rounded-lg border border-blue-200">
                    14 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">10:00 - 11:30 น.</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1356A3] transition">
                  ศ.ดร.วิษณุ มีอยู่
                </h3>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  รองผู้อำนวยการ สกสว.
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <strong>ประเด็นสัมภาษณ์:</strong> การบริหารกองทุนส่งเสริม ววน. ระบบการเงิน บัญชี และการลงทุน
                </p>
              </div>
            </div>

            {/* 3. ศ.ดร.คมกฤต เล็กสกุล */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-[#1356A3]/40 transition group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#062B63] text-xs font-bold font-mono rounded-lg border border-blue-200">
                    16 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">10:00 - 11:30 น.</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1356A3] transition">
                  ศ.ดร.คมกฤต เล็กสกุล
                </h3>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  รองผู้อำนวยการ สกสว.
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <strong>ประเด็นสัมภาษณ์:</strong> การจัดสรรและบริหารงบประมาณ FF/SF และการกำกับติดตามประเมินผล
                </p>
              </div>
            </div>

            {/* 4. ทบทวนกฎหมาย Milestone 16 ต.ค. */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-bold font-mono rounded-lg shadow-2xs">
                    16 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold font-mono">MILESTONE 4.3.1</span>
                </div>
                <h3 className="text-sm font-extrabold text-indigo-950">
                  ทบทวนกฎหมาย & ส่งร่างรายงานฉบับที่ 1
                </h3>
                <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                  ทีมวิชาการและที่ปรึกษากฎหมาย (WS02)
                </div>
                <p className="text-xs text-indigo-900 mt-2 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <strong>สาระงาน:</strong> ทบทวนกฎหมาย 3 ระดับศักดิ์ และจัดส่งร่างรายงานข้อ 4.3.1 พร้อมฐานข้อมูลกฎหมาย (DEL-01 & DEL-05)
                </p>
              </div>
            </div>

            {/* 5. ศ.ดร.จักรพันธ์ สุทธิรัตน์ */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-[#1356A3]/40 transition group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#062B63] text-xs font-bold font-mono rounded-lg border border-blue-200">
                    19 – 23 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ช่วงสัปดาห์</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1356A3] transition">
                  ศ.ดร.จักรพันธ์ สุทธิรัตน์
                </h3>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  รองผู้อำนวยการ สกสว.
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <strong>ประเด็นสัมภาษณ์:</strong> การเชื่อมโยง PMU, การนำผลงานวิจัยไปใช้ประโยชน์ และทรัพย์สินทางปัญญา (TRIUP Act)
                </p>
              </div>
            </div>

            {/* 6. ผศ.ดร.พูลศักดิ์ โกษียาภรณ์ */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-[#1356A3]/40 transition group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-[#062B63] text-xs font-bold font-mono rounded-lg border border-blue-200">
                    29 ต.ค. 2569
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">14:00 - 15:30 น.</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1356A3] transition">
                  ผศ.ดร.พูลศักดิ์ โกษียาภรณ์
                </h3>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  รองผู้อำนวยการ สกสว.
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <strong>ประเด็นสัมภาษณ์:</strong> การบริหารจัดการองค์กร ทรัพยากรมนุษย์ การพัฒนาสมรรถนะบุคลากร และโครงสร้างระบบงาน
                </p>
              </div>
            </div>
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
