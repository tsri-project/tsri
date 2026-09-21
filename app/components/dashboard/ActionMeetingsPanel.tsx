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
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime } from '~/lib/utils';
import { Link } from '@remix-run/react';

interface ActionMeetingsPanelProps {
  data: ExecutiveDashboardData;
}

export function ActionMeetingsPanel({ data }: ActionMeetingsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: My Action Items */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            My Action Items (งานที่ต้องดำเนินการ)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {data.myActionItems.length}
          </span>
        </div>

        <div className="space-y-2.5 flex-1">
          {data.myActionItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-medium text-slate-200 line-clamp-2">
                  {item.title}
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                    item.priority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.priority === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {item.priority}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  กำหนด: {formatThaiDate(item.due_date)}
                </span>
                <span className="text-blue-400 font-medium hover:underline cursor-pointer">
                  จัดการ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Upcoming Meetings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Upcoming Meetings (การประชุมเร็วๆ นี้)
          </h3>
          <Link
            to="/calendar"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3 flex-1">
          {data.upcomingMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-semibold">
                  {meeting.meeting_number}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {meeting.duration_minutes} นาที
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 line-clamp-2 mb-2">
                {meeting.title}
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                  <Clock className="w-3 h-3" />
                  {formatThaiDateTime(meeting.scheduled_at)}
                </div>
                {meeting.location_or_link && (
                  <div className="flex items-center gap-1.5 truncate text-slate-400">
                    <Video className="w-3 h-3 text-slate-500" />
                    {meeting.location_or_link}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Recent Activity Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Recent Activity Log (ประวัติความเคลื่อนไหว)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Live Audit</span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
          {data.recentActivities.map((act) => (
            <div key={act.id} className="flex gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 ring-4 ring-blue-500/10"></div>
              <div>
                <div className="text-slate-300 font-medium">{act.description}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{act.actor_name}</span>
                  <span>•</span>
                  <span>{formatThaiDateTime(act.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
