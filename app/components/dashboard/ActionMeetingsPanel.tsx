import { ExecutiveDashboardData } from '~/types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Activity,
  Video,
  ExternalLink,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime } from '~/lib/utils';
import { Link } from '@remix-run/react';

interface ActionMeetingsPanelProps {
  data: ExecutiveDashboardData;
}

export function ActionMeetingsPanel({ data }: ActionMeetingsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Column 1: My Action Items */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              My Action Items (งานที่ต้องดำเนินการ)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
              {data.myActionItems.length}
            </span>
          </div>

          <div className="space-y-3">
            {data.myActionItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-[#1356A3]/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                    {item.title}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    กำหนด: {formatThaiDate(item.due_date)}
                  </span>
                  <Link
                    to="/reviews"
                    className="text-[#1356A3] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    จัดการ <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Upcoming Meetings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Upcoming Meetings (การประชุมเร็วๆ นี้)
            </h3>
            <Link
              to="/calendar"
              className="text-xs text-[#1356A3] hover:text-[#062B63] font-bold flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-md font-bold">
                    {meeting.meeting_number}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {meeting.duration_minutes} นาที
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">
                  {meeting.title}
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1356A3] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {formatThaiDateTime(meeting.scheduled_at)}
                  </div>
                  {meeting.location_or_link && (
                    <div className="flex items-center gap-1.5 truncate text-slate-600">
                      <Video className="w-3.5 h-3.5 text-[#F36C21]" />
                      {meeting.location_or_link}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: Recent Activity Log */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#168A91]" />
              Recent Activity Log (ประวัติความเคลื่อนไหว)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
              Live Audit
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1">
            {data.recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#1356A3] mt-1.5 shrink-0 ring-4 ring-blue-50"></div>
                <div>
                  <div className="text-slate-800 font-semibold leading-snug">{act.description}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="text-[#062B63] font-bold">{act.actor_name}</span>
                    <span>•</span>
                    <span>{formatThaiDateTime(act.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
