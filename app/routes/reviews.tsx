import { useState, useEffect, useCallback } from 'react';
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
  PmDispositionType,
  PM_DISPOSITION_BADGES,
} from '~/types';
import { useRequireAuth } from '~/lib/use-auth';
import {
  fetchReviewsFromSupabase,
  submitExpertEvidenceToSupabase,
  submitPmDispositionToSupabase,
} from '~/lib/reviews.supabase';
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
  Gavel,
  History,
  FileCheck,
  Bookmark,
  RefreshCw,
  Database,
  Crown,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime, formatFileSize } from '~/lib/utils';

export const clientLoader = async () => {
  return {
    batches: [] as ReviewBatch[],
    items: [] as ReviewItem[],
    team: mockTeamMembers,
  };
};

export default function ReviewsRoute() {
  const { user, profile, role, isAdminOrPm, isLoading: isAuthLoading, isAuthenticated } = useRequireAuth('/login?returnTo=/reviews');
  const { batches: initialBatches, items: initialItems } = useLoaderData<typeof clientLoader>();

  const [batches, setBatches] = useState<ReviewBatch[]>(initialBatches);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialItems);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-01');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<'ALL' | 'PUBLIC_SECTOR' | 'PRIVATE_SECTOR'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL'); // 'ALL' or expert ID
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL'); // 'ALL' or VerificationStatus

  // Loading, Submitting & Error States for Supabase
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [activeModalItem, setActiveModalItem] = useState<ReviewItem | null>(null);
  const [activePmModalItem, setActivePmModalItem] = useState<ReviewItem | null>(null);

  // Form State for Permanent Expert Audit Response
  const [evidenceForm, setEvidenceForm] = useState<{
    reviewer_id: string;
    reviewer_name: string;
    reviewer_role: string;
    reviewer_team: AdvisorTeamGroup;
    opinion_type: ReviewOpinionType;
    vi_code: string;
    doc_code_ref: string;
    document_version_id: string;
    article_section: string;
    page_number: number;
    edition_used: string;
    rationale: string;
    requirement_impact: string;
    recommended_status: VerificationStatus;
    evidence_file_name: string;
  }>({
    reviewer_id: '',
    reviewer_name: '',
    reviewer_role: '',
    reviewer_team: 'PUBLIC_SECTOR',
    opinion_type: 'LEAD_FINDING',
    vi_code: '',
    doc_code_ref: '',
    document_version_id: '',
    article_section: '',
    page_number: 1,
    edition_used: '',
    rationale: '',
    requirement_impact: '',
    recommended_status: 'EXPERT_VALIDATION_REQUIRED',
    evidence_file_name: '',
  });

  // Form State for PM Disposition
  const [pmForm, setPmForm] = useState<{
    pm_disposition: PmDispositionType;
    pm_disposition_note: string;
    pm_action_items: string;
  }>({
    pm_disposition: 'ACCEPTED_AS_IS',
    pm_disposition_note: '',
    pm_action_items: '',
  });

  // Load live data from Supabase (Strict: No mock fallback)
  const loadSupabaseData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const result = await fetchReviewsFromSupabase();
      setBatches(result.batches);
      setReviewItems(result.items);
      if (result.batches.length > 0 && !result.batches.some((b) => b.id === selectedBatchId)) {
        setSelectedBatchId(result.batches[0].id);
      }
      return result;
    } catch (err: any) {
      console.error('Failed to load reviews from Supabase:', err);
      const errMsg = err.message || 'ไม่สามารถโหลดข้อมูลจาก Supabase ได้';
      setFetchError(errMsg);
      setBatches([]);
      setReviewItems([]);
      throw new Error(errMsg);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSupabaseData().catch((err) => {
        console.warn('Initial data load warning:', err.message);
      });
    }
  }, [isAuthenticated, loadSupabaseData]);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#062B63] animate-spin" />
          <div className="text-xs font-semibold text-slate-500">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน Expert Review Center...</div>
        </div>
      </div>
    );
  }

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  // Calculate Batch Statistics
  const batchItems = reviewItems.filter((item) => item.batch_id === activeBatch?.id || item.batch_id === 'batch-01');
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

  // Open modal handler for Expert Permanent Audit Response
  const handleOpenReviewModal = (item: ReviewItem, defaultOpinion: ReviewOpinionType = 'SUPPORTING') => {
    setActiveModalItem(item);
    setSubmitError(null);
    setEvidenceForm({
      reviewer_id: user?.id || item.assigned_expert_id || '',
      reviewer_name: profile?.full_name || user?.user_metadata?.full_name || user?.email || item.assigned_expert_name || 'ผู้เชี่ยวชาญ',
      reviewer_role: profile?.organization || (item.assigned_category === 'ADVISORY_PRIVATE' ? 'ที่ปรึกษากฎหมายภาคเอกชน' : 'ที่ปรึกษากฎหมายภาครัฐ'),
      reviewer_team: item.lead_team || 'PUBLIC_SECTOR',
      opinion_type: defaultOpinion,
      vi_code: item.vi_code || item.item_code,
      doc_code_ref: `${item.document_code || 'DOC'} v${item.document_version_number || '1.0'}`,
      document_version_id: item.document_version_id || '00000000-0000-0000-0000-000000000001',
      article_section: item.article_section || '',
      page_number: item.page_number || 1,
      edition_used: 'ราชกิจจานุเบกษา / ระเบียบฉบับประกาศทางการ',
      rationale: '',
      requirement_impact: '',
      recommended_status: item.status === 'VALIDATED' ? 'VALIDATED' : 'EXPERT_VALIDATION_REQUIRED',
      evidence_file_name: `EVD_${item.item_code}_${defaultOpinion}_Memo.pdf`,
    });
  };

  // Open modal handler for PM Disposition
  const handleOpenPmModal = (item: ReviewItem) => {
    setActivePmModalItem(item);
    setSubmitError(null);
    const actionItemsString = Array.isArray(item.pm_action_items)
      ? item.pm_action_items.join('\n')
      : typeof item.pm_action_items === 'string'
      ? item.pm_action_items
      : '';
    setPmForm({
      pm_disposition: item.pm_disposition || 'ACCEPTED_AS_IS',
      pm_disposition_note: item.pm_disposition_note || '',
      pm_action_items: actionItemsString,
    });
  };

  // Submit Evidence handler (Permanent Immutable Audit Trail - Anti Auto-Validate Rule)
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitExpertEvidenceToSupabase(activeModalItem, {
        ...evidenceForm,
        reviewer_id: user?.id || evidenceForm.reviewer_id,
        reviewer_name: profile?.full_name || user?.user_metadata?.full_name || evidenceForm.reviewer_name,
      });

      // 1. Refetch live data first
      await loadSupabaseData();

      // 2. Only close modal and show success notification AFTER refetch succeeds
      setActiveModalItem(null);
      setFeedbackMessage({
        type: 'success',
        message: `บันทึกระเบียนถาวรข้อ ${activeModalItem.vi_code || activeModalItem.item_code} สำเร็จ และซิงก์ข้อมูลลงฐานข้อมูลเรียบร้อย`,
      });
    } catch (err: any) {
      console.error('Evidence submission error:', err);
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล Supabase');
      // DO NOT show success or close modal
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit PM Disposition Handler (Atomic Transaction with Refetch-before-Success)
  const handleSubmitPmDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePmModalItem) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const actionItemsList = pmForm.pm_action_items
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await submitPmDispositionToSupabase(activePmModalItem, {
        pm_disposition: pmForm.pm_disposition,
        pm_disposition_note: pmForm.pm_disposition_note,
        pm_action_items: actionItemsList,
        pm_name: profile?.full_name || user?.user_metadata?.full_name || 'ผู้จัดการโครงการ (PM)',
        pm_id: user?.id || '',
      });

      // 1. Refetch live data first
      await loadSupabaseData();

      // 2. Only close modal and show success notification AFTER refetch succeeds
      setActivePmModalItem(null);
      setFeedbackMessage({
        type: 'success',
        message: `บันทึกมติและการสั่งการ PM สำหรับข้อ ${activePmModalItem.vi_code || activePmModalItem.item_code} สำเร็จ`,
      });
    } catch (err: any) {
      console.error('PM Disposition submission error:', err);
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการบันทึกมติ PM ลงฐานข้อมูล');
      // DO NOT show success or close modal
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7 Advisors info for selection (Sections 13.2 & 13.3)
  const allAdvisorsList = [
    {
      id: 'adv-01',
      name: 'ผศ.ดร. มารุต ตั้งวัฒนาชุลีพร',
      role: 'รองอธิการบดี ม.บูรพา / ที่ปรึกษากฎหมาย & บอร์ด กสว. (ม.58)',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ม.58 / บอร์ด กสว.)',
    },
    {
      id: 'adv-02',
      name: 'นายกานต์กุญช์ บำรุงชาติ',
      role: 'หน.ส่วนบริหารงานวิจัย & IP มฟล. / ที่ปรึกษากองทุน ววน. (FF/SF)',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ระเบียบ FF/SF & IP)',
    },
    {
      id: 'adv-03',
      name: 'อ.นภวัฒน์ สืบนุสรณ์',
      role: 'อาจารย์ประจำสำนักวิชานิติศาสตร์ มฟล. (ลำดับศักดิ์ พ.ร.บ. 2568)',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (ลำดับศักดิ์ พ.ร.บ. 2568)',
    },
    {
      id: 'adv-04',
      name: 'ผศ.ดร.กนกพร ศรีสุจริตพานิช',
      role: 'รองคณบดีฝ่ายบริหาร ม.บูรพา (การเงินพัสดุวิจัย & ทรัพยากร)',
      team: 'PUBLIC_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏛️ ภาครัฐ (การเงินพัสดุ & กำลังคน)',
    },
    {
      id: 'adv-05',
      name: 'คุณธนา & คุณเอ๋',
      role: 'ที่ปรึกษากฎหมายธุรกิจ นิติกรรมสัญญา และการร่วมลงทุนภาคเอกชน',
      team: 'PRIVATE_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🏢 ภาคเอกชน (Private Law & JV)',
    },
    {
      id: 'adv-06',
      name: 'คุณบัณฑิตา พละพงศ์',
      role: 'Head of Learning Academy, KBTG / ที่ปรึกษา HRD',
      team: 'PRIVATE_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🎓 HRD (Learning Architecture & KM)',
    },
    {
      id: 'adv-07',
      name: 'คุณซัน',
      role: 'ที่ปรึกษาด้านการออกแบบโมดูลพัฒนาผู้บริหารทุกระดับ',
      team: 'PRIVATE_SECTOR' as AdvisorTeamGroup,
      teamLabel: '🎓 HRD (Executive Modules & Scenario Assessment)',
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
                โครงสร้าง 3 คณะทำงาน (Kick-off MOM 13.1 - 13.4)
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

        {/* Supabase Live DB Synchronized Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SUPABASE DB
            </div>
            <span className="text-slate-300">
              เชื่อมต่อระเบียนถาวร PostgreSQL ({reviewItems.length} ประเด็น • {reviewItems.reduce((acc, i) => acc + i.evidence_records.length, 0)} ระเบียนถาวร)
            </span>
          </div>
          <button
            onClick={() => loadSupabaseData()}
            disabled={isLoadingData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-[#F36C21]' : ''}`} />
            <span>{isLoadingData ? 'กำลังซิงก์...' : 'โหลดข้อมูลล่าสุด'}</span>
          </button>
        </div>

        {/* Global Toast / Feedback Notification */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fade-in ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMessage.message}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fetch Error Alert */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={() => loadSupabaseData()}
              className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* 13.4 Workflow Principle Banner */}
        <div className="bg-gradient-to-r from-[#062B63] via-[#1356A3] to-[#0A3D7C] text-white p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F36C21]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                13.4 หลักการทำงานร่วมกันของทั้ง 3 ทีม (Integrated Collaborative Workflow)
              </span>
            </div>
            <span className="text-xs font-bold text-white/90 bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
              “ทีมบริหารเป็นเจ้าภาพงาน — ทีมที่ปรึกษารับรองความถูกต้อง — ทีม HRD ทำให้ความรู้ถูกนำไปใช้ได้จริง”
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="font-extrabold text-amber-300 block mb-1">1. ทีมบริหารโครงการ (Core PM)</span>
              <span className="text-[11px] text-white/85 leading-relaxed">
                รวบรวมข้อมูล → จัดทำ Draft → ประสานงาน สกสว. & Timeline
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="font-extrabold text-blue-200 block mb-1">2. ทีมที่ปรึกษากฎหมาย (Advisors)</span>
              <span className="text-[11px] text-white/85 leading-relaxed">
                ตรวจสอบ → วิเคราะห์ลำดับศักดิ์ → ให้ข้อเสนอแนะ → ยืนยันความถูกต้อง
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="font-extrabold text-emerald-300 block mb-1">3. ทีม HRD (Learning Team)</span>
              <span className="text-[11px] text-white/85 leading-relaxed">
                แปลงความรู้ → Knowledge Matrix → พัฒนาสื่อ 15 คลิป & ข้อสอบ 12 ชุด
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <span className="font-extrabold text-purple-200 block mb-1">4. ร่วม Review & ส่งมอบ</span>
              <span className="text-[11px] text-white/85 leading-relaxed">
                ทั้ง 3 ทีมร่วม Review ฉันทามติ → PM จัดทำ Final Deliverables (DEL-01–04)
              </span>
            </div>
          </div>
        </div>

        {/* Team Collaboration Structure Details (13.1, 13.2, 13.3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Team 1: PM Core (4 Members) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#062B63] text-white flex items-center justify-center font-bold text-sm">
                    👑
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#062B63]">13.1 ทีมบริหารโครงการ (Core PM)</h3>
                    <p className="text-[11px] text-slate-500 font-medium">ศูนย์กลางประสานงานและส่งมอบ TOR</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                  4 ท่าน
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">คุณไกรพุฒิ (ไนท์)</span>
                  <span className="text-slate-500">Project Director & Strategic Risk Lead</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">นายอนุสรณ์ (เด่น)</span>
                  <span className="text-slate-500">PM & Learning Architect Lead</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">ดร.หนึ่งนิดา (ต้นหลิว)</span>
                  <span className="text-slate-500">Co-PM / Research & Qualitative Process</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">คุณเบนซ์</span>
                  <span className="text-slate-500">Project Coordinator & Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team 2: Advisory Legal (4 Public + 2 Private) */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1356A3] text-white flex items-center justify-center font-bold text-sm">
                    ⚖️
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#062B63]">13.2 ทีมที่ปรึกษากฎหมาย & วิชาการ</h3>
                    <p className="text-[11px] text-blue-700 font-medium">ตรวจทานลำดับศักดิ์, ระเบียบกองทุน, ร่วมลงทุน</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                  กลุ่ม 1 + 2
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">ผศ.ดร. มารุต (ปุ่น)</span>
                  <span className="text-slate-500">ม.58 / บอร์ด กสว.</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">อ.กานต์กุญช์ (บอย)</span>
                  <span className="text-slate-500">ระเบียบ FF/SF & IP</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">อ.นภวัฒน์ (มะตูม)</span>
                  <span className="text-slate-500">ลำดับศักดิ์ พ.ร.บ. 2568</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-slate-900 block">ผศ.ดร.กนกพร (อู๋)</span>
                  <span className="text-slate-500">การเงินพัสดุวิจัย</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100 col-span-2">
                  <span className="font-bold text-slate-900 block">คุณธนา & คุณเอ๋ (เอกชน)</span>
                  <span className="text-slate-500">กฎหมายธุรกิจ / SPV / Joint Venture</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team 3: HRD & Learning Design (2 Experts) */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 border border-amber-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F36C21] text-white flex items-center justify-center font-bold text-sm">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-amber-950">13.3 ทีมที่ปรึกษา HRD & KM</h3>
                    <p className="text-[11px] text-amber-800 font-medium">Knowledge Matrix, วิดีโอ 15 คลิป, ข้อสอบ 12 ชุด</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                  กลุ่ม 3
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-bold text-slate-900 block">คุณบัณฑิตา พละพงศ์ (แอ๋ม - KBTG)</span>
                  <span className="text-slate-500">Knowledge Matrix, KM Platform & Infographics</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-bold text-slate-900 block">คุณซัน (Executive Development)</span>
                  <span className="text-slate-500">ชุดสื่อวิดีโอ 15 คลิป & Scenario Assessment 12 ชุด</span>
                </div>
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
        <div className="space-y-6">
          {displayedItems.map((item) => {
            const statusInfo = VERIFICATION_STATUS_BADGES[item.status];
            const pmDispInfo = PM_DISPOSITION_BADGES[item.pm_disposition || 'PENDING_REVIEW'];

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header Row: Codes, Status Badges, PM Disposition Badge */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: VI-ID, Item Code, Document Ref, Version ID, Title */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-lg flex items-center gap-1 shadow-2xs">
                        <Bookmark className="w-3 h-3 text-[#F36C21]" />
                        VI: {item.vi_code || item.item_code}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#1356A3] text-white rounded-lg">
                        {item.item_code}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                        DOC: {item.document_code} (v{item.document_version_number})
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
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${pmDispInfo.class}`}
                      >
                        ⚖️ PM: {pmDispInfo.label}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1">
                        <History className="w-3 h-3 text-[#1356A3]" />
                        {item.evidence_records.length} ระเบียนถาวร
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>

                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 leading-relaxed">
                      <span className="font-bold text-slate-900">ประเด็นที่ต้องตรวจสอบ: </span>
                      {item.issue_description}
                    </div>

                    {/* Metadata: Lead Expert, Section, Page, Due Date, Doc Version UUID */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs pt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl">
                        <Award className="w-3.5 h-3.5 text-[#1356A3]" />
                        <span>เจ้าภาพหลัก: {item.assigned_expert_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-200/70 text-blue-900 rounded">
                          {item.lead_team === 'PRIVATE_SECTOR' ? '🏢 เอกชน' : '🏛️ ภาครัฐ'}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-[#062B63] font-semibold">
                        <FileText className="w-3.5 h-3.5 text-[#1356A3]" /> {item.article_section} (หน้า {item.page_number})
                      </span>

                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5" /> กำหนดส่ง: {formatThaiDate(item.due_date)}
                      </span>

                      {item.document_version_id && (
                        <span className="text-[10px] font-mono text-slate-400">
                          UUID: {item.document_version_id.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Add Expert Evidence & PM Disposition Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleOpenReviewModal(item, 'SUPPORTING')}
                      className="px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F36C21]" />
                      <span>+ บันทึกความเห็นผู้เชี่ยวชาญ</span>
                    </button>

                    <button
                      onClick={() => handleOpenPmModal(item)}
                      className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Gavel className="w-4 h-4 text-purple-700" />
                      <span>มติและการสั่งการ PM (Disposition)</span>
                    </button>
                  </div>
                </div>

                {/* SEPARATE PANEL: PM Disposition & Governance Decisions */}
                <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 border border-purple-200/80 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs">
                        ⚖️
                      </div>
                      <div>
                        <span className="font-extrabold text-purple-950">ช่องคำสั่งการและมติ PM (PM Disposition)</span>
                        <span className="text-[11px] text-purple-700 ml-2 font-medium">
                          (แยกส่วนจากการให้ความเห็นผู้เชี่ยวชาญ)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${pmDispInfo.class}`}>
                        {pmDispInfo.label}
                      </span>
                      {item.pm_disposition_at && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatThaiDateTime(item.pm_disposition_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">เหตุผลและมติที่ประชุม PM: </span>
                      <span className="text-slate-800 leading-relaxed font-medium">
                        {item.pm_disposition_note || 'ยังไม่มีการลงมติจาก PM (รอการพิจารณาร่วม)'}
                      </span>
                    </div>

                    {item.pm_disposition_by && (
                      <div className="text-[11px] text-slate-500">
                        ผู้บันทึกมติ: <strong className="text-slate-700">{item.pm_disposition_by}</strong>
                      </div>
                    )}

                    {Array.isArray(item.pm_action_items) && item.pm_action_items.length > 0 && (
                      <div className="pt-1.5 border-t border-purple-100 flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-purple-900 text-[11px]">Action Items:</span>
                        {item.pm_action_items.map((act: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white border border-purple-200 text-purple-800 rounded-md text-[11px] font-medium"
                          >
                            ✓ {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Permanent Expert Responses & Evidence Records Trail */}
                {item.evidence_records.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#1356A3]" />
                        <span>ระเบียนความเห็นถาวรของผู้เชี่ยวชาญ (Permanent Expert Responses)</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono border border-slate-200">
                          {item.evidence_records.length} Records
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Immutable Audit Trail (อ้างอิง VI-ID, DOC-ID, Version, Rationale & Time)</span>
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
                            className={`rounded-2xl p-4 text-xs space-y-2 border transition ${
                              isPM
                                ? 'bg-purple-50/80 border-purple-200 ring-1 ring-purple-300/30'
                                : isPrivate
                                ? 'bg-amber-50/60 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {/* Card Header: Opinion Badge, Reviewer Info, Submitted At, Lock Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${opinionBadge.class}`}>
                                  {opinionBadge.label}
                                </span>
                                <span className="font-bold text-slate-900">{evd.reviewer_name}</span>
                                <span className="text-slate-500 text-[11px]">({evd.reviewer_role})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5 text-emerald-600" /> ถาวร
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                  {formatThaiDateTime(evd.submitted_at || evd.review_date)}
                                </span>
                              </div>
                            </div>

                            {/* Reference Bar: VI-ID, DOC-ID, Version ID, Section, Page */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-200/60 font-mono">
                              <span className="font-bold text-[#062B63]">
                                VI-ID: <span className="font-normal">{evd.vi_code || item.vi_code || item.item_code}</span>
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-bold text-[#1356A3]">
                                DOC-ID: <span className="font-normal">{evd.doc_id_ref}</span>
                              </span>
                              <span className="text-slate-300">|</span>
                              <span>
                                Version: <span className="font-bold text-slate-800">{evd.document_version_id ? evd.document_version_id.substring(0, 8) + '...' : 'v1.0'}</span>
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-bold text-slate-800 font-sans">
                                มาตรา/ข้อ: {evd.article_section || '-'} (หน้า {evd.page_number || '-'})
                              </span>
                            </div>

                            {/* Rationale & TOR Impact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 pt-1">
                              <div>
                                <span className="font-bold text-slate-900">คำวินิจฉัย / เหตุผลประกอบ (Rationale): </span>
                                <p className="mt-0.5 text-slate-700 leading-relaxed font-medium">{evd.rationale}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">ผลกระทบต่อ TOR / REQ: </span>
                                <p className="mt-0.5 text-slate-600 leading-relaxed">{evd.requirement_impact}</p>
                              </div>
                            </div>

                            {/* Recommended Status & Evidence File */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <span>ฉบับที่เทียบ: <strong className="text-slate-800">{evd.edition_used}</strong></span>
                                <span className="text-slate-300">•</span>
                                <span>
                                  ข้อเสนอแนะสถานะ: <strong className="text-[#062B63] font-bold">{evd.recommended_status || evd.resulting_status}</strong>
                                </span>
                              </div>
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

        {/* Modal Form 1: Permanent Expert Audit Response Submission */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F36C21] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#F36C21]" />
                    PERMANENT EXPERT AUDIT RESPONSE • {activeModalItem.vi_code || activeModalItem.item_code}
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    บันทึกระเบียนความเห็นผู้เชี่ยวชาญถาวร (Permanent Expert Response)
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
                {/* Notice: Permanent Record & Anti Auto-Validate Rule */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-blue-900">
                  <Info className="w-4 h-4 text-[#1356A3] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[11px] leading-relaxed">
                    <span className="font-extrabold block">กฎความปลอดภัยของระเบียนถาวร (Audit Integrity):</span>
                    <span>
                      คำตอบและความเห็นนี้จะถูกบันทึกเป็น <strong>ระเบียนถาวร (Permanent Record)</strong> อ้างอิง VI-ID, DOC-ID, Version ID และเวลาส่ง โดยจะไม่เปลี่ยนสถานะโครงการเป็น VALIDATED อัตโนมัติ จนกว่า PM จะพิจารณาลงมติ (PM Disposition)
                    </span>
                  </div>
                </div>

                {/* Item Info Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-slate-700 font-mono">
                  <div className="font-bold text-slate-900 text-sm font-sans">{activeModalItem.title}</div>
                  <div className="text-slate-600 font-sans">{activeModalItem.issue_description}</div>
                  <div className="text-[11px] text-[#1356A3] pt-1">
                    VI-ID: <strong>{activeModalItem.vi_code || activeModalItem.item_code}</strong> • DOC: <strong>{activeModalItem.document_code} (v{activeModalItem.document_version_number})</strong>
                  </div>
                </div>

                {/* Reviewer Identity (Bound to Authenticated Session) */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ผู้ให้ความเห็นและสังกัดทีม (ผูกกับบัญชี Session จริง) <span className="text-rose-500">*</span>
                  </label>
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#062B63] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {profile?.full_name || user?.user_metadata?.full_name || user?.email || 'ผู้เชี่ยวชาญ'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {profile?.organization || 'สกสว.'} • User ID: <span className="font-mono font-bold text-slate-700">{user?.id?.slice(0, 12)}...</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[11px] font-bold text-slate-600">กลุ่มทีม:</span>
                      <select
                        value={evidenceForm.reviewer_team}
                        onChange={(e) =>
                          setEvidenceForm({ ...evidenceForm, reviewer_team: e.target.value as AdvisorTeamGroup })
                        }
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#062B63] focus:ring-2 focus:ring-[#1356A3]"
                      >
                        <option value="PUBLIC_SECTOR">🏛️ ภาครัฐ (Public Sector)</option>
                        <option value="PRIVATE_SECTOR">🏢 ภาคเอกชน (Private Sector)</option>
                        <option value="PM_OFFICE">👑 สำนักงาน PM (PM Office)</option>
                      </select>
                    </div>
                  </div>
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

                {/* Target Recommended Verification Status Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ข้อเสนอแนะสถานะต่อ PM (Recommended Verification Status) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, recommended_status: 'VALIDATED' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.recommended_status === 'VALIDATED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> เสนอรับรอง (VALIDATED)
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, recommended_status: 'SOURCE_CONFLICT' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.recommended_status === 'SOURCE_CONFLICT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" /> พบข้อขัดแย้ง (CONFLICT)
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceForm({ ...evidenceForm, recommended_status: 'EXPERT_VALIDATION_REQUIRED' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        evidenceForm.recommended_status === 'EXPERT_VALIDATION_REQUIRED'
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
                    คำวินิจฉัย / เหตุผลทางวิชาการและกฎหมาย (Rationale) <span className="text-rose-500">*</span>
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

                {/* Submit Error Message */}
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

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
                    disabled={isSubmitting}
                    onClick={() => setActiveModalItem(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#062B63] hover:bg-[#1356A3] disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 text-[#F36C21] animate-spin" />
                        <span>กำลังบันทึกลง Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#F36C21]" />
                        <span>บันทึกระเบียนถาวรเข้าสู่ระบบ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Form 2: PM Disposition Modal */}
        {activePmModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
              {/* PM Modal Header */}
              <div className="p-5 border-b border-purple-200 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-amber-300" />
                    PM DISPOSITION & GOVERNANCE GATEWAY • {activePmModalItem.item_code}
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    บันทึกมติและการสั่งการของผู้จัดการโครงการ (PM Disposition)
                  </h3>
                </div>
                <button
                  onClick={() => setActivePmModalItem(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PM Modal Form Body */}
              <form onSubmit={handleSubmitPmDisposition} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Submit Error in PM Modal */}
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Item Info Summary Box */}
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-1 text-purple-950 font-sans">
                  <div className="font-bold text-slate-900 text-sm">{activePmModalItem.title}</div>
                  <div className="text-slate-600 text-xs">{activePmModalItem.issue_description}</div>
                  <div className="text-[11px] text-purple-800 font-mono pt-1">
                    VI-ID: <strong>{activePmModalItem.vi_code || activePmModalItem.item_code}</strong> • เจ้าภาพหลัก: {activePmModalItem.assigned_expert_name} ({activePmModalItem.lead_team === 'PRIVATE_SECTOR' ? 'ภาคเอกชน' : 'ภาครัฐ'})
                  </div>
                </div>

                {/* PM Authenticated User Identity */}
                <div className="p-3 bg-purple-100/60 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs text-purple-950">
                  <Crown className="w-4 h-4 text-purple-700 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      ผู้ลงมติ: {profile?.full_name || user?.user_metadata?.full_name || user?.email || 'PM Admin'} (PM / ผู้ดูแลโครงการ)
                    </span>
                    <span className="text-[11px] text-purple-700 font-mono">
                      Session UID: {user?.id}
                    </span>
                  </div>
                </div>

                {/* PM Disposition Type Selector */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    มติการสั่งการของ PM (PM Disposition Decision) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPmForm({ ...pmForm, pm_disposition: 'VALIDATED' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        pmForm.pm_disposition === 'VALIDATED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <div className="text-left">
                        <div>อนุมัติรับรองสมบูรณ์ (VALIDATED)</div>
                        <div className="text-[10px] opacity-80 font-normal">ผ่านเกณฑ์ Gate G2 บรรจุในรายงาน</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPmForm({ ...pmForm, pm_disposition: 'ACCEPTED_AS_IS' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        pmForm.pm_disposition === 'ACCEPTED_AS_IS'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      <div className="text-left">
                        <div>ยอมรับตามผลตรวจ (ACCEPTED AS IS)</div>
                        <div className="text-[10px] opacity-80 font-normal">ยอมรับผลตรวจโดยไม่ต้องปรับแก้</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPmForm({ ...pmForm, pm_disposition: 'ACCEPTED_WITH_CONDITIONS' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        pmForm.pm_disposition === 'ACCEPTED_WITH_CONDITIONS'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <div className="text-left">
                        <div>ยอมรับแบบมีเงื่อนไข (CONDITIONAL)</div>
                        <div className="text-[10px] opacity-80 font-normal">ต้องดำเนินการตาม Action Items</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPmForm({ ...pmForm, pm_disposition: 'REVISION_REQUESTED' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        pmForm.pm_disposition === 'REVISION_REQUESTED'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <div className="text-left">
                        <div>สั่งแก้ไขเพิ่มเติม (REVISION REQUIRED)</div>
                        <div className="text-[10px] opacity-80 font-normal">มีข้อขัดแย้งที่ต้องปรับแก้เอกสาร</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PM Disposition Note */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    บันทึกมติที่ประชุม / คำสั่งการของ PM (PM Disposition Note) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="ระบุมติที่ประชุม เหตุผลการรับรอง หรือข้อสั่งการในการปรับปรุงเอกสาร..."
                    value={pmForm.pm_disposition_note}
                    onChange={(e) => setPmForm({ ...pmForm, pm_disposition_note: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  ></textarea>
                </div>

                {/* PM Action Items */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    รายการงานมอบหมายเพิ่มเติม (Action Items) <span className="text-slate-400 font-normal">(แยก 1 บรรทัดต่อ 1 ข้อ)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="เช่น:&#10;เพิ่มเชิงอรรถเทียบเคียง พ.ร.บ. สภานโยบายฯ 2568&#10;แนบระเบียบ กสว. ว่าด้วยการร่วมลงทุนประกอบ Inception Report"
                    value={pmForm.pm_action_items}
                    onChange={(e) => setPmForm({ ...pmForm, pm_action_items: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  ></textarea>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setActivePmModalItem(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>กำลังบันทึกลง Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Gavel className="w-4 h-4 text-amber-400" />
                        <span>บันทึกมติ PM ลงในระบบ</span>
                      </>
                    )}
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
