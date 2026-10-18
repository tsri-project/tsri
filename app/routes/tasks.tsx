import { PageHero } from '~/components/shell/PageHero';
import { useState, useMemo, useEffect } from 'react';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockProjectTasks, mockWorkstreams } from '~/lib/mock-data';
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
  Edit3,
  Check,
  X,
  Sliders,
  Percent,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';
import { getStoredTasks, toggleStoredTaskStatus, updateStoredTaskProgress } from '~/lib/app-state';
import { useAuth } from '~/lib/use-auth';

export const clientLoader = async () => {
  return { tasks: mockProjectTasks };
};

export default function TasksRoute() {
  const { tasks: initialTasks } = useLoaderData<{ tasks: ProjectTaskItem[] }>();
  const { isAdminOrPm } = useAuth();
  const [tasks, setTasks] = useState<ProjectTaskItem[]>(initialTasks);
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Progress Modal State for Admin
  const [editingTask, setEditingTask] = useState<ProjectTaskItem | null>(null);
  const [modalPct, setModalPct] = useState<number>(0);
  const [modalStatus, setModalStatus] = useState<ProjectTaskItem['status']>('IN_PROGRESS');

  const handleOpenProgressModal = (task: ProjectTaskItem) => {
    if (!isAdminOrPm) {
      setToastMessage('เฉพาะ Admin หรือ PM เท่านั้นที่มีสิทธิ์ปรับเปอร์เซ็นต์งาน');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setEditingTask(task);
    setModalPct(task.progress_pct);
    setModalStatus(task.status);
  };

  const handlePctChange = (newPct: number) => {
    const clamped = Math.max(0, Math.min(100, newPct));
    setModalPct(clamped);
    if (clamped === 100) {
      setModalStatus('DONE');
    } else if (modalStatus === 'DONE' && clamped < 100) {
      setModalStatus('IN_PROGRESS');
    }
  };

  const handleSaveProgress = () => {
    if (!editingTask) return;
    const { tasks: updatedTasks, updatedTask } = updateStoredTaskProgress(
      editingTask.id,
      modalPct,
      modalStatus
    );
    setTasks(updatedTasks);
    setEditingTask(null);

    if (updatedTask) {
      setToastMessage(
        `✅ อัปเดตความก้าวหน้า [${updatedTask.code}] เป็น ${updatedTask.progress_pct}% เรียบร้อยแล้ว`
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!isAdminOrPm) {
      setToastMessage('เฉพาะ Admin หรือ PM เท่านั้นที่มีสิทธิ์อัปเดตสถานะงาน');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const { tasks: updatedTasks, updatedTask } = toggleStoredTaskStatus(taskId);
    setTasks(updatedTasks);
    if (updatedTask) {
      setToastMessage(
        updatedTask.status === 'DONE'
          ? `✅ ปรับงาน [${updatedTask.code}] เป็น เสร็จสมบูรณ์ (100%) แล้ว`
          : `🔄 ปรับงาน [${updatedTask.code}] เป็น กำลังดำเนินการ แล้ว`
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
  };
  useEffect(() => {
    const workstream = searchParams.get('workstream');
    setSelectedWorkstream(mockWorkstreams.some(ws => ws.code === workstream) ? workstream! : 'ALL');
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    setTasks(getStoredTasks());

    const handleSync = () => {
      setTasks(getStoredTasks());
    };
    window.addEventListener('tsri-state-change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tsri-state-change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

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
      <div className="themed-page p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        
        {/* Header */}
        <PageHero title="งานและความก้าวหน้า" description="ค้นหางาน ติดตามผู้รับผิดชอบ และดูความก้าวหน้าของแต่ละสายงานในพื้นที่เดียวกัน" references={<div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 3: PROJECT TASKS & WBS
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ระบบจัดการแผนงานและกิจกรรมโครงการ
              </span>
            </div>}><div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
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
          </div></PageHero>

        {/* Filters */}
        <div className="theme-card bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex items-center gap-2">
            <Link
              to="/daily"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#062B63] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>บันทึกงานรายวัน</span>
            </Link>
            <Link
              to="/admin"
              className="px-3.5 py-1.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              <span>จัดการหลังบ้าน (Admin)</span>
            </Link>
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
                className="theme-card bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        title={
                          isAdminOrPm
                            ? task.status === 'DONE'
                              ? 'คลิกเพื่อสลับเป็นกำลังดำเนินการ (สิทธิ์ Admin)'
                              : 'คลิกเพื่อติ๊กเสร็จสมบูรณ์ (สิทธิ์ Admin)'
                            : 'เฉพาะ Admin หรือ PM ที่มีสิทธิ์อัปเดตงาน'
                        }
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                          task.status === 'DONE'
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                            : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50'
                        } ${!isAdminOrPm ? 'opacity-80 cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                      >
                        {task.status === 'DONE' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded">
                        {task.code}
                      </span>
                    </div>
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
                    
                    {/* Interactive Percentage Badge for Admin */}
                    <button
                      type="button"
                      onClick={() => handleOpenProgressModal(task)}
                      title={isAdminOrPm ? "คลิกเพื่อปรับความก้าวหน้า (%) สิทธิ์แอดมิน" : undefined}
                      className={`font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                        isAdminOrPm
                          ? 'bg-blue-50 hover:bg-blue-100 text-[#062B63] border-blue-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95'
                          : 'bg-slate-50 text-slate-800 border-slate-200 cursor-default'
                      }`}
                    >
                      <span>{task.progress_pct}%</span>
                      {isAdminOrPm && <Edit3 className="w-3 h-3 text-[#1356A3]" />}
                    </button>
                  </div>
                  
                  {/* Clickable Progress Bar for Admin */}
                  <div
                    onClick={() => isAdminOrPm && handleOpenProgressModal(task)}
                    title={isAdminOrPm ? "คลิกเพื่อปรับระดับความคืบหน้า" : undefined}
                    className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden ${
                      isAdminOrPm ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all' : ''
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
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

        {/* Task Progress Adjustment Modal for Admin */}
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                      {editingTask.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      ปรับระดับความก้าวหน้าโครงการ
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                    {editingTask.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    ผู้รับผิดชอบ: <span className="font-semibold text-slate-700">{editingTask.assigned_to}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Big Progress Counter & Gauge */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                    modalPct === 100
                      ? 'text-emerald-600'
                      : modalPct >= 50
                      ? 'text-[#062B63]'
                      : 'text-slate-700'
                  }`}>
                    {modalPct}%
                  </span>
                </div>
                
                {/* Progress bar preview */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      modalPct === 100 ? 'bg-emerald-500 shadow-xs' : 'bg-[#062B63]'
                    }`}
                    style={{ width: `${modalPct}%` }}
                  />
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  {modalPct === 100
                    ? '🎉 เสร็จสิ้นสมบูรณ์ 100% พร้อมส่งมอบ / ตรวจรับ'
                    : modalPct > 0
                    ? '⚡ อยู่ระหว่างดำเนินงานตามแผน Cadence'
                    : '⏳ ยังไม่เริ่มดำเนินงาน (0%)'}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  ปุ่มลัดระบุเปอร์เซ็นต์ (Quick Presets):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[0, 25, 50, 75, 80, 90, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePctChange(val)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        modalPct === val
                          ? 'bg-[#062B63] text-white border-[#062B63] shadow-xs scale-105'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider & Direct Numeric Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#1356A3]" />
                    <span>เลื่อนปรับระดับความคืบหน้า (0 - 100%):</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={modalPct}
                      onChange={(e) => handlePctChange(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-600">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={modalPct}
                  onChange={(e) => handlePctChange(Number(e.target.value))}
                  className="w-full accent-[#062B63] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  สถานะของงาน (Task Status):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'TODO', label: 'รอดำเนินการ', color: 'border-slate-300' },
                      { id: 'IN_PROGRESS', label: 'กำลังทำ', color: 'border-blue-400' },
                      { id: 'IN_REVIEW', label: 'ตรวจทาน', color: 'border-amber-400' },
                      { id: 'DONE', label: 'เสร็จสิ้น', color: 'border-emerald-500' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setModalStatus(st.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        modalStatus === st.id
                          ? 'bg-[#062B63] text-white border-[#062B63] shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#062B63] hover:bg-[#1356A3] rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>บันทึกความคืบหน้า</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-white border-slate-200 text-sm font-bold text-slate-800 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
