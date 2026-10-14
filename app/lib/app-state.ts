import {
  DailyUpdateItem,
  LiveProjectFocus,
  ProjectTaskItem,
  WorkstreamItem,
  Deliverable,
  TorClauseItem,
} from '~/types';
import {
  mockProjectTasks,
  mockWorkstreams,
  mockDeliverables,
  mockTorClauses,
} from '~/lib/mock-data';

// Initial Live Focus State
export const initialLiveFocus: LiveProjectFocus = {
  as_of_date: '8 ตุลาคม 2569',
  current_gate: 'G2',
  overall_progress_pct: 35,
  card1_title: 'ตรวจทานประเด็นการสัมภาษณ์ / Focus Group',
  card1_code: 'FORM-INT-001 (v0.1)',
  card1_tag: '1. สิ่งที่กำลังดำเนินการอยู่',
  card1_description:
    'แบบสัมภาษณ์กึ่งโครงสร้าง (Semi-Structured Interview) 10 ประเด็นหลัก เตรียมเก็บข้อมูลภาคสนามกับกลุ่มผู้บริหาร บอร์ด กสว. และระดับปฏิบัติการ สกสว./PMU',
  card1_modal_type: 'INTERVIEW',
  card1_drive_link:
    'https://drive.google.com/drive/folders/1Y4uCfXDbjjm3fe63wmDSi29neiYbOwaF?usp=drive_link',
  card2_title:
    'การศึกษาและวิเคราะห์ขอบเขต อำนาจหน้าที่ กสว. และ สกสว. ตาม พ.ร.บ. สภานโยบายฯ',
  card2_code: 'DOC-LEGAL-MAPPING-001',
  card2_tag: '2. ข้อมูลการศึกษาพร้อมเข้าดู',
  card2_description:
    'รายงานผลการวิเคราะห์ความเกี่ยวพันของ พ.ร.บ. 3 ระดับศักดิ์ (20 ฉบับ 195 ข้อกำหนด) กับภารกิจ 5 ด้านของ สกสว. ตามขอบเขต TOR ข้อ 4.3.1',
  card2_modal_type: 'LEGAL_MAPPING',
  card2_drive_link:
    'https://drive.google.com/drive/folders/1hfMPYkzRQlfuFq9ARDwS0_kFfMNk76Cq?usp=drive_link',
  announcement_text:
    '📢 ประชุมคณะทำงานประจำสัปดาห์ ทุกวันพฤหัสบดี เวลา 13:30 น. ผ่านระบบ Zoom และรายงานความคืบหน้ารายวันผ่านระบบ TSRI ONE LINK',
  updated_by: 'นายอนุสรณ์ หนองนา (Super Admin / PM)',
  updated_at: '2026-10-08T09:30:00.000Z',
};

// Initial Seed Daily Updates
export const initialDailyUpdates: DailyUpdateItem[] = [
  {
    id: 'daily-001',
    date: '2026-10-08',
    team_category: 'CORE_PM',
    team_name: 'ฝ่ายบริหารโครงการ (Project Management Core Team)',
    author_id: 'pm-01',
    author_name: 'นายอนุสรณ์ หนองนา (เด่น)',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    author_role: 'Super Admin / ผู้จัดการโครงการ (PM & Learning Architect Lead)',
    workstream_code: 'WS01',
    gate_milestone: 'G2',
    completed_today: [
      'จัดทำโครงสร้างระบบ Admin Backoffice & Daily Activity Tracker บน TSRI ONE LINK',
      'ประสานงานนัดหมายสัมภาษณ์ผู้บริหาร สกสว. และผู้แทน PMU ประจำสัปดาห์หน้า',
      'สรุปบันทึกการประชุมเตรียมความพร้อมเก็บข้อมูลภาคสนามร่วมกับ ดร.หนึ่งนิดา',
    ],
    in_progress_today: [
      'ตรวจทานแบบสัมภาษณ์ 10 ประเด็น (FORM-INT-001) ฉบับปรับปรุง',
      'ปรับปรุงผังความเชื่อมโยง Traceability Matrix กับขอบเขตงาน TOR',
    ],
    planned_tomorrow: [
      'ประชุมประสานงานกับทีมกฎหมายภาครัฐ (อ.กฤษฎา) เรื่องขอบเขตมาตรา 41 พ.ร.บ. สภานโยบายฯ',
      'เปิดทดสอบระบบบันทึกงานรายวันแก่คณะทำงานทั้ง 4 ฝ่าย',
    ],
    blockers: [],
    attachments: [
      {
        title: 'Google Drive ประเด็นสัมภาษณ์ 10 ข้อ',
        url: 'https://drive.google.com/drive/folders/1Y4uCfXDbjjm3fe63wmDSi29neiYbOwaF?usp=drive_link',
        type: 'GDRIVE',
      },
    ],
    mood: 'EXCELLENT',
    progress_percentage: 45,
    created_at: '2026-10-08T17:30:00.000Z',
  },
  {
    id: 'daily-002',
    date: '2026-10-08',
    team_category: 'ADVISORY_LEGAL',
    team_name: 'คณะที่ปรึกษาด้านกฎหมายและระเบียบภาครัฐ (Public Legal Advisory Team)',
    author_id: 'leg-01',
    author_name: 'นายกฤษฎา แก้วสองสี',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    author_role: 'ผู้เชี่ยวชาญด้านกฎหมายมหาชนและการคลังภาครัฐ',
    workstream_code: 'WS02',
    gate_milestone: 'G2',
    completed_today: [
      'ตรวจทานตารางวิเคราะห์ความเกี่ยวพันของ พ.ร.บ. ส่งเสริม ววน. กับระเบียบ กสว. ว่าด้วยการจัดสรรเงินกองทุน',
      'บันทึกข้อสังเกตเรื่องการเบิกจ่ายงบประมาณ Multi-year Block Grant เทียบกับ พ.ร.บ. วินัยการเงินการคลัง ม.20',
    ],
    in_progress_today: [
      'จัดทำร่างคำอธิบายกฎหมาย 20 ฉบับ สำหรับประกอบคู่มือ SOP ภารกิจที่ 2',
    ],
    planned_tomorrow: [
      'ร่วมทบทวนประเด็นทางกฎหมายสำหรับการสัมภาษณ์ผู้อำนวยการกลุ่มกฎหมาย สกสว.',
    ],
    blockers: ['รอเอกสารระเบียบ กสว. ฉบับแก้ไขเพิ่มเติมปี 2567 เพิ่มเติม 1 ฉบับ'],
    attachments: [
      {
        title: 'DOC-LEGAL-MAPPING-001 (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1hfMPYkzRQlfuFq9ARDwS0_kFfMNk76Cq?usp=drive_link',
        type: 'GDRIVE',
      },
    ],
    mood: 'GOOD',
    progress_percentage: 40,
    created_at: '2026-10-08T16:45:00.000Z',
  },
  {
    id: 'daily-003',
    date: '2026-10-08',
    team_category: 'ADVISORY_PRIVATE',
    team_name: 'คณะที่ปรึกษาด้านกฎหมายเอกชน นวัตกรรม และ IP (Private & Innovation Legal Team)',
    author_id: 'pvt-01',
    author_name: 'ดร.อัครวิทย์ กาญจนโอภาษ',
    author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    author_role: 'ผู้เชี่ยวชาญด้านการบริหารจัดการนวัตกรรมและทรัพย์สินทางปัญญา (TRIUP Act)',
    workstream_code: 'WS03',
    gate_milestone: 'G2',
    completed_today: [
      'วิเคราะห์แนวทางการบังคับใช้ พ.ร.บ. ส่งเสริมการใช้ประโยชน์ผลงานวิจัยฯ (TRIUP Act) เทียบกับภารกิจ สกสว.',
      'รวบรวม Best Practice การจัดสรรผลประโยชน์ในทรัพย์สินทางปัญญาจากกองทุนวิจัยต่างประเทศ',
    ],
    planned_tomorrow: [
      'ร่างแนวคำถาม Focus Group สำหรับกลุ่ม PMU ด้านนวัตกรรม (NIA, บพข.)',
    ],
    blockers: [],
    attachments: [],
    mood: 'GOOD',
    progress_percentage: 35,
    created_at: '2026-10-08T15:20:00.000Z',
  },
  {
    id: 'daily-004',
    date: '2026-10-08',
    team_category: 'ADVISORY_HRD',
    team_name: 'คณะที่ปรึกษาด้านการพัฒนาองค์กรและทรัพยากรบุคคล (Organization & HRD Advisory Team)',
    author_id: 'hrd-01',
    author_name: 'รศ.ดร.รัชนีพร สุนทรส',
    author_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    author_role: 'ผู้เชี่ยวชาญด้านการพัฒนาบุคลากรและการออกแบบหลักสูตรฝึกอบรม',
    workstream_code: 'WS04',
    gate_milestone: 'G2',
    completed_today: [
      'ออกแบบกรอบสมรรถนะทางกฎหมาย (Legal Competency Matrix) 4 ระดับ สำหรับเจ้าหน้าที่ สกสว.',
      'จัดเตรียมโครงสร้างหลักสูตร E-learning และ Microlearning 5 โมดูล',
    ],
    planned_tomorrow: [
      'ประชุมประสานงานกับทีม PM เพื่อนำผล Gap Analysis ไปผูกกับ Learning Needs',
    ],
    blockers: [],
    attachments: [],
    mood: 'EXCELLENT',
    progress_percentage: 30,
    created_at: '2026-10-08T14:10:00.000Z',
  },
];

// Storage Keys
const STORAGE_KEYS = {
  LIVE_FOCUS: 'tsri_live_project_focus',
  DAILY_UPDATES: 'tsri_daily_updates',
  PROJECT_TASKS: 'tsri_project_tasks',
  WORKSTREAMS: 'tsri_workstreams',
  DELIVERABLES: 'tsri_deliverables',
  TOR_CLAUSES: 'tsri_tor_clauses',
};

// Helper: Dispatch Custom Change Event
function notifyStateChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tsri-state-change', { detail: { key } }));
  }
}

// -----------------------------------------------------------------------------
// LIVE FOCUS OPERATIONS
// -----------------------------------------------------------------------------

export function getStoredLiveFocus(): LiveProjectFocus {
  if (typeof window === 'undefined') return initialLiveFocus;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE_FOCUS);
    if (!raw) return initialLiveFocus;
    return { ...initialLiveFocus, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse live focus from storage', e);
    return initialLiveFocus;
  }
}

export function saveStoredLiveFocus(focus: LiveProjectFocus): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LIVE_FOCUS, JSON.stringify(focus));
    notifyStateChange(STORAGE_KEYS.LIVE_FOCUS);
  } catch (e) {
    console.error('Failed to save live focus', e);
  }
}

// -----------------------------------------------------------------------------
// DAILY UPDATES OPERATIONS
// -----------------------------------------------------------------------------

export function getStoredDailyUpdates(): DailyUpdateItem[] {
  if (typeof window === 'undefined') return initialDailyUpdates;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(initialDailyUpdates));
      return initialDailyUpdates;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialDailyUpdates;
  } catch (e) {
    console.error('Failed to parse daily updates from storage', e);
    return initialDailyUpdates;
  }
}

export function saveStoredDailyUpdate(update: DailyUpdateItem): DailyUpdateItem[] {
  if (typeof window === 'undefined') return initialDailyUpdates;
  try {
    const current = getStoredDailyUpdates();
    const index = current.findIndex((item) => item.id === update.id);
    let next: DailyUpdateItem[];
    if (index >= 0) {
      next = [...current];
      next[index] = { ...update, updated_at: new Date().toISOString() };
    } else {
      next = [{ ...update, created_at: new Date().toISOString() }, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.DAILY_UPDATES);
    return next;
  } catch (e) {
    console.error('Failed to save daily update', e);
    return getStoredDailyUpdates();
  }
}

export function deleteStoredDailyUpdate(id: string): DailyUpdateItem[] {
  if (typeof window === 'undefined') return initialDailyUpdates;
  try {
    const current = getStoredDailyUpdates();
    const next = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.DAILY_UPDATES);
    return next;
  } catch (e) {
    console.error('Failed to delete daily update', e);
    return getStoredDailyUpdates();
  }
}

// -----------------------------------------------------------------------------
// TASKS OPERATIONS
// -----------------------------------------------------------------------------

export function getStoredTasks(): ProjectTaskItem[] {
  if (typeof window === 'undefined') return mockProjectTasks;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(mockProjectTasks));
      return mockProjectTasks;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse tasks', e);
    return mockProjectTasks;
  }
}

export function saveStoredTask(task: ProjectTaskItem): ProjectTaskItem[] {
  if (typeof window === 'undefined') return mockProjectTasks;
  try {
    const current = getStoredTasks();
    const index = current.findIndex((t) => t.id === task.id);
    let next: ProjectTaskItem[];
    if (index >= 0) {
      next = [...current];
      next[index] = task;
    } else {
      next = [task, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.PROJECT_TASKS);
    return next;
  } catch (e) {
    console.error('Failed to save task', e);
    return getStoredTasks();
  }
}

export function deleteStoredTask(id: string): ProjectTaskItem[] {
  if (typeof window === 'undefined') return mockProjectTasks;
  try {
    const current = getStoredTasks();
    const next = current.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.PROJECT_TASKS);
    return next;
  } catch (e) {
    console.error('Failed to delete task', e);
    return getStoredTasks();
  }
}

// -----------------------------------------------------------------------------
// DELIVERABLES OPERATIONS
// -----------------------------------------------------------------------------

export function getStoredDeliverables(): Deliverable[] {
  if (typeof window === 'undefined') return mockDeliverables;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELIVERABLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DELIVERABLES, JSON.stringify(mockDeliverables));
      return mockDeliverables;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse deliverables', e);
    return mockDeliverables;
  }
}

export function saveStoredDeliverable(del: Deliverable): Deliverable[] {
  if (typeof window === 'undefined') return mockDeliverables;
  try {
    const current = getStoredDeliverables();
    const index = current.findIndex((d) => d.id === del.id);
    let next: Deliverable[];
    if (index >= 0) {
      next = [...current];
      next[index] = del;
    } else {
      next = [...current, del];
    }
    localStorage.setItem(STORAGE_KEYS.DELIVERABLES, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.DELIVERABLES);
    return next;
  } catch (e) {
    console.error('Failed to save deliverable', e);
    return getStoredDeliverables();
  }
}

// -----------------------------------------------------------------------------
// RESET ALL TO DEFAULTS
// -----------------------------------------------------------------------------

export function resetAllToDefaults(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.LIVE_FOCUS);
  localStorage.removeItem(STORAGE_KEYS.DAILY_UPDATES);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_TASKS);
  localStorage.removeItem(STORAGE_KEYS.DELIVERABLES);
  localStorage.removeItem(STORAGE_KEYS.WORKSTREAMS);
  localStorage.removeItem(STORAGE_KEYS.TOR_CLAUSES);
  notifyStateChange('all');
}
