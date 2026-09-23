export type UserRole =
  | 'project_admin'
  | 'pm'
  | 'researcher'
  | 'legal_advisor'
  | 'hrd'
  | 'stakeholder'
  | 'viewer';

export type ProjectGate = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';

export const GATE_DETAILS: Record<
  ProjectGate,
  { name: string; titleTh: string; description: string; color: string }
> = {
  G0: {
    name: 'Project Baseline',
    titleTh: 'G0: กำหนดกรอบโครงการและฐานข้อมูล',
    description: 'ยืนยันกรอบ TOR, ขอบเขตงาน, ทีมงาน และแผนงานหลัก',
    color: 'bg-slate-500 text-white',
  },
  G1: {
    name: 'Source Verification',
    titleTh: 'G1: ตรวจสอบความถูกต้องเอกสารต้นทาง',
    description: 'รวบรวมและตรวจสอบความถูกต้องของกฎหมาย ระเบียบ และคำสั่งต้นทาง',
    color: 'bg-blue-600 text-white',
  },
  G2: {
    name: 'Research Validation',
    titleTh: 'G2: กลั่นกรองผลการวิจัยเบื้องต้น',
    description: 'กลั่นกรองระเบียบวิธีวิจัยและผลการศึกษาเบื้องต้น',
    color: 'bg-indigo-600 text-white',
  },
  G3: {
    name: 'Analysis Validation',
    titleTh: 'G3: ตรวจสอบผลการวิเคราะห์ช่องว่าง',
    description: 'วิเคราะห์ Gap Analysis, ความสอดคล้องทางกฎหมาย และผลกระทบ',
    color: 'bg-amber-600 text-white',
  },
  G4: {
    name: 'Knowledge Validation',
    titleTh: 'G4: รับรองชุดองค์ความรู้และคู่มือ',
    description: 'สรุปองค์ความรู้, แนวปฏิบัติที่ดี (Best Practices) และคู่มือ',
    color: 'bg-purple-600 text-white',
  },
  G5: {
    name: 'Acceptance Readiness',
    titleTh: 'G5: เตรียมความพร้อมส่งมอบและตรวจรับ',
    description: 'ตรวจสอบความพร้อมส่งมอบงาน Deliverable ตาม TOR ครบ 100%',
    color: 'bg-emerald-600 text-white',
  },
  G6: {
    name: 'Release',
    titleTh: 'G6: ส่งมอบและเผยแพร่องค์ความรู้',
    description: 'อนุมัติการตรวจรับขั้นสุดท้ายและส่งมอบให้ สกสว. นำไปใช้งาน',
    color: 'bg-teal-700 text-white',
  },
};

export type DocumentPrefix =
  | 'LAW'
  | 'REG'
  | 'ANN'
  | 'RULE'
  | 'RES'
  | 'ORD'
  | 'GUIDE'
  | 'FORM'
  | 'TOR'
  | 'MOM'
  | 'REP'
  | 'REV'
  | 'EVD'
  | 'DEL';

export const DOCUMENT_PREFIX_LABELS: Record<DocumentPrefix, string> = {
  LAW: 'พระราชบัญญัติ / กฎหมายหลัก',
  REG: 'กฎกระทรวง / ระเบียบ',
  ANN: 'ประกาศ',
  RULE: 'ข้อบังคับ',
  RES: 'มติคณะกรรมการ / มติ ครม.',
  ORD: 'คำสั่ง',
  GUIDE: 'แนวปฏิบัติ / คู่มือ',
  FORM: 'แบบฟอร์ม',
  TOR: 'ขอบเขตของงาน / สัญญา (TOR)',
  MOM: 'บันทึกการประชุม (MOM)',
  REP: 'รายงานความก้าวหน้า / ฉบับสมบูรณ์',
  REV: 'เอกสารผลการตรวจพิจารณา',
  EVD: 'เอกสารหลักฐาน (Evidence)',
  DEL: 'ผลผลิตที่ส่งมอบ (Deliverable)',
};

export type DocumentStatus =
  | 'RAW'
  | 'INDEXED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'VALIDATED'
  | 'SUPERSEDED'
  | 'REPEALED'
  | 'ARCHIVED';

export const DOCUMENT_STATUS_BADGES: Record<
  DocumentStatus,
  { label: string; class: string }
> = {
  RAW: { label: 'ร่าง / เอกสารดิบ', class: 'bg-gray-100 text-gray-700 border-gray-300' },
  INDEXED: { label: 'จำแนกหมวดหมู่แล้ว', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'อยู่ระหว่างตรวจทาน', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'ตรวจสอบแล้ว', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  VALIDATED: { label: 'รับรองความถูกต้องแล้ว', class: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  SUPERSEDED: { label: 'ถูกยกเลิกโดยฉบับใหม่', class: 'bg-orange-50 text-orange-700 border-orange-200' },
  REPEALED: { label: 'ยกเลิก / สิ้นผล', class: 'bg-red-50 text-red-700 border-red-200' },
  ARCHIVED: { label: 'จัดเก็บถาวร', class: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export type WorkStatus =
  | 'BACKLOG'
  | 'IN_PROGRESS'
  | 'INTERNAL_REVIEW'
  | 'EXPERT_REVIEW'
  | 'REVISION'
  | 'VALIDATED'
  | 'ACCEPTANCE_REVIEW'
  | 'APPROVED'
  | 'RELEASED';

export const WORK_STATUS_BADGES: Record<
  WorkStatus,
  { label: string; class: string }
> = {
  BACKLOG: { label: 'รอดำเนินการ', class: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', class: 'bg-blue-100 text-blue-700' },
  INTERNAL_REVIEW: { label: 'ตรวจทานภายใน', class: 'bg-amber-100 text-amber-700' },
  EXPERT_REVIEW: { label: 'ผู้เชี่ยวชาญตรวจทาน', class: 'bg-purple-100 text-purple-700' },
  REVISION: { label: 'แก้ไขตามข้อเสนอแนะ', class: 'bg-rose-100 text-rose-700' },
  VALIDATED: { label: 'รับรองผลการวิจัย', class: 'bg-emerald-100 text-emerald-700' },
  ACCEPTANCE_REVIEW: { label: 'เตรียมตรวจรับ', class: 'bg-teal-100 text-teal-700' },
  APPROVED: { label: 'อนุมัติแล้ว', class: 'bg-green-100 text-green-800 font-semibold' },
  RELEASED: { label: 'ส่งมอบเผยแพร่', class: 'bg-cyan-100 text-cyan-800 font-semibold' },
};

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  organization: string;
  phone?: string;
  nickname?: string;
  role_title?: string;
}

export interface TeamMemberDetails {
  id: string;
  name: string;
  nickname?: string;
  roleTitle: string;
  teamCategory: 'CORE_PM' | 'ADVISORY_LEGAL' | 'ADVISORY_PRIVATE' | 'ADVISORY_HRD';
  teamCategoryName: string;
  organization: string;
  email?: string;
  avatarUrl?: string;
  expertise?: string;
  strategicFit?: string;
  mainResponsibilities: string[];
  specificConsultingTopics?: string[];
  deliverableLinks?: string[];
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description?: string;
  organization: string;
  current_gate: ProjectGate;
  start_date: string;
  end_date: string;
  baseline_budget: number;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  profile?: Profile;
  joined_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  code: string;
  title: string;
  description?: string;
  mandate_ref?: string;
  weight_percentage: number;
  due_date: string;
  gate_milestone: ProjectGate;
  status: WorkStatus;
  assigned_to?: string;
  assigned_profile?: Profile;
}

export interface DocumentItem {
  id: string;
  project_id: string;
  prefix_code: DocumentPrefix;
  document_code: string;
  title: string;
  category: string;
  issuing_body?: string;
  effective_date?: string;
  status: DocumentStatus;
  latest_version_number: string;
  tags: string[];
  is_confidential: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  versions?: DocumentVersionItem[];
}

export interface DocumentVersionItem {
  id: string;
  document_id: string;
  project_id: string;
  version_number: string;
  file_name: string;
  file_size_bytes: number;
  file_mime_type: string;
  storage_r2_key: string;
  storage_url?: string;
  checksum_sha256?: string;
  change_summary?: string;
  status: DocumentStatus;
  validated_by?: string;
  validated_at?: string;
  created_by?: string;
  creator_profile?: Profile;
  created_at: string;
}

export interface MeetingItem {
  id: string;
  project_id: string;
  meeting_number: string;
  title: string;
  agenda?: string;
  meeting_type: string;
  gate_ref?: ProjectGate;
  scheduled_at: string;
  duration_minutes: number;
  location_or_link?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  mom_document_version_id?: string;
  attendees_count?: number;
}

export interface ActivityLogItem {
  id: string;
  project_id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_table: string;
  entity_id: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ExecutiveDashboardData {
  project: Project;
  currentGate: ProjectGate;
  torCoveragePercentage: number;
  deliverablesProgress: {
    total: number;
    completed: number;
    inProgress: number;
    pendingReview: number;
  };
  pendingReviewsCount: number;
  evidenceGapCount: number;
  upcomingMeetings: MeetingItem[];
  openRisksCount: number;
  openDecisionsCount: number;
  myActionItems: {
    id: string;
    title: string;
    type: 'REVIEW' | 'TASK' | 'MEETING' | 'GATE';
    due_date: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  recentDocuments: DocumentItem[];
  recentActivities: ActivityLogItem[];
}

// -----------------------------------------------------------------------------
// EXPERT REVIEW CENTER TYPES (BATCH 1 & AUDITED VERIFICATION)
// -----------------------------------------------------------------------------

export type VerificationStatus =
  | 'SOURCE_NOT_VERIFIED'
  | 'SOURCE_CONFLICT'
  | 'EXPERT_VALIDATION_REQUIRED'
  | 'VALIDATED';

export const VERIFICATION_STATUS_BADGES: Record<
  VerificationStatus,
  { label: string; class: string; bgLight: string; textDark: string; border: string; desc: string }
> = {
  SOURCE_NOT_VERIFIED: {
    label: 'SOURCE NOT VERIFIED',
    class: 'bg-slate-100 text-slate-700 border-slate-300',
    bgLight: 'bg-slate-50',
    textDark: 'text-slate-800',
    border: 'border-slate-300',
    desc: 'ยังไม่ได้ตรวจสอบเทียบตัวบทกฎหมาย/ระเบียบต้นทาง',
  },
  SOURCE_CONFLICT: {
    label: 'SOURCE CONFLICT',
    class: 'bg-rose-100 text-rose-800 border-rose-300',
    bgLight: 'bg-rose-50',
    textDark: 'text-rose-900',
    border: 'border-rose-300',
    desc: 'พบข้อขัดแย้งระหว่างตัวบทกฎหมายกับแนวปฏิบัติจริง หรือขัดแย้งระหว่างกฎหมายต่างลำดับศักดิ์',
  },
  EXPERT_VALIDATION_REQUIRED: {
    label: 'EXPERT VALIDATION REQUIRED',
    class: 'bg-amber-100 text-amber-800 border-amber-300',
    bgLight: 'bg-amber-50',
    textDark: 'text-amber-900',
    border: 'border-amber-300',
    desc: 'อยู่ระหว่างรอความเห็นทางวิชาการ/การตีความจากผู้เชี่ยวชาญ',
  },
  VALIDATED: {
    label: 'VALIDATED',
    class: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgLight: 'bg-emerald-50',
    textDark: 'text-emerald-900',
    border: 'border-emerald-300',
    desc: 'ผ่านการตรวจรับรองความถูกต้องครบถ้วนและมีหลักฐานอ้างอิงชัดเจน',
  },
};

export type ReviewOpinionType =
  | 'LEAD_FINDING'
  | 'SUPPORTING'
  | 'ALTERNATIVE_VIEW'
  | 'CONSENSUS_NOTE';

export const REVIEW_OPINION_BADGES: Record<
  ReviewOpinionType,
  { label: string; class: string; iconName: string }
> = {
  LEAD_FINDING: {
    label: 'ความเห็นเจ้าภาพหลัก (Lead Finding)',
    class: 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
    iconName: 'Award',
  },
  SUPPORTING: {
    label: 'ความเห็นสนับสนุน (Supporting)',
    class: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconName: 'ThumbsUp',
  },
  ALTERNATIVE_VIEW: {
    label: 'ความเห็นต่าง/ข้อสังเกตเพิ่มเติม (Alternative View)',
    class: 'bg-amber-100 text-amber-800 border-amber-300',
    iconName: 'AlertCircle',
  },
  CONSENSUS_NOTE: {
    label: 'มติที่ประชุม/ข้อสรุป PM (Consensus)',
    class: 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
    iconName: 'CheckCheck',
  },
};

export type AdvisorTeamGroup = 'PUBLIC_SECTOR' | 'PRIVATE_SECTOR' | 'PM_OFFICE';

export interface ReviewBatch {
  id: string;
  project_id: string;
  batch_number: string;
  title: string;
  description: string;
  gate_target: ProjectGate;
  status: 'OPEN' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';
  total_items: number;
  validated_items: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewEvidenceRecord {
  id: string;
  review_item_id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role?: string;
  reviewer_team?: AdvisorTeamGroup;
  opinion_type?: ReviewOpinionType;
  review_date: string;
  doc_id_ref: string;
  article_section: string;
  page_number: number;
  edition_used: string;
  rationale: string;
  requirement_impact: string;
  storage_r2_key?: string;
  evidence_file_name?: string;
  evidence_file_size?: number;
  resulting_status: VerificationStatus;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  batch_id: string;
  project_id: string;
  item_code: string;
  title: string;
  document_id?: string;
  document_code?: string;
  document_title?: string;
  document_version_number?: string;
  deliverable_code?: string;
  article_section: string;
  page_number: number;
  issue_description: string;
  assigned_expert_id: string;
  assigned_expert_name: string;
  assigned_category: 'ADVISORY_LEGAL' | 'ADVISORY_PRIVATE' | 'ADVISORY_HRD' | 'CORE_PM';
  lead_team?: AdvisorTeamGroup;
  co_expert_ids?: string[];
  co_experts_count?: number;
  status: VerificationStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date: string;
  evidence_records: ReviewEvidenceRecord[];
  created_at: string;
  updated_at: string;
}

export interface TorClauseItem {
  clause_id: string;
  clause_number: string;
  title: string;
  scope_description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'NOT_STARTED';
  completion_percentage: number;
  lead_role: string;
  lead_expert?: string;
  work_packages: {
    code: string;
    name: string;
    version: string;
    status: 'COMPLETED' | 'IN_REVIEW' | 'DRAFTING' | 'PLANNED';
    period?: string;
    output_file?: string;
  }[];
  related_deliverable_code: string;
  gate_target: ProjectGate;
  updated_at: string;
}

export interface WorkstreamItem {
  code: string;
  name: string;
  name_en: string;
  lead: string;
  description: string;
  current_focus: string;
  completion_pct: number;
  active_works: string[];
}

export interface ProjectTaskItem {
  id: string;
  code: string;
  title: string;
  category: 'TOR_4_3_1' | 'TOR_4_3_2' | 'TOR_4_3_3' | 'TOR_4_3_4' | 'TOR_4_3_5' | 'GOVERNANCE';
  workstream: string;
  assigned_to: string;
  assigned_role: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  due_date: string;
  gate_milestone: ProjectGate;
  deliverable_ref: string;
  description: string;
  progress_pct: number;
}


