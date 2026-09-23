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
  ReviewOpinionType,
  REVIEW_OPINION_BADGES,
  AdvisorTeamGroup,
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
  Users,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ThumbsUp,
  Award,
  CheckCheck,
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
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<'ALL' | 'PUBLIC_SECTOR' | 'PRIVATE_SECTOR'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL'); // 'ALL' or expert ID
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL'); // 'ALL' or VerificationStatus

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialItems);
  const [activeModalItem, setActiveModalItem] = useState<ReviewItem | null>(null);

  // Form State for Collaborative Evidence Submission
  const [evidenceForm, setEvidenceForm] = useState<{
    reviewer_id: string;
    reviewer_name: string;
    reviewer_role: string;
    reviewer_team: AdvisorTeamGroup;
    opinion_type: ReviewOpinionType;
    article_section: string;
    page_number: number;
    edition_used: string;
    rationale: string;
    requirement_impact: string;
    resulting_status: VerificationStatus;
    evidence_file_name: string;
  }>({
    reviewer_id: 'adv-01',
    reviewer_name: 'นพ.เฉลิมเกียรติ พรพฤฒิพันธุ์',
    reviewer_role: 'ที่ปรึกษากฎหมายภาครัฐ',
    reviewer_team: 'PUBLIC_SECTOR',
    opinion_type: 'LEAD_FINDING',
    article_section: '',
    page_number: 1,
    edition_used: '',
    rationale: '',
    requirement_impact: '',
    resulting_status: 'EXPERT_VALIDATION_REQUIRED',
    evidence_file_name: '',
  });

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
    const matchTeam =
      selectedTeamFilter === 'ALL' ||
      item.lead_team === selectedTeamFilter ||
      item.evidence_records.some((e) => e.reviewer_team === selectedTeamFilter);
    const matchRole =
      selectedRoleFilter === 'ALL' ||
      item.assigned_expert_id === selectedRoleFilter ||
      item.co_expert_ids?.includes(selectedRoleFilter) ||
      item.evidence_records.some((e) => e.reviewer_id === selectedRoleFilter);
    const matchStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;
    return matchTeam && matchRole && matchStatus;
  });

  // Open modal handler
  const handleOpenReviewModal = (item: ReviewItem, defaultOpinion: ReviewOpinionType = 'SUPPORTING') => {
    setActiveModalItem(item);
    setEvidenceForm({
      reviewer_id: item.assigned_expert_id || 'adv-01',
      reviewer_name: item.assigned_expert_name || 'นพ.เฉลิมเกียรติ พรพฤฒิพันธุ์',
      reviewer_role: item.assigned_category === 'ADVISORY_PRIVATE' ? 'ที่ปรึกษากฎหมายภาคเอกชน' : 'ที่ปรึกษากฎหมายภาครัฐ',
      reviewer_team: item.lead_team || 'PUBLIC_SECTOR',
      opinion_type: defaultOpinion,
      article_section: item.article_section || '',
      page_number: item.page_number || 1,
      edition_used: 'ราชกิจจานุเบกษา / ระเบียบฉบับประกาศทางการ',
      rationale: '',
      requirement_impact: '',
      resulting_status: item.status === 'VALIDATED' ? 'VALIDATED' : 'EXPERT_VALIDATION_REQUIRED',
      evidence_file_name: `EVD_${item.item_code}_${defaultOpinion}_Memo.pdf`,
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
      reviewer_id: evidenceForm.reviewer_id,
      reviewer_name: evidenceForm.reviewer_name,
      reviewer_role: evidenceForm.reviewer_role,
      reviewer_team: evidenceForm.reviewer_team,
      opinion_type: evidenceForm.opinion_type,
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
          // If PM validated or opinion triggers status update
          return {
            ...item,
            status: evidenceForm.resulting_status,
            article_section: evidenceForm.article_section,
            page_number: Number(evidenceForm.page_number),
            evidence_records: [newRecord, ...item.evidence_records],
            co_experts_count: (item.co_experts_count || 0) + (item.assigned_expert_id !== evidenceForm.reviewer_id ? 1 : 0),
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    setActiveModalItem(null);
  };

  // PM Quick Validation Handler
  const handleValidateItem = (item: ReviewItem) => {
    if (confirm(`ยืนยันการอนุมัติรับรอง (VALIDATE) ข้อ ${item.item_code} จากผลฉันทามติที่ประชุม?`)) {
      const pmRecord: ReviewEvidenceRecord = {
        id: `evd-pm-${Date.now()}`,
        review_item_id: item.id,
        project_id: item.project_id,
        reviewer_id: 'pm-01',
        reviewer_name: 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร',
        reviewer_role: 'ผู้จัดการโครงการ (PM) / หัวหน้าชุดวิจัย',
        reviewer_team: 'PM_OFFICE',
        opinion_type: 'CONSENSUS_NOTE',
        review_date: new Date().toISOString(),
        doc_id_ref: `${item.document_code || 'DOC'} v${item.document_version_number || '1.0'}`,
        article_section: item.article_section,
        page_number: item.page_number,
        edition_used: 'มติที่ประชุมคณะที่ปรึกษา ครั้งที่ 2 (25 ก.ย. 2569)',
        rationale: 'คณะที่ปรึกษาทั้ง 4 ท่าน (ภาครัฐ) และ 2 ท่าน (ภาคเอกชน) ได้ข้อสรุปเห็นพ้องตรงกัน PM จึงอนุมัติรับรองเป็น VALIDATED เพื่อบรรจุใน Inception Report (DEL-01)',
        requirement_impact: 'ผ่านเกณฑ์ Gate G2 และพร้อมส่งมอบตาม TOR ข้อ 4.3.1',
        evidence_file_name: `EVD_PM_Consensus_Approval_${item.item_code}.pdf`,
        evidence_file_size: 1200000,
        resulting_status: 'VALIDATED',
        created_at: new Date().toISOString(),
      };

      setReviewItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'VALIDATED',
                evidence_records: [pmRecord, ...i.evidence_records],
                updated_at: new Date().toISOString(),
              }
            : i
        )
      );
    }
  };

  // 6 Advisors info for selection
  const allAdvisorsList = [
    {
      id: 'adv-01',
      name: 'นพ.เฉลิมเกียรติ พรพฤฒิพันธุ์',
      role: 'อดีต ผอ.ส่วนวิจัย สวรส. / ที่ปรึกษากฎหมายภาครัฐ',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ม.58 / บอร์ด กสว.)',
    },
    {
      id: 'adv-02',
      name: 'นายกานต์กุญช์ บำรุงชาติ',
      role: 'หน.ส่วนบริหารงานวิจัย & IP มฟล. / ที่ปรึกษากองทุน ววน.',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ระเบียบ FF/SF & IP)',
    },
    {
      id: 'adv-03',
      name: 'อ.นภวัฒน์ สืบนุสรณ์',
      role: 'อาจารย์ประจำสำนักวิชานิติศาสตร์ มฟล.',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ลำดับศักดิ์ พ.ร.บ. 2568)',
    },
    {
      id: 'adv-04',
      name: 'ผศ.ดร.กนกพร ศรีสุจริตพานิช',
      role: 'รองคณบดีฝ่ายบริหาร ม.บูรพา',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (การเงินพัสดุ & กำลังคน)',
    },
    {
      id: 'adv-05',
      name: 'คุณธนา & คุณเอ๋',
      role: 'ที่ปรึกษากฎหมายธุรกิจ นิติกรรมสัญญา และการร่วมลงทุน',
      team: 'PRIVATE_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏢 ภาคเอกชน (Private Law & JV)',
    },
    {
      id: 'adv-06',
      name: 'คุณบัณฑิตา พละพงศ์',
      role: 'Head of Learning Academy, KBTG / ที่ปรึกษา HRD',
      team: 'PRIVATE_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏢 ภาคเอกชน (HRD & Competency)',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-lg">
                EXPERT REVIEW CENTER
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                โมเดลความเห็นร่วม (4 ท่านภาครัฐ + 2 ท่านเอกชน)
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded-lg">
                WORK-WS05-001A v0.1
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              ศูนย์ตรวจทานกฎหมายโดยผู้เชี่ยวชาญ (Collaborative Review Center)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              เปิดให้ที่ปรึกษาทุกท่านอ่านเอกสารร่วมกัน มอบหมายเจ้าภาพหลัก (Lead Expert) และรองรับการให้ความเห็นต่าง/สนับสนุนข้ามทีมเพื่อสร้างฉันทามติ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/meetings"
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-700" />
              <span>ประชุมครั้งที่ 2 (25 ก.ย. 2569)</span>
            </Link>
            <Link
              to="/documents"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#1356A3]" />
              <span>คลังเอกสาร R2 (46 ฉบับ)</span>
            </Link>
          </div>
        </div>

        {/* Team Collaboration Structure Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team 1: Public Sector (4 Experts) */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#062B63] text-white flex items-center justify-center font-bold text-sm">
                  🏛️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#062B63]">ทีมวิชาการและกฎหมายภาครัฐ (4 ท่าน)</h3>
                  <p className="text-[11px] text-blue-700 font-medium">ระเบียบกองทุน ววน., กฎหมายมหาชน, พัสดุและการเงิน</p>
                </div>
              </div>
              <span className="text-[11px] font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                4 ท่าน
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="font-bold text-slate-900 block">นพ.เฉลิมเกียรติ (สวรส.)</span>
                <span className="text-slate-500">ม.58 / บอร์ด กสว.</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="font-bold text-slate-900 block">อ.กานต์กุญช์ (มฟล.)</span>
                <span className="text-slate-500">ระเบียบ FF/SF & IP</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="font-bold text-slate-900 block">อ.นภวัฒน์ (มฟล.)</span>
                <span className="text-slate-500">ลำดับศักดิ์ พ.ร.บ. 2568</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                <span className="font-bold text-slate-900 block">ผศ.ดร.กนกพร (ม.บูรพา)</span>
                <span className="text-slate-500">การเงินพัสดุวิจัย</span>
              </div>
            </div>
          </div>

          {/* Team 2: Private Sector & Investment (2 Experts) */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 border border-amber-200 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F36C21] text-white flex items-center justify-center font-bold text-sm">
                  🏢
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950">ทีมกฎหมายเอกชน & การลงทุน (2 ท่าน)</h3>
                  <p className="text-[11px] text-amber-800 font-medium">ร่วมลงทุน Joint Venture, Startup/Deep Tech, HRD Modules</p>
                </div>
              </div>
              <span className="text-[11px] font-bold font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                2 ท่าน
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                <span className="font-bold text-slate-900 block">คุณธนา & คุณเอ๋</span>
                <span className="text-slate-500">กฎหมายธุรกิจ / SPV / JV</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                <span className="font-bold text-slate-900 block">คุณบัณฑิตา (KBTG)</span>
                <span className="text-slate-500">Learning & Assessment</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Status KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
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
              <span className="font-mono text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">รับรองครบถ้วน</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono">{validatedCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">รับรองและมีฉันทามติครบถ้วน</p>
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
              <span className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">รอความเห็น/ฉันทามติ</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-600 font-mono">{pendingExpertCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">อยู่ระหว่างร่วมพิจารณา</p>
          </div>

          {/* Card 4: SOURCE NOT VERIFIED */}
          <div
            onClick={() =>
              setSelectedStatusFilter(selectedStatusFilter === 'SOURCE_NOT_VERIFIED' ? 'ALL' : 'SOURCE_NOT_VERIFIED')
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

        {/* Team & Expert Workspace Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#1356A3]" />
              <span>ตัวกรองการแสดงผล (Collaborative Multi-Review Filter)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTeamFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedTeamFilter === 'ALL' ? 'bg-[#062B63] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                ทั้งหมด (All Teams)
              </button>
              <button
                onClick={() => setSelectedTeamFilter('PUBLIC_SECTOR')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedTeamFilter === 'PUBLIC_SECTOR' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                }`}
              >
                🏛️ ทีมภาครัฐ (4 ท่าน)
              </button>
              <button
                onClick={() => setSelectedTeamFilter('PRIVATE_SECTOR')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedTeamFilter === 'PRIVATE_SECTOR' ? 'bg-[#F36C21] text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                🏢 ทีมเอกชน (2 ท่าน)
              </button>
            </div>
          </div>

          {/* Expert Individual Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedRoleFilter === 'ALL' ? 'bg-[#062B63] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👑 ทุกเจ้าภาพ / PM View
            </button>
            {allAdvisorsList.map((adv) => (
              <button
                key={adv.id}
                onClick={() => setSelectedRoleFilter(adv.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  selectedRoleFilter === adv.id
                    ? adv.team === 'PUBLIC_SECTOR'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-amber-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{adv.name}</span>
                <span className="text-[10px] opacity-80 font-normal hidden lg:inline">({adv.teamLabel})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Review Items List Header & Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1356A3]" />
              รายการประเด็นกฎหมายและการตรวจทานร่วม (Collaborative Review Checklist)
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              แสดง {displayedItems.length} จากทั้งหมด {batchItems.length} ประเด็นใน {activeBatch.batch_number}
            </div>
          </div>

          {(selectedStatusFilter !== 'ALL' || selectedTeamFilter !== 'ALL' || selectedRoleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedStatusFilter('ALL');
                setSelectedTeamFilter('ALL');
                setSelectedRoleFilter('ALL');
              }}
              className="text-xs text-[#F36C21] font-bold hover:underline flex items-center gap-1"
            >
              ล้างตัวกรองทั้งหมด <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Review Items Cards with Multi-Perspective Trails */}
        <div className="space-y-4">
          {displayedItems.map((item) => {
            const statusInfo = VERIFICATION_STATUS_BADGES[item.status];
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Code, Title, Description, Lead Owner */}
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
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#1356A3]" />
                        {item.evidence_records.length} ความเห็น/หลักฐาน
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>

                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 leading-relaxed">
                      <span className="font-bold text-slate-900">ประเด็นที่ต้องตรวจสอบ: </span>
                      {item.issue_description}
                    </div>

                    {/* Lead Expert Badge & Co-Reviewers */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs pt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl">
                        <Award className="w-3.5 h-3.5 text-[#1356A3]" />
                        <span>เจ้าภาพหลัก: {item.assigned_expert_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-200/70 text-blue-900 rounded">
                          {item.lead_team === 'PRIVATE_SECTOR' ? '🏢 เอกชน' : '🏛️ ภาครัฐ'}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-[#062B63] font-semibold text-slate-600">
                        <FileText className="w-3.5 h-3.5" /> {item.article_section} (หน้า {item.page_number})
                      </span>

                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5" /> กำหนดส่ง: {formatThaiDate(item.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: Co-Review & Validate Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleOpenReviewModal(item, 'SUPPORTING')}
                      className="px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F36C21]" />
                      <span>+ ร่วมให้ความเห็น / แนบหลักฐาน</span>
                    </button>

                    {item.status !== 'VALIDATED' && (
                      <button
                        onClick={() => handleValidateItem(item)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>อนุมัติรับรอง (PM Validate)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence Records & Collaborative Perspectives */}
                {item.evidence_records.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>ความเห็นและหลักฐานทางกฎหมาย ({item.evidence_records.length} ความเห็น)</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        เปรียบเทียบมุมมองภาครัฐ vs เอกชน vs มติ PM
                      </span>
                    </div>

                    <div className="space-y-3">
                      {item.evidence_records.map((evd) => {
                        const opinionBadge = REVIEW_OPINION_BADGES[evd.opinion_type || 'LEAD_FINDING'];
                        const isPrivate = evd.reviewer_team === 'PRIVATE_SECTOR';
                        const isPM = evd.reviewer_team === 'PM_OFFICE';

                        return (
                          <div
                            key={evd.id}
                            className={`rounded-2xl p-4 text-xs space-y-2 border ${
                              isPM
                                ? 'bg-purple-50/80 border-purple-200 ring-1 ring-purple-300/30'
                                : isPrivate
                                ? 'bg-amber-50/60 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${opinionBadge.class}`}>
                                  {opinionBadge.label}
                                </span>
                                <span className="font-bold text-slate-900">{evd.reviewer_name}</span>
                                <span className="text-slate-500 text-[11px]">({evd.reviewer_role})</span>
                              </div>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {formatThaiDateTime(evd.review_date)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                              <div>
                                <span className="font-bold text-slate-900">คำวินิจฉัย / เหตุผลประกอบ: </span>
                                <p className="mt-0.5 text-slate-600 leading-relaxed">{evd.rationale}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">ผลกระทบต่อ TOR / REQ: </span>
                                <p className="mt-0.5 text-slate-600 leading-relaxed">{evd.requirement_impact}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                              <span>
                                เอกสารอ้างอิง: <strong className="text-slate-800">{evd.doc_id_ref}</strong> • {evd.edition_used}
                              </span>
                              {evd.evidence_file_name && (
                                <span className="flex items-center gap-1.5 text-[#1356A3] font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                  <Paperclip className="w-3.5 h-3.5 text-[#F36C21]" />
                                  {evd.evidence_file_name} ({formatFileSize(evd.evidence_file_size || 1500000)})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {displayedItems.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 text-sm">ไม่พบรายการประเด็นตรวจทานที่ตรงกับตัวกรอง</p>
              <p className="text-xs text-slate-500 mt-1">กรุณาเลือกตัวกรองทีมหรือสถานะอื่น</p>
            </div>
          )}
        </div>

        {/* Modal Form: Collaborative Evidence Submission */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F36C21]">
                    COLLABORATIVE REVIEW SUBMISSION • {activeModalItem.item_code}
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    บันทึกผลการตรวจทานร่วมและหลักฐาน (Multi-Expert Review)
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
                    เอกสาร: {activeModalItem.document_code} (v{activeModalItem.document_version_number}) • เจ้าภาพหลัก: {activeModalItem.assigned_expert_name}
                  </div>
                </div>

                {/* Reviewer Identity Selector */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ผู้ให้ความเห็น / สังกัดทีม <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={evidenceForm.reviewer_id}
                    onChange={(e) => {
                      const selected = allAdvisorsList.find((a) => a.id === e.target.value);
                      if (selected) {
                        setEvidenceForm({
                          ...evidenceForm,
                          reviewer_id: selected.id,
                          reviewer_name: selected.name,
                          reviewer_role: selected.role,
                          reviewer_team: selected.team,
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  >
                    <optgroup label="🏛️ ทีมวิชาการและกฎหมายภาครัฐ (4 ท่าน)">
                      {allAdvisorsList
                        .filter((a) => a.team === 'PUBLIC_SECTOR')
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} — {a.role}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🏢 ทีมกฎหมายภาคเอกชน & การลงทุน (2 ท่าน)">
                      {allAdvisorsList
                        .filter((a) => a.team === 'PRIVATE_SECTOR')
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} — {a.role}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Opinion Type Selector */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ประเภทความเห็น (Opinion Type) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, opinion_type: 'SUPPORTING' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.opinion_type === 'SUPPORTING'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> เห็นพ้อง / สนับสนุน
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, opinion_type: 'ALTERNATIVE_VIEW' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.opinion_type === 'ALTERNATIVE_VIEW'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> ความเห็นต่าง/ข้อสังเกต
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, opinion_type: 'LEAD_FINDING' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.opinion_type === 'LEAD_FINDING'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" /> ผลตรวจเจ้าภาพหลัก
                    </button>
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
                    ข้อเสนอแนะสถานะ (Recommended Verification Status) <span className="text-rose-500">*</span>
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
                    คำวินิจฉัย / เหตุผลทางวิชาการและกฎหมาย <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="ระบุเหตุผล ข้อสังเกต หรือข้อเสนอแนะเชิงกฎหมายและธุรกิจ..."
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
                    placeholder="เช่น ส่งผลต่อ Inception Report (DEL-01) และข้อเสนอเชิงนโยบาย (DEL-04)"
                    value={evidenceForm.requirement_impact}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, requirement_impact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>

                {/* Evidence File Attachment */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ไฟล์เอกสารหลักฐานแนบ (Cloudflare R2 Storage Vault)
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-600">
                    <Paperclip className="w-4 h-4 text-[#F36C21]" />
                    <span className="font-mono text-slate-800 font-bold">{evidenceForm.evidence_file_name}</span>
                    <span className="text-[10px] text-slate-500 ml-auto bg-white px-2 py-0.5 rounded border border-slate-200">
                      Auto-Linked R2 Key
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
                    <Send className="w-4 h-4 text-[#F36C21]" />
                    <span>บันทึกความเห็นเข้าสู่ระบบ</span>
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
