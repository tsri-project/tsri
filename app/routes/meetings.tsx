import { useState } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockMeetings } from '~/lib/mock-data';
import { MeetingItem, ProjectGate } from '~/types';
import {
  MessagesSquare,
  Clock,
  Video,
  Plus,
  Users,
  FileText,
  MapPin,
  ShieldCheck,
  Calendar,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Download,
} from 'lucide-react';
import { formatThaiDateTime } from '~/lib/utils';

export const clientLoader = async () => {
  return { meetings: mockMeetings };
};

export default function MeetingsRoute() {
  const { meetings } = useLoaderData<{ meetings: MeetingItem[] }>();

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                MODULE 08: MEETING CENTER & MOM
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ระบบจัดการประชุมและบันทึกข้อตกลง
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ศูนย์การประชุมและบันทึกรายงานการประชุม (MOM)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ติดตามวาระการประชุม มติที่ประชุมคณะทำงานและที่ปรึกษา และการกลั่นกรอง Gate Milestones (G0 ➔ G1 ➔ G2)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/calendar"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition"
            >
              <CalendarDays className="w-4 h-4 text-slate-600" />
              ดูมุมมองปฏิทิน
            </Link>
          </div>
        </div>

        {/* Featured Card: Next Meeting */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50/40 border border-purple-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
              </span>
              <span className="text-xs font-bold font-mono text-purple-900 uppercase tracking-wider">
                UPCOMING CRITICAL MEETING: MEETING #2
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-800 bg-purple-100/80 px-3 py-1 rounded-full border border-purple-300">
              วันพฤหัสบดีที่ 25 กันยายน 2569 เวลา 14:00 - 16:00 น.
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2">
            การประชุมครั้งที่ 2 เพื่ออัปเดตการดำเนินงานและสรุปข้อคิดเห็นของที่ปรึกษาตาม WORK-WS05-001A (Prepare Expert Review Package)
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl mb-4">
            นำเสนอผลสำเร็จการจัดระบบเอกสารและบทบัญญัติกฎหมายตาม TOR ข้อ 4.3.1 (เสร็จสมบูรณ์ 100%), สรุป Evidence Audit Records จากที่ปรึกษา 4 ท่าน (ช่วง 18-25 ก.ย. 69), พิจารณาประเด็นข้อติดขัดระเบียบงบประมาณ FF/SF และวางแผนการสัมภาษณ์ผู้บริหาร สกสว.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-3 border-t border-purple-200/60">
            <div className="flex items-center gap-1.5 text-purple-900">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>ห้องประชุม 501 สกสว. และ Zoom Cloud Meeting</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-900">
              <Users className="w-4 h-4 text-blue-600" />
              <span>ผู้เข้าร่วม: คณะทำงาน สกสว. + ที่ปรึกษา 3 กลุ่ม (15 ท่าน)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>เป้าหมาย Gate: เตรียมความพร้อมปลดล็อก Gate G2 (Research Validation)</span>
            </div>
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                      {mtg.meeting_number}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {mtg.meeting_type}
                    </span>
                  </div>
                  {mtg.gate_ref && (
                    <span className="flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Gate {mtg.gate_ref}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {mtg.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{formatThaiDateTime(mtg.scheduled_at)}</span>
                    <span className="text-slate-400">•</span>
                    <span>({mtg.duration_minutes} นาที)</span>
                  </div>
                  {mtg.location_or_link && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{mtg.location_or_link}</span>
                    </div>
                  )}
                  {mtg.agenda && (
                    <div className="pt-2 border-t border-slate-200/80 text-slate-600 whitespace-pre-line text-xs">
                      <span className="font-bold text-slate-800">วาระการประชุม:</span>
                      <div className="mt-1 leading-relaxed">{mtg.agenda}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  ผู้เข้าร่วม: {mtg.attendees_count || 0} ท่าน
                </span>
                
                {mtg.status === 'COMPLETED' ? (
                  <Link
                    to="/documents"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    เอกสาร MOM (MOM-PROJ-001)
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    รอดำเนินการประชุม (25 ก.ย. 69)
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
