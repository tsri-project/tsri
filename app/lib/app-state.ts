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

// Initial Seed Daily Updates (Clean / No Mock Data)
export const initialDailyUpdates: DailyUpdateItem[] = [];
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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any mock seed items (e.g. daily-001, daily-002, daily-003, daily-004)
      const cleaned = parsed.filter(
        (item: DailyUpdateItem) =>
          item && typeof item.id === 'string' && !item.id.startsWith('daily-00')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (e) {
    console.error('Failed to parse daily updates from storage', e);
    return [];
  }
}

export function saveStoredDailyUpdate(update: DailyUpdateItem): DailyUpdateItem[] {
  if (typeof window === 'undefined') return [];
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
  if (typeof window === 'undefined') return [];
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

export function clearStoredDailyUpdates(): DailyUpdateItem[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify([]));
    notifyStateChange(STORAGE_KEYS.DAILY_UPDATES);
    return [];
  } catch (e) {
    console.error('Failed to clear daily updates', e);
    return [];
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

export function toggleStoredTaskStatus(id: string): { tasks: ProjectTaskItem[]; updatedTask: ProjectTaskItem | null } {
  if (typeof window === 'undefined') return { tasks: mockProjectTasks, updatedTask: null };
  try {
    const current = getStoredTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) return { tasks: current, updatedTask: null };

    const task = current[index];
    const newStatus: ProjectTaskItem['status'] = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    const updatedTask: ProjectTaskItem = {
      ...task,
      status: newStatus,
    };
    const next = [...current];
    next[index] = updatedTask;

    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.PROJECT_TASKS);
    return { tasks: next, updatedTask };
  } catch (e) {
    console.error('Failed to toggle task status', e);
    return { tasks: getStoredTasks(), updatedTask: null };
  }
}

export function updateStoredTaskStatus(
  id: string,
  status: ProjectTaskItem['status']
): { tasks: ProjectTaskItem[]; updatedTask: ProjectTaskItem | null } {
  if (typeof window === 'undefined') return { tasks: mockProjectTasks, updatedTask: null };
  try {
    const current = getStoredTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) return { tasks: current, updatedTask: null };

    const task = current[index];
    const newProgress = status === 'DONE' ? 100 : task.progress_pct === 100 ? 80 : task.progress_pct;
    const updatedTask: ProjectTaskItem = {
      ...task,
      status,
      progress_pct: newProgress,
    };
    const next = [...current];
    next[index] = updatedTask;

    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.PROJECT_TASKS);
    return { tasks: next, updatedTask };
  } catch (e) {
    console.error('Failed to update task status', e);
    return { tasks: getStoredTasks(), updatedTask: null };
  }
}

export function updateStoredTaskProgress(
  id: string,
  progress_pct: number,
  statusOverride?: ProjectTaskItem['status']
): { tasks: ProjectTaskItem[]; updatedTask: ProjectTaskItem | null } {
  if (typeof window === 'undefined') return { tasks: mockProjectTasks, updatedTask: null };
  try {
    const current = getStoredTasks();
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) return { tasks: current, updatedTask: null };

    const task = current[index];
    const clampedPct = Math.max(0, Math.min(100, Math.round(progress_pct)));

    let newStatus: ProjectTaskItem['status'] = statusOverride || task.status;
    if (!statusOverride) {
      if (clampedPct === 100) {
        newStatus = 'DONE';
      } else if (task.status === 'DONE' && clampedPct < 100) {
        newStatus = 'IN_PROGRESS';
      } else if (task.status === 'TODO' && clampedPct > 0) {
        newStatus = 'IN_PROGRESS';
      }
    }

    const updatedTask: ProjectTaskItem = {
      ...task,
      progress_pct: clampedPct,
      status: newStatus,
    };
    const next = [...current];
    next[index] = updatedTask;

    localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(next));
    notifyStateChange(STORAGE_KEYS.PROJECT_TASKS);
    return { tasks: next, updatedTask };
  } catch (e) {
    console.error('Failed to update task progress', e);
    return { tasks: getStoredTasks(), updatedTask: null };
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
