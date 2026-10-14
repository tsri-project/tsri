import { useState } from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  ListTodo,
  FileCheck2,
  Users,
  Search,
  Info,
  Scale,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { AppLayout } from '~/components/shell/AppLayout';
import {
  mockDashboardData,
  mockTorClauses,
  mockProjectTasks,
} from '~/lib/mock-data';
import { DOCUMENT_STATUS_BADGES, type ExecutiveDashboardData } from '~/types';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => mockDashboardData;
const taskLabels = {
  TODO: 'รอดำเนินการ',
  IN_PROGRESS: 'กำลังดำเนินการ',
  IN_REVIEW: 'รอตรวจสอบ',
  DONE: 'ดำเนินการแล้ว',
};
const scopeLabels = {
  NOT_STARTED: 'ยังไม่เริ่ม',
  IN_PROGRESS: 'กำลังดำเนินการ',
  PENDING_REVIEW: 'รอตรวจสอบ',
  COMPLETED: 'ดำเนินการแล้ว',
};
const shortcuts = [
  {
    title: 'ขอบเขตและผลส่งมอบ',
    description: 'ดูสิ่งที่ต้องทำและผลผลิตตามสัญญา',
    path: '/tor',
    icon: FileCheck2,
    tone: 'bg-blue-50 text-blue-800',
  },
  {
    title: 'งานของทีมวิจัย',
    description: 'ติดตามผู้รับผิดชอบและกำหนดส่งงาน',
    path: '/tasks',
    icon: ListTodo,
    tone: 'bg-teal-50 text-teal-800',
  },
  {
    title: 'ชุดเอกสารโครงการ',
    description: 'เปิดเอกสารและตรวจสอบฉบับที่ใช้',
    path: '/documents',
    icon: FileText,
    tone: 'bg-violet-50 text-violet-800',
  },
  {
    title: 'รายงานสำหรับ สกสว.',
    description: 'ดูรายงานและชุดผลส่งมอบ',
    path: '/reports',
    icon: BookOpen,
    tone: 'bg-orange-50 text-orange-800',
  },
];

export default function DashboardRoute() {
  const data = useLoaderData<ExecutiveDashboardData>();
  const [view, setView] = useState<'overview' | 'research'>('overview');
  const [query, setQuery] = useState('');
  const pendingTasks = mockProjectTasks
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);
  const documents = data.recentDocuments.filter((doc) =>
    `${doc.title} ${doc.document_code}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  const metrics = [
    {
      label: 'ดำเนินการตามขอบเขต',
      value: `${data.torCoveragePercentage}%`,
      detail: 'ค่าจากชุดข้อมูลตัวอย่าง',
      path: '/tor',
      tone: 'bg-[#e9efff]',
      icon: FileCheck2,
    },
    {
      label: 'ผลส่งมอบที่ดำเนินการแล้ว',
      value: `${data.deliverablesProgress.completed}/${data.deliverablesProgress.total}`,
      detail: 'ดูรายการและสถานะแต่ละชิ้น',
      path: '/tor',
      tone: 'bg-[#e5f3ed]',
      icon: CheckCircle2,
    },
    {
      label: 'รายการรอตรวจสอบ',
      value: String(data.pendingReviewsCount),
      detail: 'เปิดศูนย์ตรวจสอบโดยผู้เชี่ยวชาญ',
      path: '/reviews',
      tone: 'bg-[#fff1dd]',
      icon: Scale,
    },
    {
      label: 'ข้อพิจารณาที่ยังเปิดอยู่',
      value: String(data.openDecisionsCount),
      detail: 'ดูประเด็นที่ต้องติดตามต่อ',
      path: '/raid',
      tone: 'bg-[#f0eafb]',
      icon: Users,
    },
  ];

  return (
    <AppLayout>
      <div className="project-overview mx-auto max-w-7xl p-4 md:p-8 space-y-7">
        <div
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="note"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>หน้าภาพรวมใช้ข้อมูลตัวอย่าง</strong> ตัวเลข สถานะ
            และกำหนดส่งยังไม่ได้เชื่อมทะเบียนโครงการที่รับรองแล้ว
            จึงต้องตรวจสอบกับทีม PM ก่อนใช้อ้างอิง
          </p>
        </div>
        <section
          className="relative overflow-hidden rounded-[28px] bg-[#092f60] p-6 text-white md:p-9"
          aria-labelledby="overview-title"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[45px] border-white/5" />
          <div className="relative max-w-3xl">
            <p className="mb-3 text-sm font-medium text-blue-200">
              โครงการกฎหมาย สกสว. <span className="mx-2 text-blue-300">/</span>{' '}
              พื้นที่ติดตามโครงการร่วมกัน
            </p>
            <h1
              id="overview-title"
              className="text-3xl font-bold leading-tight md:text-4xl"
            >
              เห็นภาพรวมเดียวกัน
              <br />
              <span className="text-[#b9ded9]">
                ขับเคลื่อนงานวิจัยไปด้วยกัน
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
              ศึกษาและวิเคราะห์กฎหมายที่เกี่ยวข้องกับการดำเนินงานของ สกสว.
              เพื่อพัฒนาองค์ความรู้ แนวปฏิบัติ และศักยภาพบุคลากร
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/tor"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#092f60]"
              >
                ดูขอบเขตโครงการ <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Users className="h-4 w-4" /> รู้จักคณะทำงาน
              </Link>
            </div>
          </div>
        </section>
        <section
          aria-label="สรุปสถานะตัวอย่าง"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {metrics.map((metric) => (
            <Link
              key={metric.path + metric.label}
              to={metric.path}
              className={`${metric.tone} rounded-3xl p-4 text-slate-900 transition hover:-translate-y-1 md:p-5`}
            >
              <div className="flex items-center justify-between">
                <metric.icon className="h-5 w-5 text-[#1356a3]" />
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-4 text-sm font-medium">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {metric.value}
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                {metric.detail}
              </p>
            </Link>
          ))}
        </section>
        <section aria-labelledby="start-title">
          <div className="mb-4">
            <h2 id="start-title" className="text-xl font-bold text-slate-900">
              ต้องการดูอะไรต่อ?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              เลือกเข้าถึงข้อมูลที่ต้องการได้โดยตรง
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="overview-card group p-5"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-xl p-3 ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section
          className="overview-card p-5 md:p-6"
          aria-labelledby="progress-title"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2
                id="progress-title"
                className="text-xl font-bold text-slate-900"
              >
                เส้นทางดำเนินงานโครงการ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                จากฐานกฎหมายสู่ผลการศึกษาและการนำไปใช้
              </p>
            </div>
            <div
              className="flex rounded-xl bg-slate-100 p-1"
              aria-label="เลือกมุมมอง"
            >
              {[
                { id: 'overview' as const, label: 'ภาพรวมสำหรับ สกสว.' },
                { id: 'research' as const, label: 'งานทีมวิจัย' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={view === item.id}
                  onClick={() => setView(item.id)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                    view === item.id
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {view === 'overview' ? (
            <div className="mt-6 space-y-3">
              {mockTorClauses.map((clause, index) => (
                <Link
                  key={clause.clause_id}
                  to="/tor"
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-800">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {clause.title}
                      </h3>
                      <span className="text-xs text-slate-600">
                        {scopeLabels[clause.status]} ·{' '}
                        {clause.completion_percentage}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      TOR ข้อ {clause.clause_number}
                    </p>
                    <progress
                      className="overview-progress mt-2 w-full"
                      value={clause.completion_percentage}
                      max={100}
                      aria-label={`ความก้าวหน้า ${clause.title}`}
                    />
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {pendingTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks?workstream=${
                    task.workstream
                  }&q=${encodeURIComponent(task.code)}`}
                  className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {task.title.replace(/^\d+\s+/, '')}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {task.assigned_to} · กำหนดส่ง{' '}
                    {formatThaiDate(task.due_date)}
                  </p>
                  <span className="mt-2 inline-block rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-800">
                    {taskLabels[task.status]}
                  </span>
                </Link>
              ))}
              {pendingTasks.length === 0 && (
                <p className="py-6 text-sm text-slate-500">
                  ไม่มีงานค้างในชุดข้อมูลนี้
                </p>
              )}
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800"
              >
                ดูงานทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
        <section
          className="overview-card p-5 md:p-6"
          aria-labelledby="documents-title"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2
                id="documents-title"
                className="text-xl font-bold text-slate-900"
              >
                เอกสารที่เกี่ยวข้อง
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                เปิดรายละเอียด ฉบับเอกสาร และแหล่งอ้างอิง
              </p>
            </div>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800"
            >
              เอกสารทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="sr-only">ค้นหาเอกสารในหน้าภาพรวม</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อหรือรหัสเอกสารในรายการนี้"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
            />
          </label>
          <div className="mt-3 divide-y divide-slate-100">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents?id=${encodeURIComponent(doc.id)}`}
                className="flex items-start gap-3 rounded-xl py-4 hover:bg-slate-50"
              >
                <span className="rounded-xl bg-slate-100 p-2.5">
                  <FileText className="h-5 w-5 text-blue-800" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-6 text-slate-900">
                    {doc.title}
                  </h3>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {doc.document_code} · ฉบับ {doc.latest_version_number}
                  </p>
                  <span className="mt-2 inline-block rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    สถานะในข้อมูลตัวอย่าง:{' '}
                    {DOCUMENT_STATUS_BADGES[doc.status].label}
                  </span>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
            {documents.length === 0 && (
              <p
                role="status"
                className="py-8 text-center text-sm text-slate-500"
              >
                ไม่พบเอกสาร ลองค้นด้วยคำอื่น หรือเปิดศูนย์เอกสาร
              </p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
