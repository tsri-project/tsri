import { useState } from 'react';
import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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
} from 'lucide-react';
import { formatThaiDateTime } from '~/lib/utils';

export const loader: LoaderFunction = async () => {
  return json<{ meetings: MeetingItem[] }>({ meetings: mockMeetings });
};

export default function MeetingsRoute() {
  const { meetings } = useLoaderData<{ meetings: MeetingItem[] }>();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-xs font-semibold text-purple-400 font-mono">
              MODULE 08: MEETING CENTER & MOM
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              ศูนย์การประชุมและบันทึกรายงานการประชุม (MOM)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              ติดตามวาระการประชุม มติที่ประชุมคณะทำงาน และการกลั่นกรอง Gate Milestones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                      {mtg.meeting_number}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {mtg.meeting_type}
                    </span>
                  </div>
                  {mtg.gate_ref && (
                    <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      Gate {mtg.gate_ref}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {mtg.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2 text-blue-300 font-medium">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{formatThaiDateTime(mtg.scheduled_at)}</span>
                    <span className="text-slate-500">•</span>
                    <span>({mtg.duration_minutes} นาที)</span>
                  </div>
                  {mtg.location_or_link && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{mtg.location_or_link}</span>
                    </div>
                  )}
                  {mtg.agenda && (
                    <div className="pt-2 border-t border-slate-800/60 text-slate-400 whitespace-pre-line text-[11px]">
                      <span className="font-semibold text-slate-300">วาระการประชุม:</span>
                      <div className="mt-1">{mtg.agenda}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  ผู้เข้าร่วม: {mtg.attendees_count || 0} ท่าน
                </span>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  เอกสาร MOM
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
