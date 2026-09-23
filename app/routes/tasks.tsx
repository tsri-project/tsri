import { useState, useMemo } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockProjectTasks } from '~/lib/mock-data';
import { ProjectTaskItem, ProjectGate, GATE_DETAILS } from '~/types';
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Search,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => {
  return { tasks: mockProjectTasks };
};

export default function TasksRoute() {
  const { tasks: initialTasks } = useLoaderData<{ tasks: ProjectTaskItem[] }>();
  const [tasks, setTasks] = useState<ProjectTaskItem[]>(initialTasks);
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchWs = selectedWorkstream === 'ALL' || task.workstream === selectedWorkstream;
      const matchStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
      const matchQuery =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigned_to.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWs && matchStatus && matchQuery;
    });
  }, [tasks, selectedWorkstream, selectedStatus, searchQuery]);

  const getStatusBadge = (status: ProjectTaskItem['status']) => {
    switch (status) {
      case 'DONE':
        return { label: 'เสร็จสมบูรณ์', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'IN_REVIEW':
        return { label: 'อยู่ระหว่างตรวจสอบ', class: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'IN_PROGRESS':
        return { label: 'กำลังดำเนินการ', class: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'TODO':
      default:
        return { label: 'รอดำเนินการ', class: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const getPriorityBadge = (priority: ProjectTaskItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 3: PROJECT TASKS & WBS
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ระบบจัดการแผนงานและกิจกรรมโครงการ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              แผนงานและกิจกรรมโครงการ (Task Management)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ติดตามกิจกรรมย่อย การมอบหมายงานตาม WBS (WS01–WS05) และสถานะการตรวจสอบ Review Package (WORK-WS05-001A)
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">งานทั้งหมด</div>
              <div className="text-lg font-bold font-mono text-[#062B63]">{tasks.length}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">เสร็จแล้ว</div>
              <div className="text-lg font-bold font-mono text-emerald-600">
                {tasks.filter((t) => t.status === 'DONE').length}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-[11px] text-slate-500 font-medium">กำลังตรวจ/ทำ</div>
              <div className="text-lg font-bold font-mono text-amber-600">
                {tasks.filter((t) => t.status === 'IN_REVIEW' || t.status === 'IN_PROGRESS').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่องาน, รหัส WBS, ผู้รับผิดชอบ..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">สายงาน:</span>
              <select
                value={selectedWorkstream}
                onChange={(e) => setSelectedWorkstream(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="ALL">ทุกสายงาน (WS01 - WS05)</option>
                <option value="WS01">WS01: บริหารและกำกับโครงการ</option>
                <option value="WS02">WS02: ศึกษาและวิเคราะห์กฎหมาย</option>
                <option value="WS03">WS03: วิจัยเชิงคุณภาพ & Gap</option>
                <option value="WS04">WS04: ข้อเสนอแนะเชิงนโยบาย</option>
                <option value="WS05">WS05: ตรวจสอบโดยผู้เชี่ยวชาญ & KM</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">สถานะ:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="DONE">เสร็จสมบูรณ์ (DONE)</option>
                <option value="IN_REVIEW">อยู่ระหว่างตรวจทาน (IN_REVIEW)</option>
                <option value="IN_PROGRESS">กำลังดำเนินการ (IN_PROGRESS)</option>
                <option value="TODO">รอดำเนินการ (TODO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const statusBadge = getStatusBadge(task.status);
            const priorityClass = getPriorityBadge(task.priority);
            const gateInfo = GATE_DETAILS[task.gate_milestone];

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded">
                      {task.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityClass}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">ผู้รับผิดชอบ: </span>
                      <span className="font-semibold text-slate-800">{task.assigned_to}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">กำหนดส่ง: </span>
                      <span className="font-medium text-slate-700">{formatThaiDate(task.due_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-indigo-700">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      {task.gate_milestone}: {gateInfo.name}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{task.progress_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        task.progress_pct === 100 ? 'bg-emerald-500' : 'bg-[#062B63]'
                      }`}
                      style={{ width: `${task.progress_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
