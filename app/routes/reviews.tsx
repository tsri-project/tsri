import { useState } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import {
  mockReviewBatches,
  mockReviewItems,
  mockTeamMembers,
  mockCurrentUser,
} from '~/lib/mock-data';
import {
  ReviewBatch,
  ReviewItem,
  ReviewEvidenceRecord,
  VerificationStatus,
  VERIFICATION_STATUS_BADGES,
} from '~/types';
import { useRequireAuth } from '~/lib/use-auth';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Plus,
  Paperclip,
  UserCheck,
  Building2,
  Lock,
  Unlock,
  Eye,
  Send,
  X,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime, formatFileSize } from '~/lib/utils';

export const clientLoader = async () => {
  return {
    batches: mockReviewBatches,
    items: mockReviewItems,
    team: mockTeamMembers,
  };
};

export default function ReviewsRoute() {
  const { isLoading, isAuthenticated } = useRequireAuth('/login?returnTo=/reviews');
  const { batches: initialBatches, items: initialItems } = useLoaderData<typeof clientLoader>();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-01');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL'); // 'ALL' or expert ID
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL'); // 'ALL' or VerificationStatus

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialItems);
  const [activeModalItem, setActiveModalItem] = useState<ReviewItem | null>(null);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#062B63] animate-spin" />
          <div className="text-xs font-semibold text-slate-500">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน Expert Review Center...</div>
        </div>
      </div>
    );
  }


  // Form State for Evidence Submission
  const [evidenceForm, setEvidenceForm] = useState({
    article_section: '',
    page_number: 1,
    edition_used: '',
    rationale: '',
    requirement_impact: '',
    resulting_status: 'VALIDATED' as VerificationStatus,
    evidence_file_name: '',
  });

  const activeBatch = initialBatches.find((b) => b.id === selectedBatchId) || initialBatches[0];

  // Calculate Batch Statistics
  const batchItems = reviewItems.filter((item) => item.batch_id === activeBatch.id);
  const validatedCount = batchItems.filter((item) => item.status === 'VALIDATED').length;
  const conflictCount = batchItems.filter((item) => item.status === 'SOURCE_CONFLICT').length;
  const pendingExpertCount = batchItems.filter((item) => item.status === 'EXPERT_VALIDATION_REQUIRED').length;
  const notVerifiedCount = batchItems.filter((item) => item.status === 'SOURCE_NOT_VERIFIED').length;
  const isG2Ready = batchItems.length > 0 && validatedCount === batchItems.length;

  // Filtered Review Items for display
  const displayedItems = batchItems.filter((item) => {
    const matchRole = selectedRoleFilter === 'ALL' || item.assigned_expert_id === selectedRoleFilter;
    const matchStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;
    return matchRole && matchStatus;
  });

  // Open modal handler
  const handleOpenReviewModal = (item: ReviewItem) => {
    setActiveModalItem(item);
    setEvidenceForm({
      article_section: item.article_section || '',
      page_number: item.page_number || 1,
      edition_used: 'ราชกิจจานุเบกษา / ระเบียบฉบับประกาศทางการ',
      rationale: '',
      requirement_impact: '',
      resulting_status: 'VALIDATED',
      evidence_file_name: `EVD_${item.item_code}_Evidence_Memo.pdf`,
    });
  };

  // Submit Evidence handler
  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    const newRecord: ReviewEvidenceRecord = {
      id: `evd-${Date.now()}`,
      review_item_id: activeModalItem.id,
      project_id: activeModalItem.project_id,
      reviewer_id: activeModalItem.assigned_expert_id,
      reviewer_name: activeModalItem.assigned_expert_name,
      reviewer_role: 'ผู้เชี่ยวชาญ / ที่ปรึกษาโครงการ',
      review_date: new Date().toISOString(),
      doc_id_ref: `${activeModalItem.document_code || 'DOC'} v${activeModalItem.document_version_number || '1.0'}`,
      article_section: evidenceForm.article_section,
      page_number: Number(evidenceForm.page_number),
      edition_used: evidenceForm.edition_used,
      rationale: evidenceForm.rationale,
      requirement_impact: evidenceForm.requirement_impact,
      storage_r2_key: `evidence/2026/09/${evidenceForm.evidence_file_name}`,
      evidence_file_name: evidenceForm.evidence_file_name,
      evidence_file_size: 1850000,
      resulting_status: evidenceForm.resulting_status,
      created_at: new Date().toISOString(),
    };

    // Update item status and append evidence record
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id === activeModalItem.id) {
          return {
            ...item,
            status: evidenceForm.resulting_status,
            article_section: evidenceForm.article_section,
            page_number: Number(evidenceForm.page_number),
            evidence_records: [newRecord, ...item.evidence_records],
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    setActiveModalItem(null);
  };

  // List of assigned legal advisors for role filter
  const advisorFilters = [
    { id: 'ALL', name: '👑 ทุกบทบาท / PM View', role: 'ศูนย์ควบคุมโครงการภาพรวม' },
    { id: 'adv-01', name: 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร', role: 'ที่ปรึกษากฎหมาย & บอร์ด กสว. (ม.58)' },
    { id: 'adv-02', name: 'นายกานต์กุญช์ บำรุงชาติ', role: 'ที่ปรึกษากองทุน ววน. (FF/SF)' },
    { id: 'adv-03', name: 'อ.นภวัฒน์ สืบนุสรณ์', role: 'ที่ปรึกษาลำดับศักดิ์กฎหมาย (พ.ร.บ. 2568)' },
    { id: 'adv-04', name: 'ผศ.ดร.กนกพร ศรีสุจริตพานิช', role: 'ที่ปรึกษาการเงินพัสดุ & ทรัพยากร' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-lg">
                MODULE 09
              </span>
              <span className="text-xs font-bold text-[#F36C21] uppercase tracking-wider font-mono">
                EXPERT REVIEW & VALIDATION CENTER
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              ศูนย์กลั่นกรองและรับรองผลงาน (Expert Review Center)
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
              กระบวนการตรวจทานและรับรองความถูกต้องของข้อกฎหมาย ระเบียบกองทุน ววน. และแนวปฏิบัติจริง โดยคณะที่ปรึกษาผู้เชี่ยวชาญ พร้อมระบบบันทึกหลักฐาน (Evidence Audit Trail) สำหรับ Batch 1
            </p>
          </div>

          {/* Batch Selector Dropdown */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">ชุดตรวจทาน:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#1356A3] focus:outline-none shadow-xs"
            >
              {initialBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_number}: {b.title.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gate G2 Dependency & Readiness Banner */}
        <div
          className={`rounded-3xl p-5 border shadow-sm transition-all ${
            isG2Ready
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-slate-50 border-amber-300 text-slate-900'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isG2Ready ? 'bg-emerald-600 text-white' : 'bg-[#F36C21] text-white'
                }`}
              >
                {isG2Ready ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200">
                    GATE DEPENDENCY CHECK
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isG2Ready
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : 'bg-amber-200/80 text-amber-900 font-semibold'
                    }`}
                  >
                    {isG2Ready ? 'พร้อมอนุมัติผ่าน Gate G2' : 'Gate G2: ยังถูกล็อก (LOCKED)'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold mt-1">
                  เงื่อนไขการผ่าน Gate G2: Research Validation (กลั่นกรองผลการวิจัยเบื้องต้น)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isG2Ready
                    ? 'เอกสารและข้อตรวจทานใน Batch 1 ทุกรายการได้รับการรับรองความถูกต้อง (VALIDATED) ครบ 100% แล้ว พร้อมดำเนินการประชุมรับรอง Gate G2'
                    : 'ตามระเบียบโครงการ การจะผ่าน Gate G2 ได้ เอกสารและประเด็นใน Batch 1 ทั้งหมดต้องผ่านการตรวจรับรอง (VALIDATED) และไม่มีสถานะขัดแย้งคงค้าง'}
                </p>
              </div>
            </div>

            {/* Batch Progress Counter */}
            <div className="flex flex-col items-end shrink-0 pl-2">
              <div className="text-right">
                <span className="text-2xl font-extrabold font-mono text-[#062B63]">
                  {validatedCount}/{batchItems.length}
                </span>
                <span className="text-xs font-bold text-slate-600 ml-1">รายการที่รับรองแล้ว</span>
              </div>
              <div className="w-40 bg-slate-200 h-2.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1356A3] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(validatedCount / (batchItems.length || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                ความสมบูรณ์ {Math.round((validatedCount / (batchItems.length || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 4 Status KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: VALIDATED */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'VALIDATED' ? 'ALL' : 'VALIDATED')}
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
              selectedStatusFilter === 'VALIDATED'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> VALIDATED
              </span>
              <span className="font-mono text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">รับรองแล้ว</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{validatedCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">มีหลักฐานอ้างอิงและบันทึกครบถ้วน</p>
          </div>

          {/* Card 2: SOURCE CONFLICT */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'SOURCE_CONFLICT' ? 'ALL' : 'SOURCE_CONFLICT')}
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
              selectedStatusFilter === 'SOURCE_CONFLICT'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/30'
                : 'bg-white border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> SOURCE CONFLICT
              </span>
              <span className="font-mono text-[10px] bg-rose-100 px-1.5 py-0.5 rounded">พบข้อขัดแย้ง</span>
            </div>
            <div className="text-3xl font-extrabold text-rose-600 font-mono">{conflictCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">ขัดแย้งตัวบทหรือแนวปฏิบัติจริง</p>
          </div>

          {/* Card 3: EXPERT VALIDATION REQUIRED */}
          <div
            onClick={() =>
              setSelectedStatusFilter(
                selectedStatusFilter === 'EXPERT_VALIDATION_REQUIRED' ? 'ALL' : 'EXPERT_VALIDATION_REQUIRED'
              )
            }
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
              selectedStatusFilter === 'EXPERT_VALIDATION_REQUIRED'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> EXPERT REQUIRED
              </span>
              <span className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">รอความเห็น</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600 font-mono">{pendingExpertCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">ส่งมอบให้ที่ปรึกษาพิจารณา</p>
          </div>

          {/* Card 4: SOURCE NOT VERIFIED */}
          <div
            onClick={() =>
              setSelectedStatusFilter(
                selectedStatusFilter === 'SOURCE_NOT_VERIFIED' ? 'ALL' : 'SOURCE_NOT_VERIFIED'
              )
            }
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-xs ${
              selectedStatusFilter === 'SOURCE_NOT_VERIFIED'
                ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/30'
                : 'bg-white border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500" /> NOT VERIFIED
              </span>
              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">ยังไม่เทียบตัวบท</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-700 font-mono">{notVerifiedCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">ยังไม่มีการเทียบตัวบทกฎหมาย</p>
          </div>
        </div>

        {/* Role Filter Tabs (Strict Role-Based Simulation) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#1356A3]" />
              <span>สิทธิ์การมองเห็นตามบทบาท (Role-Based Workspace View)</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              เลือกเพื่อจำลองมุมมองของ PM หรือที่ปรึกษาผู้เชี่ยวชาญแต่ละท่าน
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {advisorFilters.map((adv) => (
              <button
                key={adv.id}
                onClick={() => setSelectedRoleFilter(adv.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  selectedRoleFilter === adv.id
                    ? 'bg-[#062B63] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span>{adv.name}</span>
                {adv.id !== 'ALL' && (
                  <span className="text-[10px] opacity-75 font-normal hidden lg:inline">
                    ({adv.role.split('(')[1]?.replace(')', '') || adv.role})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Review Items List Header & Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1356A3]" />
              รายการข้อตรวจทานและประเด็นทางกฎหมาย (Review Checklist)
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              แสดง {displayedItems.length} จากทั้งหมด {batchItems.length} รายการใน {activeBatch.batch_number}
            </div>
          </div>

          {selectedStatusFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className="text-xs text-[#F36C21] font-bold hover:underline flex items-center gap-1"
            >
              ล้างตัวกรองสถานะ <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Review Items Cards */}
        <div className="space-y-4">
          {displayedItems.map((item) => {
            const statusInfo = VERIFICATION_STATUS_BADGES[item.status];
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Code, Title, Description */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#1356A3] text-white rounded-lg">
                        {item.item_code}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                        {item.document_code} (v{item.document_version_number})
                      </span>
                      {item.deliverable_code && (
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                          TOR: {item.deliverable_code}
                        </span>
                      )}
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusInfo.class}`}
                      >
                        ● {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>

                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 leading-relaxed">
                      <span className="font-bold text-slate-900">ประเด็นที่ต้องตรวจสอบ: </span>
                      {item.issue_description}
                    </div>

                    {/* Meta info: Article, Section, Page, Due date */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 text-[#062B63] font-bold">
                        <FileText className="w-3.5 h-3.5" /> {item.article_section} (หน้า {item.page_number})
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <UserCheck className="w-3.5 h-3.5 text-[#1356A3]" /> ผู้รับผิดชอบ: {item.assigned_expert_name}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5" /> กำหนดส่ง: {formatThaiDate(item.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Submit Button & Quick Status */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleOpenReviewModal(item)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 group"
                    >
                      <Send className="w-3.5 h-3.5 text-[#F36C21] group-hover:translate-x-0.5 transition-transform" />
                      <span>บันทึกผลตรวจและหลักฐาน</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Records Audit Trail */}
                {item.evidence_records.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>บันทึกประวัติการตรวจรับรอง (Evidence Audit Trail) ({item.evidence_records.length} รายการ)</span>
                    </div>

                    <div className="space-y-2.5">
                      {item.evidence_records.map((evd) => (
                        <div
                          key={evd.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{evd.reviewer_name}</span>
                              <span className="text-slate-500 text-[11px]">({evd.reviewer_role || 'ผู้เชี่ยวชาญ'})</span>
                            </div>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {formatThaiDateTime(evd.review_date)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                            <div>
                              <span className="font-bold text-slate-900">คำวินิจฉัย / เหตุผลประกอบ: </span>
                              <p className="mt-0.5 text-slate-600">{evd.rationale}</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-900">ผลกระทบต่อ TOR / REQ: </span>
                              <p className="mt-0.5 text-slate-600">{evd.requirement_impact}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                            <span>
                              เอกสารอ้างอิง: <strong className="text-slate-800">{evd.doc_id_ref}</strong> • {evd.edition_used}
                            </span>
                            {evd.evidence_file_name && (
                              <span className="flex items-center gap-1.5 text-[#1356A3] font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                <Paperclip className="w-3.5 h-3.5 text-[#F36C21]" />
                                {evd.evidence_file_name} ({formatFileSize(evd.evidence_file_size || 1500000)})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {displayedItems.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 text-sm">ไม่พบรายการข้อตรวจทานที่ตรงกับตัวกรอง</p>
              <p className="text-xs text-slate-500 mt-1">กรุณาเลือกตัวกรองบทบาทหรือสถานะอื่น</p>
            </div>
          )}
        </div>

        {/* Modal Form: Evidence-Backed Review Submission */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F36C21]">
                    EVIDENCE AUDIT SUBMISSION • {activeModalItem.item_code}
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    บันทึกผลการตรวจรับรองและหลักฐาน (Expert Validation)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmitEvidence} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Item Info Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900 text-sm">{activeModalItem.title}</div>
                  <div className="text-slate-600">{activeModalItem.issue_description}</div>
                  <div className="text-[11px] text-[#1356A3] font-mono pt-1">
                    เอกสาร: {activeModalItem.document_code} (v{activeModalItem.document_version_number}) • ผู้ตรวจ: {activeModalItem.assigned_expert_name}
                  </div>
                </div>

                {/* Grid: Article/Section & Page Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      มาตรา / ข้อ ที่อ้างอิง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น มาตรา 58 วรรคสอง หรือ ข้อ 14 (1)"
                      value={evidenceForm.article_section}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, article_section: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      เลขหน้าในเอกสาร <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={evidenceForm.page_number}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, page_number: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Edition used */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ฉบับ / แหล่งประกาศที่ใช้เทียบเคียง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ราชกิจจานุเบกษา เล่ม 136 ตอนที่ 59 ก หน้า 14 ลงวันที่ 1 พ.ค. 2562"
                    value={evidenceForm.edition_used}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, edition_used: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>

                {/* Target Verification Status Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ผลการตรวจรับรอง (Target Verification Status) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, resulting_status: 'VALIDATED' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.resulting_status === 'VALIDATED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> VALIDATED (รับรอง)
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, resulting_status: 'SOURCE_CONFLICT' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.resulting_status === 'SOURCE_CONFLICT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" /> SOURCE CONFLICT
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, resulting_status: 'EXPERT_VALIDATION_REQUIRED' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.resulting_status === 'EXPERT_VALIDATION_REQUIRED'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-4 h-4" /> รอความเห็นเพิ่ม
                    </button>
                  </div>
                </div>

                {/* Rationale & Legal Reasoning */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    คำวินิจฉัย / เหตุผลทางกฎหมายและการปฏิบัติการ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="อธิบายเหตุผล ข้อเท็จจริง หรือหลักการตีความทางกฎหมายอย่างละเอียด..."
                    value={evidenceForm.rationale}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, rationale: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  ></textarea>
                </div>

                {/* Impact on TOR Requirements */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ผลกระทบต่อข้อกำหนดโครงการ (TOR Requirements & Deliverables) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ส่งผลต่อการยกร่าง Gap Analysis ข้อ 4.3.2 และคู่มือ SOP ข้อ 4.3.5"
                    value={evidenceForm.requirement_impact}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, requirement_impact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>

                {/* Evidence File Attachment */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ไฟล์เอกสารหลักฐานแนบ (Cloudflare R2 Secure Storage)
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-600">
                    <Paperclip className="w-4 h-4 text-[#F36C21]" />
                    <span className="font-mono text-slate-800 font-bold">{evidenceForm.evidence_file_name}</span>
                    <span className="text-[10px] text-slate-500 ml-auto bg-white px-2 py-0.5 rounded border border-slate-200">
                      R2 Presigned Auto-Linked
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#F36C21]" />
                    <span>บันทึกผลการรับรองเข้าสู่ระบบ</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
