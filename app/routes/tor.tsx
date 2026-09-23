import { useState } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockDeliverables, mockTorClauses, mockWorkstreams } from '~/lib/mock-data';
import { Deliverable, TorClauseItem, WorkstreamItem, WORK_STATUS_BADGES, GATE_DETAILS } from '~/types';
import {
  FileCheck2,
  Calendar,
  ShieldCheck,
  Percent,
  TrendingUp,
  Layers,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  FolderOpen,
  FileText,
  Building2,
  Scale,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => {
  return {
    deliverables: mockDeliverables,
    torClauses: mockTorClauses,
    workstreams: mockWorkstreams,
  };
};

export default function TorRoute() {
  const { deliverables, torClauses, workstreams } = useLoaderData<{
    deliverables: Deliverable[];
    torClauses: TorClauseItem[];
    workstreams: WorkstreamItem[];
  }>();

  const [activeTab, setActiveTab] = useState<'CLAUSES' | 'DELIVERABLES' | 'WORKSTREAMS'>('CLAUSES');
  const [selectedClause, setSelectedClause] = useState<TorClauseItem | null>(null);

  const getClauseStatusBadge = (status: TorClauseItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'จัดระบบเอกสารเสร็จสมบูรณ์',
          class: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'IN_PROGRESS':
        return {
          label: 'กำลังดำเนินการ',
          class: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'PENDING_REVIEW':
        return {
          label: 'รอกลั่นกรอง',
          class: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'NOT_STARTED':
      default:
        return {
          label: 'ตามแผนงาน',
          class: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                TOR-PROJ-001-2569
              </span>
              <span className="text-xs font-semibold text-slate-500">
                สัญญางานวิเคราะห์กฎหมายและพัฒนาระบบความรู้ สกสว.
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ข้อกำหนด TOR และรายการส่งมอบผลผลิต (Deliverables)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              กำกับติดตามความก้าวหน้าขอบเขตงานสัญญา ข้อ 4.3.1 – 4.3.5, การจัดเตรียม Review Package ตาม WORK-WS05-001A, และการเชื่อมโยง Gate Milestones (G0–G6)
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-slate-500 font-medium">ความก้าวหน้า TOR รวม</div>
              <div className="text-xl font-bold font-mono text-[#062B63]">25%</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-slate-500 font-medium">ข้อ 4.3.1 จัดระบบ</div>
              <div className="text-xl font-bold font-mono text-emerald-600">100%</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-500 font-medium">น้ำหนักสัญญารวม</div>
              <div className="text-xl font-bold font-mono text-slate-900">100%</div>
            </div>
          </div>
        </div>

        {/* Featured Banner: Current Cadence & Expert Review Package */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-orange-50/50 border border-blue-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F36C21] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F36C21]"></span>
                </span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#062B63]">
                  CURRENT CADENCE: EXPERT REVIEW PACKAGE (WORK-WS05-001A v0.1)
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                ช่วงการดำเนินงาน: 18 – 25 กันยายน 2569
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
              <div className="lg:col-span-2 space-y-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  การจัดระบบเอกสาร ข้อ 4.3.1 เรียบร้อย 100% ➔ เริ่มการตรวจสอบและเพิ่มเติมข้อคิดเห็นจากที่ปรึกษา (Batch 1)
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  หลังจากการจัดระบบและขึ้นทะเบียนเอกสารกฎหมาย 46 ฉบับขึ้นสู่ Cloudflare R2 Vault เรียบร้อยแล้ว ขณะนี้คณะที่ปรึกษา 4 ท่าน (ผศ.ดร.มารุต, นายกานต์กุญช์, อ.นภวัฒน์, ผศ.ดร.กนกพร) กำลังตรวจสอบบทบัญญัติและบันทึก Evidence Audit Trail เพื่อเตรียมสรุปในการประชุมครั้งที่ 2
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 pt-1">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>การประชุมครั้งที่ 2 (Meeting #2): วันที่ 25 กันยายน 2569 เวลา 14:00 - 16:00 น. ณ สกสว. และ Zoom</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-end">
                <Link
                  to="/reviews"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  เข้าสู่ Expert Review Center (Batch 1)
                </Link>
                <Link
                  to="/meetings"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition"
                >
                  <Calendar className="w-4 h-4 text-slate-600" />
                  ดูวาระการประชุมครั้งที่ 2 (25 ก.ย. 69)
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-2">
          <button
            onClick={() => setActiveTab('CLAUSES')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'CLAUSES'
                ? 'border-[#062B63] text-[#062B63]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            ขอบเขตงานตามสัญญา (ข้อ 4.3.1 – 4.3.5)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">5 ข้อ</span>
          </button>

          <button
            onClick={() => setActiveTab('DELIVERABLES')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'DELIVERABLES'
                ? 'border-[#062B63] text-[#062B63]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            ผลผลิตที่ต้องส่งมอบ (DEL-01 ถึง DEL-04)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">4 ชิ้น</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKSTREAMS')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'WORKSTREAMS'
                ? 'border-[#062B63] text-[#062B63]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            สายงานโครงการ (Workstreams WS01 – WS05)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">5 สายงาน</span>
          </button>
        </div>

        {/* TAB 1: TOR CLAUSES (ข้อ 4.3.1 - 4.3.5) */}
        {activeTab === 'CLAUSES' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {torClauses.map((clause) => {
                const badge = getClauseStatusBadge(clause.status);
                const is431 = clause.clause_number === '4.3.1';

                return (
                  <div
                    key={clause.clause_id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm transition hover:shadow-md ${
                      is431 ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                            ข้อ {clause.clause_number}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.class}`}>
                            {badge.label}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                            เชื่อมโยง {clause.related_deliverable_code} (Gate {clause.gate_target})
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {clause.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shrink-0 self-start">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">ความก้าวหน้า</div>
                          <div className="text-base font-extrabold font-mono text-[#062B63]">
                            {clause.completion_percentage}%
                          </div>
                        </div>
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              clause.completion_percentage === 100
                                ? 'bg-emerald-500'
                                : 'bg-[#062B63]'
                            }`}
                            style={{ width: `${clause.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-5 leading-relaxed">
                      {clause.scope_description}
                    </p>

                    {/* Work Packages breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-slate-500" />
                          Work Packages ย่อยและการดำเนินการ ({clause.work_packages.length} รายการ):
                        </span>
                        <span className="text-slate-500 font-normal">
                          ผู้รับผิดชอบหลัก: <span className="font-semibold text-slate-800">{clause.lead_role} ({clause.lead_expert})</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {clause.work_packages.map((wp) => {
                          const isReviewPkg = wp.code.includes('WORK-WS05-001A');
                          return (
                            <div
                              key={wp.code}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition ${
                                isReviewPkg
                                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                                  : wp.status === 'COMPLETED'
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <span className="font-mono font-bold text-[#062B63] bg-white px-2 py-0.5 rounded border border-slate-200">
                                    {wp.code} {wp.version}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      wp.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : wp.status === 'IN_REVIEW'
                                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {wp.status === 'COMPLETED'
                                      ? 'เสร็จสมบูรณ์'
                                      : wp.status === 'IN_REVIEW'
                                      ? 'กำลังตรวจทาน'
                                      : wp.status === 'DRAFTING'
                                      ? 'กำลังยกร่าง'
                                      : 'ตามแผน'}
                                  </span>
                                </div>
                                <div className="font-semibold text-slate-800 mb-1 leading-snug">
                                  {wp.name}
                                </div>
                              </div>

                              <div className="pt-2 mt-2 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                                {wp.period && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{wp.period}</span>
                                  </div>
                                )}
                                {wp.output_file && (
                                  <div className="flex items-center gap-1 text-blue-700 font-medium truncate">
                                    <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                                    <span className="truncate">{wp.output_file}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DELIVERABLES (DEL-01 to DEL-04) */}
        {activeTab === 'DELIVERABLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliverables.map((del) => {
              const statusInfo = WORK_STATUS_BADGES[del.status];
              const gateInfo = GATE_DETAILS[del.gate_milestone];

              return (
                <div
                  key={del.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                        {del.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          น้ำหนัก {del.weight_percentage}%
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {del.title}
                    </h3>

                    {del.description && (
                      <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                        {del.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        กำหนดส่งมอบ: {formatThaiDate(del.due_date)}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        {del.gate_milestone}: {gateInfo.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        ความสอดคล้อง TOR: <span className="font-semibold text-slate-800">
                          {del.code === 'DEL-01' ? 'ข้อ 4.3.1' : del.code === 'DEL-02' ? 'ข้อ 4.3.2, 4.3.3, 4.3.4' : del.code === 'DEL-03' ? 'ข้อ 4.3.5' : 'ข้อ 4.3.1 - 4.3.5'}
                        </span>
                      </span>
                      <Link
                        to="/documents"
                        className="text-xs text-[#062B63] hover:text-[#1356A3] font-bold flex items-center gap-1"
                      >
                        ดูเอกสารที่เกี่ยวข้อง <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: WORKSTREAMS (WS01 - WS05) */}
        {activeTab === 'WORKSTREAMS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workstreams.map((ws) => (
              <div
                key={ws.code}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 text-xs font-mono font-bold bg-[#062B63] text-white rounded-md">
                      {ws.code}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {ws.completion_pct}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {ws.name}
                  </h3>
                  <div className="text-xs font-medium text-slate-500 mb-3">
                    {ws.name_en}
                  </div>

                  <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {ws.description}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">หัวหน้าสายงาน: </span>
                      <span className="font-semibold text-slate-800">{ws.lead}</span>
                    </div>
                    <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-blue-900">
                      <div className="font-bold text-[11px] text-blue-800 mb-0.5">จุดเน้นปัจจุบัน (Current Focus):</div>
                      <div>{ws.current_focus}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">ผลผลิต/งานที่กำลังขับเคลื่อน:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ws.active_works.map((work) => (
                      <span
                        key={work}
                        className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded"
                      >
                        {work}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
