import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import {
  Settings,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  LayoutDashboard,
  ListTodo,
  FileCheck2,
  Sparkles,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Eye,
  AlertCircle,
  FileText,
  Download,
  Upload,
} from 'lucide-react';
import {
  getStoredLiveFocus,
  saveStoredLiveFocus,
  getStoredTasks,
  saveStoredTask,
  deleteStoredTask,
  getStoredDeliverables,
  saveStoredDeliverable,
  resetAllToDefaults,
  initialLiveFocus,
} from '~/lib/app-state';
import {
  LiveProjectFocus,
  ProjectTaskItem,
  Deliverable,
  ProjectGate,
  GATE_DETAILS,
  UserRole,
} from '~/types';
import { mockCurrentUser, mockTeamMembers } from '~/lib/mock-data';

export default function AdminRoute() {
  const [activeTab, setActiveTab] = useState<'FOCUS' | 'TASKS' | 'DELIVERABLES' | 'SYSTEM'>('FOCUS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus State
  const [focusForm, setFocusForm] = useState<LiveProjectFocus>(getStoredLiveFocus());

  // Tasks State
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [editingTask, setEditingTask] = useState<ProjectTaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Deliverables State
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);

  // Load initial data
  useEffect(() => {
    setFocusForm(getStoredLiveFocus());
    setTasks(getStoredTasks());
    setDeliverables(getStoredDeliverables());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save Focus Handler
  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredLiveFocus(focusForm);
    showToast('✅ บันทึกสถานะโครงการและแบนเนอร์หน้าแรกเรียบร้อยแล้ว (Live Published)');
  };

  // Save Task Handler
  const handleSaveTask = (taskData: ProjectTaskItem) => {
    const updated = saveStoredTask(taskData);
    setTasks(updated);
    setIsTaskModalOpen(false);
    setEditingTask(null);
    showToast('✅ บันทึกข้อมูลงาน (Task WBS) เรียบร้อยแล้ว');
  };

  // Delete Task Handler
  const handleDeleteTask = (id: string) => {
    if (confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
      const updated = deleteStoredTask(id);
      setTasks(updated);
      showToast('🗑️ ลบงานเรียบร้อยแล้ว');
    }
  };

  // Update Task Quick Status
  const handleQuickStatusChange = (task: ProjectTaskItem, newStatus: ProjectTaskItem['status']) => {
    const updatedTask: ProjectTaskItem = {
      ...task,
      status: newStatus,
      progress_pct: newStatus === 'DONE' ? 100 : newStatus === 'TODO' ? 0 : task.progress_pct || 50,
    };
    const updated = saveStoredTask(updatedTask);
    setTasks(updated);
    showToast(`🔄 อัพเดทสถานะงาน ${task.code} เป็น ${newStatus}`);
  };

  // Save Deliverable Handler
  const handleSaveDeliverable = (del: Deliverable) => {
    const updated = saveStoredDeliverable(del);
    setDeliverables(updated);
    setEditingDeliverable(null);
    showToast(`✅ บันทึกความก้าวหน้าผลส่งมอบ ${del.code} เรียบร้อยแล้ว`);
  };

  // Reset All
  const handleResetDefaults = () => {
    if (confirm('⚠️ ต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นของระบบใช่หรือไม่? ข้อมูลที่คุณแก้ไขจะถูกล้าง')) {
      resetAllToDefaults();
      setFocusForm(initialLiveFocus);
      setTasks(getStoredTasks());
      setDeliverables(getStoredDeliverables());
      showToast('🔄 รีเซ็ตข้อมูลทั้งหมดเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm font-semibold animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-[#062B63] via-[#0D418A] to-[#1356A3] text-white p-6 rounded-3xl shadow-md border border-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-3 py-0.5 text-xs font-mono font-bold bg-orange-500 text-white rounded-full shadow-xs">
                  ADMIN CONTROL CENTER
                </span>
                <span className="text-xs font-semibold text-blue-200">
                  ระบบบริหารจัดการหลังบ้านและอัพเดทสถานะโครงการ
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                ศูนย์จัดการระบบหลังบ้าน (Admin & Project Controller)
              </h1>
              <p className="text-xs md:text-sm text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                อัพเดทข้อมูลการดำเนินงาน ปรับสถานะ Gate แบนเนอร์หน้าแรก แผนงาน WBS และผลส่งมอบตาม TOR เพื่อให้ข้อมูลเป็นปัจจุบันแบบ Real-time
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/daily"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#062B63] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <ListTodo className="w-4 h-4" />
                <span>ไปที่บันทึกรายวัน</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-white/15"
              >
                <Eye className="w-4 h-4 text-orange-400" />
                <span>ดูหน้า Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('FOCUS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'FOCUS'
                ? 'bg-[#062B63] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>1. สถานะ & แบนเนอร์หน้าแรก (Live Focus)</span>
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'TASKS'
                ? 'bg-[#062B63] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ListTodo className="w-4 h-4 text-emerald-400" />
            <span>2. แผนงานและกิจกรรม WBS ({tasks.length} งาน)</span>
          </button>

          <button
            onClick={() => setActiveTab('DELIVERABLES')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'DELIVERABLES'
                ? 'bg-[#062B63] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-blue-400" />
            <span>3. ผลส่งมอบตาม TOR ({deliverables.length} ชิ้น)</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'SYSTEM'
                ? 'bg-[#062B63] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>4. สำรองและรีเซ็ตระบบ</span>
          </button>
        </div>

        {/* TAB 1: LIVE FOCUS & BANNER CONFIG */}
        {activeTab === 'FOCUS' && (
          <form onSubmit={handleSaveFocus} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F36C21]" />
                    กำหนดข้อมูลสถานะปัจจุบันและแบนเนอร์หน้าแรก
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ข้อมูลที่แก้ไขจะแสดงผลบนแบนเนอร์ Live Focus ในหน้า Dashboard ทันที
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <Save className="w-4 h-4 text-orange-400" />
                  <span>บันทึกและเผยแพร่ (Publish Live)</span>
                </button>
              </div>

              {/* General Project Status Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่แสดงสถานะ (As-of Date)
                  </label>
                  <input
                    type="text"
                    value={focusForm.as_of_date}
                    onChange={(e) => setFocusForm({ ...focusForm, as_of_date: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062B63] font-medium"
                    placeholder="เช่น 8 ตุลาคม 2569"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะ Gate ปัจจุบัน (Current Gate)
                  </label>
                  <select
                    value={focusForm.current_gate}
                    onChange={(e) => setFocusForm({ ...focusForm, current_gate: e.target.value as ProjectGate })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062B63] font-bold text-[#062B63]"
                  >
                    {Object.entries(GATE_DETAILS).map(([gateKey, gateVal]) => (
                      <option key={gateKey} value={gateKey}>
                        {gateVal.titleTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ความก้าวหน้าโครงการรวม (% Overall Progress)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={focusForm.overall_progress_pct}
                      onChange={(e) =>
                        setFocusForm({ ...focusForm, overall_progress_pct: Number(e.target.value) })
                      }
                      className="flex-1 accent-[#F36C21]"
                    />
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#062B63] min-w-[50px] text-center">
                      {focusForm.overall_progress_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Announcement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความประกาศด่วนของโครงการ (Live Announcement Bar)
                </label>
                <input
                  type="text"
                  value={focusForm.announcement_text || ''}
                  onChange={(e) => setFocusForm({ ...focusForm, announcement_text: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062B63]"
                  placeholder="เช่น 📢 ประชุมคณะทำงานประจำสัปดาห์ ทุกวันพฤหัสบดี เวลา 13:30 น."
                />
              </div>

              {/* 2 Focus Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Card 1 Configuration */}
                <div className="p-5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> การ์ดที่ 1: สิ่งที่กำลังดำเนินการ
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ป้ายกำกับ (Tag)</label>
                    <input
                      type="text"
                      value={focusForm.card1_tag}
                      onChange={(e) => setFocusForm({ ...focusForm, card1_tag: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      placeholder="1. สิ่งที่กำลังดำเนินการอยู่"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">รหัสเอกสาร / เวอร์ชัน</label>
                    <input
                      type="text"
                      value={focusForm.card1_code}
                      onChange={(e) => setFocusForm({ ...focusForm, card1_code: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                      placeholder="FORM-INT-001 (v0.1)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">หัวข้อกิจกรรมหลัก</label>
                    <input
                      type="text"
                      value={focusForm.card1_title}
                      onChange={(e) => setFocusForm({ ...focusForm, card1_title: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                      placeholder="ตรวจทานประเด็นการสัมภาษณ์ / Focus Group"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">คำอธิบายรายละเอียด</label>
                    <textarea
                      rows={3}
                      value={focusForm.card1_description}
                      onChange={(e) => setFocusForm({ ...focusForm, card1_description: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white leading-relaxed"
                      placeholder="อธิบายกิจกรรมและเป้าหมาย..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ลิงก์ Google Drive</label>
                    <input
                      type="url"
                      value={focusForm.card1_drive_link}
                      onChange={(e) => setFocusForm({ ...focusForm, card1_drive_link: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-blue-600 font-mono"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                {/* Card 2 Configuration */}
                <div className="p-5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> การ์ดที่ 2: ข้อมูลพร้อมดู
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ป้ายกำกับ (Tag)</label>
                    <input
                      type="text"
                      value={focusForm.card2_tag}
                      onChange={(e) => setFocusForm({ ...focusForm, card2_tag: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      placeholder="2. ข้อมูลการศึกษาพร้อมเข้าดู"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">รหัสเอกสาร / เวอร์ชัน</label>
                    <input
                      type="text"
                      value={focusForm.card2_code}
                      onChange={(e) => setFocusForm({ ...focusForm, card2_code: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                      placeholder="DOC-LEGAL-MAPPING-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">หัวข้อกิจกรรมหลัก</label>
                    <input
                      type="text"
                      value={focusForm.card2_title}
                      onChange={(e) => setFocusForm({ ...focusForm, card2_title: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                      placeholder="การศึกษาและวิเคราะห์ขอบเขต อำนาจหน้าที่ กสว. และ สกสว."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">คำอธิบายรายละเอียด</label>
                    <textarea
                      rows={3}
                      value={focusForm.card2_description}
                      onChange={(e) => setFocusForm({ ...focusForm, card2_description: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white leading-relaxed"
                      placeholder="อธิบายผลการศึกษาและเนื้อหา..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ลิงก์ Google Drive</label>
                    <input
                      type="url"
                      value={focusForm.card2_drive_link}
                      onChange={(e) => setFocusForm({ ...focusForm, card2_drive_link: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-blue-600 font-mono"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-orange-400" />
                  <span>บันทึกและเผยแพร่ทันที (Publish to Live Dashboard)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: TASKS WBS MANAGEMENT */}
        {activeTab === 'TASKS' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-[#062B63]" />
                  จัดการรายการงานและกิจกรรม (WBS & Tasks Manager)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เพิ่ม ลบ ปรับปรุงสถานะงาน และกำหนดผู้รับผิดชอบตาม Workstream
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTask({
                    id: `task-${Date.now()}`,
                    code: `WORK-WS0${tasks.length + 1}-001`,
                    title: '',
                    category: 'TOR_4_3_1',
                    workstream: 'WS01',
                    assigned_to: 'นายอนุสรณ์ หนองนา (เด่น)',
                    assigned_role: 'ผู้จัดการโครงการ (PM Lead)',
                    priority: 'HIGH',
                    status: 'IN_PROGRESS',
                    due_date: '2026-10-31',
                    gate_milestone: 'G2',
                    deliverable_ref: 'DEL-01',
                    description: '',
                    progress_pct: 0,
                  });
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มงานใหม่ (New Task)</span>
              </button>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 rounded-l-xl">รหัสงาน</th>
                    <th className="py-3 px-3">ชื่องาน / กิจกรรม</th>
                    <th className="py-3 px-3">หมวดงาน / Workstream</th>
                    <th className="py-3 px-3">ผู้รับผิดชอบ</th>
                    <th className="py-3 px-3">ความคืบหน้า</th>
                    <th className="py-3 px-3">สถานะ</th>
                    <th className="py-3 px-3 text-right rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#062B63]">
                        {task.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-xs">
                        <div className="font-bold">{task.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{task.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-bold">
                          {task.workstream}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{task.category}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {task.assigned_to}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${task.progress_pct}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-600">
                            {task.progress_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleQuickStatusChange(task, e.target.value as ProjectTaskItem['status'])
                          }
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white cursor-pointer"
                        >
                          <option value="TODO">รอดำเนินการ (TODO)</option>
                          <option value="IN_PROGRESS">กำลังดำเนินการ (IN_PROGRESS)</option>
                          <option value="IN_REVIEW">อยู่ระหว่างตรวจทาน (IN_REVIEW)</option>
                          <option value="DONE">เสร็จสมบูรณ์ (DONE)</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="แก้ไขรายละเอียด"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="ลบงาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERABLES MANAGEMENT */}
        {activeTab === 'DELIVERABLES' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                จัดการความก้าวหน้าผลส่งมอบตามสัญญา (Deliverables Tracker)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ปรับปรุงสถานะและน้ำหนักร้อยละของผลงานส่งมอบ DEL-01 ถึง DEL-06
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.map((del) => (
                <div
                  key={del.id}
                  className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 bg-[#062B63] text-white rounded-md">
                      {del.code}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      น้ำหนัก {del.weight_percentage}% • Gate {del.gate_milestone}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">{del.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-1">{del.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">สถานะ:</span>
                      <select
                        value={del.status}
                        onChange={(e) =>
                          handleSaveDeliverable({ ...del, status: e.target.value as any })
                        }
                        className="text-[11px] font-bold px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value="BACKLOG">รอดำเนินการ</option>
                        <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                        <option value="INTERNAL_REVIEW">ตรวจทานภายใน</option>
                        <option value="EXPERT_REVIEW">ผู้เชี่ยวชาญตรวจทาน</option>
                        <option value="VALIDATED">รับรองแล้ว</option>
                        <option value="APPROVED">อนุมัติแล้ว</option>
                      </select>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500">
                      กำหนดส่ง: {del.due_date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & RESET */}
        {activeTab === 'SYSTEM' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                สำรองและจัดการข้อมูลระบบ (System Data & Backup)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สำรองข้อมูลสถานะทั้งหมดเป็นไฟล์ JSON หรือรีเซ็ตกลับสู่ค่าเริ่มต้น
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup */}
              <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold text-purple-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" />
                  ดาวน์โหลดข้อมูลสำรอง (Backup Export)
                </h3>
                <p className="text-xs text-purple-800 leading-relaxed">
                  ดาวน์โหลดข้อมูลสถานะโครงการ แผนงาน WBS และบันทึกรายวันทั้งหมดเป็นไฟล์ JSON เพื่อสำรองเก็บไว้
                </p>
                <button
                  onClick={() => {
                    const data = {
                      liveFocus: getStoredLiveFocus(),
                      tasks: getStoredTasks(),
                      deliverables: getStoredDeliverables(),
                      exported_at: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tsri-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    showToast('📥 ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ Backup (.json)</span>
                </button>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold text-rose-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  รีเซ็ตข้อมูลสู่ค่าเริ่มต้น (Reset to Default Baseline)
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  ล้างข้อมูลที่บันทึกในเครื่องทั้งหมด และคืนค่ากลับสู่ชุดข้อมูลมาตรฐานของโครงการ TSRI ONE LINK
                </p>
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตค่าเริ่มต้นทั้งหมด (Reset All)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Edit Modal */}
        {isTaskModalOpen && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
              <div className="p-5 bg-[#062B63] text-white flex items-center justify-between">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-orange-400" />
                  {editingTask.id.startsWith('task-') ? 'เพิ่มงานใหม่ (New Task)' : 'แก้ไขงาน WBS'}
                </h3>
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">รหัสงาน (Task Code)</label>
                    <input
                      type="text"
                      value={editingTask.code}
                      onChange={(e) => setEditingTask({ ...editingTask, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Workstream</label>
                    <select
                      value={editingTask.workstream}
                      onChange={(e) => setEditingTask({ ...editingTask, workstream: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="WS01">WS01: Project Setup & Baseline</option>
                      <option value="WS02">WS02: Legal & Regulatory Framework</option>
                      <option value="WS03">WS03: Gap Analysis & Interviews</option>
                      <option value="WS04">WS04: Recommendations & Manual</option>
                      <option value="WS05">WS05: Knowledge Management Platform</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่องาน (Title)</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                    placeholder="เช่น จัดทำร่างแบบสัมภาษณ์ผู้บริหาร สกสว."
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">คำอธิบายรายละเอียด</label>
                  <textarea
                    rows={3}
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl leading-relaxed"
                    placeholder="รายละเอียดงาน..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ผู้รับผิดชอบ</label>
                    <select
                      value={editingTask.assigned_to}
                      onChange={(e) => setEditingTask({ ...editingTask, assigned_to: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      {mockTeamMembers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.nickname || m.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">สถานะ</label>
                    <select
                      value={editingTask.status}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          status: e.target.value as ProjectTaskItem['status'],
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="TODO">รอดำเนินการ (TODO)</option>
                      <option value="IN_PROGRESS">กำลังดำเนินการ (IN_PROGRESS)</option>
                      <option value="IN_REVIEW">อยู่ระหว่างตรวจทาน (IN_REVIEW)</option>
                      <option value="DONE">เสร็จสมบูรณ์ (DONE)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">กำหนดเสร็จ (Due Date)</label>
                    <input
                      type="date"
                      value={editingTask.due_date}
                      onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ความคืบหน้า (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingTask.progress_pct}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, progress_pct: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTask(editingTask)}
                  className="px-5 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-orange-400" />
                  <span>บันทึกงาน</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
