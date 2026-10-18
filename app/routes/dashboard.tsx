import { useState, useEffect } from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  ListTodo,
  FileCheck2,
  Users,
  Search,
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  ListPlus,
  FolderKanban,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { AppLayout } from '~/components/shell/AppLayout';
import { TodayActiveFocusBanner } from '~/components/dashboard/TodayActiveFocusBanner';
import {
  mockDashboardData,
  mockTorClauses,
  mockProjectTasks,
  mockCurrentUser,
} from '~/lib/mock-data';
import { getStoredTasks, toggleStoredTaskStatus } from '~/lib/app-state';
import { useAuth } from '~/lib/use-auth';
import { DOCUMENT_STATUS_BADGES, type ExecutiveDashboardData, type ProjectTaskItem } from '~/types';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => mockDashboardData;

type TaskFilter = 'ALL' | 'TODAY' | 'IN_PROGRESS' | 'DONE';

export default function DashboardRoute() {
  const data = useLoaderData<ExecutiveDashboardData>();
  const { isAdminOrPm, role, profile } = useAuth();
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('ALL');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [tasks, setTasks] = useState<ProjectTaskItem[]>(mockProjectTasks);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Sync tasks from localStorage / app-state
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

  // Admin toggle task status handler
  const handleToggleTask = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Verification check for Admin/PM authority
    if (!isAdminOrPm) {
      setToastMessage({
        text: 'เฉพาะผู้ดูแลระบบ (Admin) หรือผู้จัดการโครงการ (PM) เท่านั้นที่มีสิทธิ์ติ๊กอัปเดตสถานะงาน',
        type: 'warning',
      });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const { tasks: updatedTasks, updatedTask } = toggleStoredTaskStatus(taskId);
    setTasks(updatedTasks);

    if (updatedTask) {
      const isNowDone = updatedTask.status === 'DONE';
      setToastMessage({
        text: isNowDone
          ? `✅ อัปเดตงาน [${updatedTask.code}] เป็น: เสร็จสมบูรณ์ (DONE) เรียบร้อยแล้ว`
          : `🔄 ปรับสถานะงาน [${updatedTask.code}] เป็น: กำลังดำเนินการ (IN_PROGRESS)`,
        type: isNowDone ? 'success' : 'info',
      });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Calculate task statistics dynamically
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW'
  ).length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const pendingReviewTasks = tasks.filter(
    (t) => t.status === 'IN_REVIEW'
  ).length;

  // Filter tasks based on selected tab
  const filteredTasks = tasks
    .filter((task) => {
      if (taskFilter === 'TODAY') {
        return task.status !== 'DONE';
      }
      if (taskFilter === 'IN_PROGRESS') {
        return task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW';
      }
      if (taskFilter === 'DONE') {
        return task.status === 'DONE';
      }
      return true; // ALL
    })
    .slice(0, 6);

  // Filter recent documents
  const filteredDocuments = data.recentDocuments.filter((doc) =>
    `${doc.title} ${doc.document_code}`
      .toLowerCase()
      .includes(docSearchQuery.trim().toLowerCase())
  );

  // Circular progress math (circumference for r=46 is ~289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = data.torCoveragePercentage || 78;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* 1. Header Greeting & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                สวัสดีครับ คณะทำงานวิจัย สกสว. 👋
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ยินดีต้อนรับสู่ศูนย์ติดตามความก้าวหน้าโครงการวิจัยและผลการส่งมอบสัญญา
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#1356A3]">
              <Calendar className="w-3.5 h-3.5 text-[#F36C21]" />
              <span>วันนี้ 18 ต.ค. 2569</span>
            </span>

            <Link
              to="/daily"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกงาน</span>
            </Link>
          </div>
        </div>

        {/* 2. Live Project Focus Banner */}
        <TodayActiveFocusBanner />

        {/* 3. Executive Hero Progress Card & 2x2 KPI Grid (Matching Modern Clean Reference) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Overall Milestone Circular Progress Widget (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  MILESTONE PROGRESS
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  ความก้าวหน้าโครงการภาพรวม
                </h2>
              </div>
              <Link
                to="/tor"
                className="text-slate-400 hover:text-[#1356A3] transition p-1 rounded-full hover:bg-slate-50"
                title="ดูผลส่งมอบทั้งหมด"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Circular Progress Ring & Summary */}
            <div className="flex items-center gap-6 my-5">
              {/* Radial Progress SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full radial-progress-ring" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1356A3" />
                      <stop offset="100%" stopColor="#2C73C7" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    เสร็จสิ้น
                  </span>
                </div>
              </div>

              {/* Text Description */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800">
                  {data.deliverablesProgress.completed} จาก {data.deliverablesProgress.total} ผลผลิตส่งมอบแล้ว
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-5">
                  ดำเนินงานได้ตามกำหนดเวลา อยู่ระหว่างการจัดเตรียมเอกสารสำหรับ Gate G2 และ G3
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Gate G1 ผ่านแล้ว
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F36C21] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                    <Clock className="w-3 h-3" /> Gate G2 กำลังสรุป
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Progress Footnote */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>งวดส่งมอบปัจจุบัน: งวดที่ 1</span>
              <Link to="/tor" className="font-semibold text-[#1356A3] hover:underline flex items-center gap-1">
                ดูแผนส่งมอบ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: 2x2 KPI Cards Grid (7 cols) - Inspired by Image 2 Screen 2 */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            {/* KPI 1: ขอบเขตงาน TOR */}
            <Link
              to="/tor"
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ขอบเขตงาน TOR</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1356A3] flex items-center justify-center transition-transform group-hover:scale-105">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.torCoveragePercentage}%
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>ครอบคลุม 6 หมวด</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +15%
                  </span>
                </div>
              </div>
            </Link>

            {/* KPI 2: งานที่กำลังดำเนินการ */}
            <Link
              to="/tasks"
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">งานที่กำลังทำ</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {inProgressTasks} งาน
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>ทีมวิจัยกำลังจัดทำร่าง</span>
                  <span className="text-indigo-600 font-semibold">WS01 - WS04</span>
                </div>
              </div>
            </Link>

            {/* KPI 3: ตรวจสอบและรับรองสมบูรณ์ */}
            <Link
              to="/reviews"
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">รับรองสมบูรณ์แล้ว</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.deliverablesProgress.completed} ชิ้น
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>เอกสารรับรองแล้ว</span>
                  <span className="text-emerald-600 font-semibold">VALIDATED</span>
                </div>
              </div>
            </Link>

            {/* KPI 4: รายการรอตรวจทาน & ประเด็นเปิด */}
            <Link
              to="/raid"
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">รอตรวจทาน / ข้อพิจารณา</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-[#F36C21] flex items-center justify-center transition-transform group-hover:scale-105">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#F36C21] font-mono">
                  {data.pendingReviewsCount}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>รอผู้ทรงคุณวุฒิตรวจ</span>
                  <span className="text-amber-600 font-semibold">Gate G2 Review</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 4. Quick Actions Row (Exactly matching Image 2 Screen 2) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              การดำเนินการด่วน (Quick Actions)
            </h2>
            <span className="text-xs text-slate-400">เลือกเข้าถึงระบบงาน</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Quick Action 1 */}
            <Link
              to="/daily"
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#F36C21] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ListPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  บันทึกงานรายวัน
                </div>
                <div className="text-xs text-slate-500 truncate">
                  อัปเดตกิจกรรมโครงการ
                </div>
              </div>
            </Link>

            {/* Quick Action 2 */}
            <Link
              to="/calendar"
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1356A3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  ปฏิทินนัดหมาย
                </div>
                <div className="text-xs text-slate-500 truncate">
                  การประชุมและสัมภาษณ์
                </div>
              </div>
            </Link>

            {/* Quick Action 3 */}
            <Link
              to="/legal-inventory"
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  คลังกฎหมาย & TOR
                </div>
                <div className="text-xs text-slate-500 truncate">
                  มาตรา ระเบียบ และสัญญา
                </div>
              </div>
            </Link>

            {/* Quick Action 4 */}
            <Link
              to="/reviews"
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  ตรวจทาน Gate
                </div>
                <div className="text-xs text-slate-500 truncate">
                  ศูนย์รับรองหลักฐาน
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 5. Today's Tasks Section with Segmented Filters (Directly matching Image 2 Screen 4) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900">
                  แผนงานวิจัยและกิจกรรมสำคัญ (Research Tasks)
                </h2>
                {isAdminOrPm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Admin โหมด: คลิกวงกลมเพื่อติ๊กเสร็จงานได้ทันที
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ติดตามการดำเนินงานรายหมวดและผู้รับผิดชอบ {isAdminOrPm ? '(คลิกที่วงกลมเพื่ออัปเดตความสมบูรณ์ของงาน)' : ''}
              </p>
            </div>

            {/* Segmented Filter Pills (Matching Image 2 Screen 4) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full shrink-0">
              {(
                [
                  { id: 'ALL', label: 'ทั้งหมด' },
                  { id: 'TODAY', label: 'สำคัญ' },
                  { id: 'IN_PROGRESS', label: 'กำลังทำ' },
                  { id: 'DONE', label: 'เสร็จแล้ว' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTaskFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    taskFilter === tab.id
                      ? 'bg-[#062B63] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task List Items (Matching Image 2 Task Row Styling) */}
          <div className="divide-y divide-slate-100 mt-2">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'DONE';
              const isHigh = task.priority === 'CRITICAL' || task.priority === 'HIGH';
              const isMedium = task.priority === 'MEDIUM';

              return (
                <Link
                  key={task.id}
                  to={`/tasks?q=${encodeURIComponent(task.code)}`}
                  className="flex items-center justify-between gap-4 py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Status Circle Indicator / Interactive Checkbox for Admin */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(e, task.id)}
                      title={
                        isAdminOrPm
                          ? isDone
                            ? 'คลิกเพื่อเปลี่ยนเป็นรอดำเนินการ (สิทธิ์ Admin)'
                            : 'คลิกเพื่อติ๊กเสร็จสมบูรณ์ (สิทธิ์ Admin)'
                          : 'เข้าสู่ระบบในฐานะ Admin/PM เพื่อคลิกอัปเดตสถานะงาน'
                      }
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-150 relative z-10 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs hover:bg-emerald-600 hover:scale-105 active:scale-95'
                          : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 hover:scale-105 active:scale-95'
                      } ${!isAdminOrPm ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-500 opacity-0 group-hover:opacity-60 transition-opacity" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {task.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {task.title.replace(/^\d+\s+/, '')}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="truncate">{task.assigned_to}</span>
                        <span>·</span>
                        <span>กำหนด: {formatThaiDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge Pill (Matching Image 2) */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {isHigh && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ด่วนสูง (High)
                      </span>
                    )}
                    {isMedium && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ปานกลาง (Medium)
                      </span>
                    )}
                    {!isHigh && !isMedium && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        ปกติ (Normal)
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                ไม่มีรายการงานในหมวดหมู่นี้
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              แสดง {filteredTasks.length} จากทั้งหมด {totalTasks} งาน
            </span>
            <Link
              to="/tasks"
              className="font-bold text-[#1356A3] hover:underline flex items-center gap-1"
            >
              ดูตารางงานทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 6. Recent Documents Section */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                เอกสารและผลงานวิจัยล่าสุด (Recent Documents)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ทะเบียนเอกสารหลักฐานที่ผ่านการตรวจทานและรับรอง
              </p>
            </div>

            {/* Pill Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อหรือรหัสเอกสาร..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1356A3]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {filteredDocuments.slice(0, 4).map((doc) => {
              const statusBadge = DOCUMENT_STATUS_BADGES[doc.status];
              return (
                <Link
                  key={doc.id}
                  to={`/documents?id=${encodeURIComponent(doc.id)}`}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1356A3] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 truncate">
                        {doc.document_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.class}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 truncate group-hover:text-[#1356A3] transition-colors">
                      {doc.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      ฉบับ {doc.latest_version_number} · อัปเดตล่าสุด
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              ทะเบียนเอกสารทั้งหมด {data.recentDocuments.length} รายการ
            </span>
            <Link
              to="/documents"
              className="font-bold text-[#1356A3] hover:underline flex items-center gap-1"
            >
              เปิดศูนย์เอกสารทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Floating Toast Notification for Admin Actions */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border bg-white animate-bounce-in text-sm font-bold text-slate-800 transition-all border-slate-200">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'info' && <Clock className="w-5 h-5 text-blue-600 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
