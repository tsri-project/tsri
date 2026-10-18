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
import {
  getStoredTasks,
  toggleStoredTaskStatus,
  updateStoredTaskProgress,
  saveStoredTask,
} from '~/lib/app-state';
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

  // Full Task Detail Edit Modal State for Admin
  const [editingDetailTask, setEditingDetailTask] = useState<ProjectTaskItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [detailForm, setDetailForm] = useState<Partial<ProjectTaskItem>>({});

  const handleOpenEditDetailModal = (task: ProjectTaskItem) => {
    if (!isAdminOrPm) {
      setToastMessage('เฉพาะ Admin หรือ PM เท่านั้นที่มีสิทธิ์แก้ไขข้อมูลงาน');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setIsCreatingNew(false);
    setEditingDetailTask(task);
    setDetailForm({
      id: task.id,
      code: task.code,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      assigned_role: task.assigned_role,
      priority: task.priority,
      status: task.status,
      workstream: task.workstream,
      gate_milestone: task.gate_milestone,
      deliverable_ref: task.deliverable_ref,
      progress_pct: task.progress_pct,
      category: task.category,
    });
  };

  const handleOpenCreateTaskModal = () => {
    if (!isAdminOrPm) {
      setToastMessage('เฉพาะ Admin หรือ PM เท่านั้นที่มีสิทธิ์เพิ่มกิจกรรมใหม่');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newId = `tsk-${Date.now().toString().slice(-6)}`;
    const nextCodeNum = tasks.length + 1;
    const nextCode = `TSK-${nextCodeNum < 10 ? '0' + nextCodeNum : nextCodeNum}`;
    const todayIso = new Date().toISOString().split('T')[0];

    const newTaskTemplate: ProjectTaskItem = {
      id: newId,
      code: nextCode,
      title: '',
      description: '',
      due_date: todayIso,
      assigned_to: 'PM และ ผู้วิจัย',
      assigned_role: 'ผู้รับผิดชอบงาน',
      priority: 'MEDIUM',
      status: 'TODO',
      workstream: selectedWorkstream === 'ALL' ? 'WS01' : selectedWorkstream,
      gate_milestone: 'G2',
      deliverable_ref: 'DEL-02',
      category: 'GOVERNANCE',
      progress_pct: 0,
    };
    setIsCreatingNew(true);
    setEditingDetailTask(newTaskTemplate);
    setDetailForm(newTaskTemplate);
  };

  const handleSaveTaskDetail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingDetailTask) return;
    if (!detailForm.title?.trim()) {
      setToastMessage('⚠️ กรุณาระบุชื่อกิจกรรมการดำเนินงาน');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const clampedPct = Math.max(0, Math.min(100, Number(detailForm.progress_pct) || 0));
    let finalStatus = (detailForm.status || editingDetailTask.status) as ProjectTaskItem['status'];
    if (clampedPct === 100 && finalStatus !== 'DONE') {
      finalStatus = 'DONE';
    } else if (finalStatus === 'DONE' && clampedPct < 100) {
      finalStatus = 'IN_PROGRESS';
    }

    const updatedTask: ProjectTaskItem = {
      id: editingDetailTask.id,
      code: (detailForm.code || editingDetailTask.code).trim(),
      title: (detailForm.title || editingDetailTask.title).trim(),
      description: (detailForm.description ?? editingDetailTask.description ?? '').trim(),
      due_date: detailForm.due_date || editingDetailTask.due_date,
      assigned_to: (detailForm.assigned_to || editingDetailTask.assigned_to || 'ทีมงานโครงการ').trim(),
      assigned_role: (detailForm.assigned_role || editingDetailTask.assigned_role || 'ผู้รับผิดชอบ').trim(),
      priority: (detailForm.priority || editingDetailTask.priority || 'MEDIUM') as ProjectTaskItem['priority'],
      status: finalStatus,
      workstream: detailForm.workstream || editingDetailTask.workstream || 'WS01',
      gate_milestone: (detailForm.gate_milestone || editingDetailTask.gate_milestone || 'G2') as ProjectGate,
      deliverable_ref: detailForm.deliverable_ref || editingDetailTask.deliverable_ref || 'DEL-01',
      category: (detailForm.category || editingDetailTask.category || 'GOVERNANCE') as ProjectTaskItem['category'],
      progress_pct: clampedPct,
    };

    const updatedList = saveStoredTask(updatedTask);
    setTasks(updatedList);
    setEditingDetailTask(null);
    setToastMessage(
      isCreatingNew
        ? `✅ เพิ่มกิจกรรมใหม่ [${updatedTask.code}] เรียบร้อยแล้ว`
        : `✅ บันทึกการแก้ไขงาน [${updatedTask.code}] สำเร็จเรียบร้อยแล้ว`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

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
            {isAdminOrPm && (
              <button
                type="button"
                onClick={handleOpenCreateTaskModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>เพิ่มกิจกรรมใหม่</span>
              </button>
            )}
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
                      {isAdminOrPm && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditDetailModal(task)}
                          title="แก้ไขชื่องาน วันที่ส่ง และรายละเอียด (สิทธิ์แอดมิน)"
                          className="p-1 text-slate-400 hover:text-[#062B63] hover:bg-blue-50 rounded-lg transition ml-0.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#062B63]" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-1.5 mb-2 group">
                    <h3
                      onClick={() => isAdminOrPm && handleOpenEditDetailModal(task)}
                      className={`text-sm font-bold text-slate-900 leading-snug flex-1 ${
                        isAdminOrPm ? 'cursor-pointer hover:text-[#062B63] transition' : ''
                      }`}
                      title={isAdminOrPm ? 'คลิกเพื่อแก้ไขชื่องาน (สิทธิ์แอดมิน)' : undefined}
                    >
                      {task.title}
                    </h3>
                    {isAdminOrPm && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditDetailModal(task)}
                        title="แก้ไขชื่องานและรายละเอียด (สิทธิ์แอดมิน)"
                        className="shrink-0 p-1 text-slate-400 hover:text-[#062B63] hover:bg-slate-100 rounded-md transition opacity-80 group-hover:opacity-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => isAdminOrPm && handleOpenEditDetailModal(task)}
                    className={`text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed ${
                      isAdminOrPm ? 'cursor-pointer hover:bg-slate-100/70 transition' : ''
                    }`}
                    title={isAdminOrPm ? 'คลิกเพื่อแก้ไขรายละเอียดงาน (สิทธิ์แอดมิน)' : undefined}
                  >
                    {task.description}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div
                      onClick={() => isAdminOrPm && handleOpenEditDetailModal(task)}
                      className={`flex items-center gap-1.5 ${
                        isAdminOrPm ? 'cursor-pointer hover:text-[#062B63] transition' : ''
                      }`}
                      title={isAdminOrPm ? 'คลิกเพื่อแก้ไขผู้รับผิดชอบ (สิทธิ์แอดมิน)' : undefined}
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">ผู้รับผิดชอบ: </span>
                      <span className="font-semibold text-slate-800">{task.assigned_to}</span>
                      {isAdminOrPm && <Edit3 className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
                    </div>
                    <div
                      onClick={() => isAdminOrPm && handleOpenEditDetailModal(task)}
                      className={`flex items-center gap-1.5 ${
                        isAdminOrPm ? 'cursor-pointer hover:text-[#062B63] transition' : ''
                      }`}
                      title={isAdminOrPm ? 'คลิกเพื่อแก้ไขกำหนดส่ง/วันที่ดำเนินการ (สิทธิ์แอดมิน)' : undefined}
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">กำหนดส่ง: </span>
                      <span className="font-medium text-slate-700 underline decoration-dotted decoration-slate-300 underline-offset-2">
                        {formatThaiDate(task.due_date)}
                      </span>
                      {isAdminOrPm && (
                        <span className="text-[10px] font-semibold text-[#1356A3] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 ml-1">
                          แก้ไขวันที่
                        </span>
                      )}
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

        {/* Full Task Detail Edit Modal for Admin */}
        {editingDetailTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative space-y-5 my-8 max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                      {detailForm.code || 'TSK'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {isCreatingNew ? 'สร้างกิจกรรมใหม่' : 'แก้ไขข้อมูลกิจกรรมและการดำเนินงาน'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                    {isCreatingNew
                      ? 'เพิ่มกิจกรรมงานในแผนงานโครงการ'
                      : detailForm.title || editingDetailTask.title || 'แก้ไขรายละเอียดงาน'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) หรือ PM ในการปรับปรุงข้อมูลงาน
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDetailTask(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveTaskDetail} className="space-y-4 text-xs">
                {/* Row 1: Code and Workstream */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      รหัสกิจกรรม / WBS Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={detailForm.code || ''}
                      onChange={(e) => setDetailForm({ ...detailForm, code: e.target.value })}
                      placeholder="เช่น TSK-12"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      สายงาน (Workstream)
                    </label>
                    <select
                      value={detailForm.workstream || 'WS01'}
                      onChange={(e) => setDetailForm({ ...detailForm, workstream: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                    >
                      <option value="WS01">WS01: บริหารและกำกับโครงการ</option>
                      <option value="WS02">WS02: ศึกษาและวิเคราะห์กฎหมาย</option>
                      <option value="WS03">WS03: วิจัยเชิงคุณภาพ & Gap</option>
                      <option value="WS04">WS04: ข้อเสนอแนะเชิงนโยบาย</option>
                      <option value="WS05">WS05: ตรวจสอบโดยผู้เชี่ยวชาญ & KM</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่องาน / ชื่อกิจกรรมการดำเนินงาน *
                  </label>
                  <input
                    type="text"
                    required
                    value={detailForm.title || ''}
                    onChange={(e) => setDetailForm({ ...detailForm, title: e.target.value })}
                    placeholder="ระบุชื่อกิจกรรมการดำเนินงาน..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#062B63]/20 text-sm"
                  />
                </div>

                {/* Row 3: Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รายละเอียดงาน / ขอบเขตภารกิจ
                  </label>
                  <textarea
                    rows={3}
                    value={detailForm.description || ''}
                    onChange={(e) => setDetailForm({ ...detailForm, description: e.target.value })}
                    placeholder="รายละเอียดแนวทางการดำเนินงาน ข้อมูลที่ต้องใช้ หรือผลลัพธ์ที่คาดหวัง..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#062B63]/20 leading-relaxed"
                  />
                </div>

                {/* Row 4: Due Date */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#062B63]" />
                      <span>วันที่ส่งมอบ / วันที่ดำเนินการ (Due Date) *</span>
                    </label>
                    {detailForm.due_date && (
                      <div className="text-[11px] font-bold text-[#062B63] bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                        แสดงผลในระบบ: {formatThaiDate(detailForm.due_date)}
                      </div>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={detailForm.due_date || ''}
                    onChange={(e) => setDetailForm({ ...detailForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                  />
                  <div className="text-[11px] text-slate-500">
                    * ปฏิทินจะบันทึกเป็นมาตรฐานสากล และแปลงแสดงผลเป็นปี พ.ศ. (พุทธศักราช) บนระบบโครงการโดยอัตโนมัติ
                  </div>
                </div>

                {/* Row 5: Assignee & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ผู้รับผิดชอบงาน *
                    </label>
                    <input
                      type="text"
                      required
                      value={detailForm.assigned_to || ''}
                      onChange={(e) => setDetailForm({ ...detailForm, assigned_to: e.target.value })}
                      placeholder="เช่น คุณไกรพุฒิ อินทรโยธา (PM), ทีมผู้วิจัย"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      บทบาท / ตำแหน่งในทีม
                    </label>
                    <input
                      type="text"
                      value={detailForm.assigned_role || ''}
                      onChange={(e) => setDetailForm({ ...detailForm, assigned_role: e.target.value })}
                      placeholder="เช่น PM, Co PM, ผู้วิจัยหลัก"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                    />
                  </div>
                </div>

                {/* Row 6: Priority & Gate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      ระดับความสำคัญ (Priority)
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pr) => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => setDetailForm({ ...detailForm, priority: pr })}
                          className={`py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                            detailForm.priority === pr
                              ? 'bg-[#062B63] text-white border-[#062B63] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Milestone / งวดส่งมอบ (Gate)
                    </label>
                    <select
                      value={detailForm.gate_milestone || 'G2'}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, gate_milestone: e.target.value as ProjectGate })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#062B63]/20"
                    >
                      <option value="G1">G1: M0 Inception</option>
                      <option value="G2">G2: M1 Diagnostic & Fieldwork</option>
                      <option value="G3">G3: M2 Draft 1 & Validation</option>
                      <option value="G4">G4: M3 Draft 2 & Integration</option>
                      <option value="G5">G5: M4 Final Sign-off</option>
                    </select>
                  </div>
                </div>

                {/* Row 7: Status & Progress Percentage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      สถานะงาน (Status)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'TODO', label: 'รอดำเนินการ' },
                          { id: 'IN_PROGRESS', label: 'กำลังทำ' },
                          { id: 'IN_REVIEW', label: 'ตรวจทาน' },
                          { id: 'DONE', label: 'เสร็จสมบูรณ์' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            const newStatus = st.id;
                            let newPct = detailForm.progress_pct ?? 0;
                            if (newStatus === 'DONE') newPct = 100;
                            else if (newStatus === 'TODO') newPct = 0;
                            else if (newStatus === 'IN_PROGRESS' && newPct === 0) newPct = 25;
                            setDetailForm({ ...detailForm, status: newStatus, progress_pct: newPct });
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] border transition-all text-center ${
                            detailForm.status === st.id
                              ? 'bg-[#062B63] text-white border-[#062B63] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        ความก้าวหน้า (% Progress):
                      </label>
                      <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#062B63]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={detailForm.progress_pct ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                            setDetailForm({
                              ...detailForm,
                              progress_pct: val,
                              status: val === 100 ? 'DONE' : detailForm.status === 'DONE' ? 'IN_PROGRESS' : detailForm.status,
                            });
                          }}
                          className="w-14 px-1.5 py-0.5 text-center bg-white border border-slate-300 rounded font-bold text-xs"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={detailForm.progress_pct ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDetailForm({
                          ...detailForm,
                          progress_pct: val,
                          status: val === 100 ? 'DONE' : detailForm.status === 'DONE' ? 'IN_PROGRESS' : detailForm.status,
                        });
                      }}
                      className="w-full accent-[#062B63] cursor-pointer h-2 bg-slate-200 rounded-lg mb-2"
                    />
                    <div className="flex items-center justify-between gap-1">
                      {[0, 25, 50, 75, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setDetailForm({
                              ...detailForm,
                              progress_pct: preset,
                              status: preset === 100 ? 'DONE' : detailForm.status === 'DONE' ? 'IN_PROGRESS' : detailForm.status,
                            });
                          }}
                          className={`flex-1 py-0.5 text-[10px] font-bold rounded border transition-all ${
                            detailForm.progress_pct === preset
                              ? 'bg-[#062B63] text-white border-[#062B63]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingDetailTask(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#062B63] hover:bg-[#1356A3] rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isCreatingNew ? 'สร้างกิจกรรมงาน' : 'บันทึกข้อมูลงาน'}</span>
                  </button>
                </div>
              </form>
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
