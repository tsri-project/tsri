import { useState, useEffect, useMemo } from 'react';
import { Link } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Users,
  Filter,
  Search,
  FolderOpen,
  ArrowRight,
  FileCheck,
  Check,
  MessageSquare,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import {
  getStoredDailyUpdates,
  saveStoredDailyUpdate,
  deleteStoredDailyUpdate,
  getStoredLiveFocus,
} from '~/lib/app-state';
import { DailyUpdateItem, TeamCategory } from '~/types';
import { mockCurrentUser, mockTeamMembers } from '~/lib/mock-data';

const TEAM_CATEGORY_TABS: { id: TeamCategory | 'ALL'; name: string; color: string }[] = [
  { id: 'ALL', name: 'ทุกคณะทำงาน (All Teams)', color: 'bg-slate-800 text-white' },
  {
    id: 'CORE_PM',
    name: '1. ฝ่ายบริหารโครงการ (Core PM)',
    color: 'bg-blue-600 text-white',
  },
  {
    id: 'ADVISORY_LEGAL',
    name: '2. ที่ปรึกษากฎหมายภาครัฐ',
    color: 'bg-indigo-600 text-white',
  },
  {
    id: 'ADVISORY_PRIVATE',
    name: '3. ที่ปรึกษาภาคเอกชน/IP',
    color: 'bg-amber-600 text-white',
  },
  {
    id: 'ADVISORY_HRD',
    name: '4. ที่ปรึกษา HRD/พัฒนาองค์กร',
    color: 'bg-purple-600 text-white',
  },
];

export default function DailyRoute() {
  const [updates, setUpdates] = useState<DailyUpdateItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DailyUpdateItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedDigest, setCopiedDigest] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    team_category: TeamCategory;
    author_id: string;
    date: string;
    workstream_code: string;
    completed_text: string;
    in_progress_text: string;
    planned_text: string;
    blockers_text: string;
    attachment_title: string;
    attachment_url: string;
    progress_percentage: number;
    mood: 'EXCELLENT' | 'GOOD' | 'NORMAL' | 'BLOCKED';
  }>({
    team_category: 'CORE_PM',
    author_id: mockCurrentUser.id,
    date: new Date().toISOString().split('T')[0],
    workstream_code: 'WS01',
    completed_text: '',
    in_progress_text: '',
    planned_text: '',
    blockers_text: '',
    attachment_title: '',
    attachment_url: '',
    progress_percentage: 40,
    mood: 'GOOD',
  });

  const loadUpdates = () => {
    setUpdates(getStoredDailyUpdates());
  };

  useEffect(() => {
    loadUpdates();

    const handleSync = () => loadUpdates();
    window.addEventListener('tsri-state-change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tsri-state-change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Updates
  const filteredUpdates = useMemo(() => {
    return updates.filter((item) => {
      const matchTeam = selectedTeam === 'ALL' || item.team_category === selectedTeam;
      const matchQuery =
        searchQuery === '' ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.completed_today.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.planned_tomorrow &&
          item.planned_tomorrow.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (item.blockers &&
          item.blockers.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchTeam && matchQuery;
    });
  }, [updates, selectedTeam, searchQuery]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMember = mockTeamMembers.find((m) => m.id === formData.author_id) || {
      id: mockCurrentUser.id,
      name: mockCurrentUser.full_name,
      avatarUrl: mockCurrentUser.avatar_url,
      roleTitle: mockCurrentUser.role_title || 'ผู้จัดการโครงการ',
    };

    const teamNames: Record<TeamCategory, string> = {
      CORE_PM: 'ฝ่ายบริหารโครงการ (Project Management Core Team)',
      ADVISORY_LEGAL: 'คณะที่ปรึกษาด้านกฎหมายและระเบียบภาครัฐ',
      ADVISORY_PRIVATE: 'คณะที่ปรึกษาด้านกฎหมายเอกชน นวัตกรรม และ IP',
      ADVISORY_HRD: 'คณะที่ปรึกษาด้านการพัฒนาองค์กรและทรัพยากรบุคคล',
    };

    const completedList = formData.completed_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const inProgressList = formData.in_progress_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const plannedList = formData.planned_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const blockersList = formData.blockers_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const attachments = formData.attachment_url
      ? [
          {
            title: formData.attachment_title || 'เอกสาร / ลิงก์อ้างอิง',
            url: formData.attachment_url,
            type: formData.attachment_url.includes('drive.google.com')
              ? ('GDRIVE' as const)
              : ('LINK' as const),
          },
        ]
      : [];

    const newItem: DailyUpdateItem = {
      id: editingItem ? editingItem.id : `daily-${Date.now()}`,
      date: formData.date,
      team_category: formData.team_category,
      team_name: teamNames[formData.team_category],
      author_id: selectedMember.id,
      author_name: selectedMember.name,
      author_avatar: selectedMember.avatarUrl,
      author_role: selectedMember.roleTitle,
      workstream_code: formData.workstream_code,
      gate_milestone: 'G2',
      completed_today: completedList.length > 0 ? completedList : ['ดำเนินการตามแผนงานปกติ'],
      in_progress_today: inProgressList,
      planned_tomorrow: plannedList.length > 0 ? plannedList : ['ติดตามงานต่อเนื่อง'],
      blockers: blockersList,
      attachments,
      mood: formData.mood,
      progress_percentage: formData.progress_percentage,
      created_at: editingItem ? editingItem.created_at : new Date().toISOString(),
    };

    saveStoredDailyUpdate(newItem);
    loadUpdates();
    setIsModalOpen(false);
    setEditingItem(null);
    showToast('✅ บันทึกรายงานการทำงานรายวันเรียบร้อยแล้ว');
  };

  // Copy Daily Digest to Clipboard
  const handleCopyDigest = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysUpdates = updates.filter((u) => u.date === today || u.date === '2026-10-08');

    let text = `📢 สรุปรายงานความก้าวหน้าการทำงานรายวัน TSRI ONE LINK\n🗓️ ประจำวันที่: ${getStoredLiveFocus().as_of_date}\n\n`;

    todaysUpdates.forEach((up, idx) => {
      text += `━━━━━━━━━━━━━━━━━━━━\n📌 [${up.team_name}]\n👤 ผู้รายงาน: ${up.author_name} (${up.author_role})\n\n`;
      text += `✅ สิ่งที่ทำเสร็จวันนี้:\n`;
      up.completed_today.forEach((c) => (text += `  • ${c}\n`));

      if (up.in_progress_today && up.in_progress_today.length > 0) {
        text += `\n🔄 สิ่งที่กำลังดำเนินการ:\n`;
        up.in_progress_today.forEach((i) => (text += `  • ${i}\n`));
      }

      if (up.planned_tomorrow && up.planned_tomorrow.length > 0) {
        text += `\n🎯 แผนงานวันถัดไป:\n`;
        up.planned_tomorrow.forEach((p) => (text += `  • ${p}\n`));
      }

      if (up.blockers && up.blockers.length > 0) {
        text += `\n⚠️ ปัญหา/ข้อติดขัด (Blockers):\n`;
        up.blockers.forEach((b) => (text += `  ⚠️ ${b}\n`));
      }

      if (up.attachments && up.attachments.length > 0) {
        text += `\n🔗 ลิงก์เอกสาร:\n`;
        up.attachments.forEach((a) => (text += `  📎 ${a.title}: ${a.url}\n`));
      }

      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\nติดตามข้อมูลฉบับเต็มได้ที่: TSRI ONE LINK System`;

    navigator.clipboard.writeText(text);
    setCopiedDigest(true);
    showToast('📋 คัดลอกสรุปรายงานประจำวันสำหรับส่ง LINE / Slack แล้ว');
    setTimeout(() => setCopiedDigest(false), 3000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: DailyUpdateItem) => {
    setEditingItem(item);
    setFormData({
      team_category: item.team_category,
      author_id: item.author_id,
      date: item.date,
      workstream_code: item.workstream_code || 'WS01',
      completed_text: item.completed_today.join('\n'),
      in_progress_text: (item.in_progress_today || []).join('\n'),
      planned_text: item.planned_tomorrow.join('\n'),
      blockers_text: (item.blockers || []).join('\n'),
      attachment_title: item.attachments?.[0]?.title || '',
      attachment_url: item.attachments?.[0]?.url || '',
      progress_percentage: item.progress_percentage || 40,
      mood: item.mood || 'GOOD',
    });
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายงานบันทึกนี้ใช่หรือไม่?')) {
      deleteStoredDailyUpdate(id);
      loadUpdates();
      showToast('🗑️ ลบบันทึกเรียบร้อยแล้ว');
    }
  };

  const totalBlockers = updates.reduce((acc, curr) => acc + (curr.blockers?.length || 0), 0);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800 font-sans">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm font-semibold animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#062B63] via-[#0D418A] to-[#1356A3] text-white p-6 rounded-3xl shadow-md border border-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-3 py-0.5 text-xs font-mono font-bold bg-amber-500 text-[#062B63] rounded-full shadow-xs">
                  DAILY CADENCE & WORK LOG
                </span>
                <span className="text-xs font-semibold text-blue-200">
                  ระบบบันทึกและติดตามการทำงานรายวันของคณะทำงานทุกฝ่าย
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                บันทึกและติดตามการทำงานรายวัน (Daily Work Updates)
              </h1>
              <p className="text-xs md:text-sm text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                อัพเดทความคืบหน้ารายวันของ 4 คณะทำงาน สรุปสิ่งที่ทำเสร็จ แผนงานถัดไป ข้อติดขัด (Blockers) และลิงก์เอกสาร เพื่อให้ทุกฝ่ายเข้าใจตรงกันเสมอ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleCopyDigest}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-white/20 shadow-xs cursor-pointer"
                title="คัดลอกข้อความสรุปรายวันสำหรับแชร์ใน LINE กลุ่ม"
              >
                {copiedDigest ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-orange-400" />
                )}
                <span>{copiedDigest ? 'คัดลอกแล้ว!' : 'คัดลอกสรุปประจำวัน (LINE)'}</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    team_category: 'CORE_PM',
                    author_id: mockCurrentUser.id,
                    date: new Date().toISOString().split('T')[0],
                    workstream_code: 'WS01',
                    completed_text: '',
                    in_progress_text: '',
                    planned_text: '',
                    blockers_text: '',
                    attachment_title: '',
                    attachment_url: '',
                    progress_percentage: 40,
                    mood: 'GOOD',
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#062B63] text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกอัพเดทวันนี้ (Daily Check-in)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              รายงานทั้งหมด
            </div>
            <div className="text-xl md:text-2xl font-mono font-extrabold text-[#062B63] mt-1">
              {updates.length} ฉบับ
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              คณะทำงานที่อัพเดท
            </div>
            <div className="text-xl md:text-2xl font-mono font-extrabold text-emerald-600 mt-1">
              4 / 4 ทีม
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              สถานะ Gate ปัจจุบัน
            </div>
            <div className="text-xl md:text-2xl font-mono font-extrabold text-blue-600 mt-1">
              G2 (Research)
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ข้อติดขัด (Blockers)
            </div>
            <div className="text-xl md:text-2xl font-mono font-extrabold text-amber-600 mt-1 flex items-center gap-1">
              {totalBlockers} จุด {totalBlockers > 0 && <span className="text-xs">⚠️</span>}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {TEAM_CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTeam(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedTeam === tab.id
                    ? `${tab.color} shadow-xs`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{tab.name}</span>
                {tab.id !== 'ALL' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                    {updates.filter((u) => u.team_category === tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ กิจกรรม คณะทำงาน หรือปัญหาอุปสรรค..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062B63]"
            />
          </div>
        </div>

        {/* Daily Timeline Feed */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
              <div className="font-bold text-sm">ไม่พบบันทึกรายงานการทำงานที่ค้นหา</div>
              <p className="text-xs">
                ลองปรับตัวกรองหรือกดปุ่ม <strong>"+ บันทึกอัพเดทวันนี้"</strong> เพื่อเริ่มต้นบันทึก
              </p>
            </div>
          ) : (
            filteredUpdates.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition space-y-4 relative group"
              >
                {/* Card Top: Author & Team info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.author_avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                      }
                      alt={item.author_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-400 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900">
                          {item.author_name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-[#062B63] font-bold rounded-md border border-blue-200">
                          {item.workstream_code || 'WS01'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Gate: {item.gate_milestone || 'G2'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span>{item.author_role}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{item.team_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      <span>{item.date}</span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Main Body: 3 Columns or Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: สิ่งที่ทำเสร็จวันนี้ */}
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>สิ่งที่ทำเสร็จวันนี้ (Completed Today)</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {item.completed_today.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: แผนงานสำหรับวันพรุ่งนี้ */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>แผนงานวันถัดไป (Planned Tomorrow)</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {item.planned_tomorrow.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold shrink-0">→</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: สิ่งที่กำลังทำ & ข้อติดขัด */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    {/* In Progress */}
                    {item.in_progress_today && item.in_progress_today.length > 0 && (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>กำลังทำอยู่ (In Progress):</span>
                        </div>
                        <ul className="space-y-1 text-slate-600">
                          {item.in_progress_today.map((ip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold shrink-0">•</span>
                              <span>{ip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Blockers Banner */}
                    {item.blockers && item.blockers.length > 0 ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <div className="font-bold text-rose-900 flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>ปัญหา / ข้อติดขัด (Blockers):</span>
                        </div>
                        <ul className="space-y-1 text-rose-800 text-[11px]">
                          {item.blockers.map((b, i) => (
                            <li key={i}>⚠️ {b}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" /> ไม่มีข้อติดขัด (No Blockers)
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments Footer */}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">เอกสารแนบ:</span>
                    {item.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-[#062B63] font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-orange-500" />
                        <span>{att.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal: Daily Check-in Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
              <div className="p-5 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                    DAILY STANDUP & WORK UPDATE
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    {editingItem ? 'แก้ไขบันทึกการทำงานรายวัน' : 'บันทึกรายงานการทำงานรายวัน (Daily Check-in)'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">คณะทำงาน (Team)</label>
                    <select
                      value={formData.team_category}
                      onChange={(e) =>
                        setFormData({ ...formData, team_category: e.target.value as TeamCategory })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#062B63]"
                    >
                      <option value="CORE_PM">1. ฝ่ายบริหารโครงการ (Core PM)</option>
                      <option value="ADVISORY_LEGAL">2. ที่ปรึกษากฎหมายภาครัฐ</option>
                      <option value="ADVISORY_PRIVATE">3. ที่ปรึกษาภาคเอกชน/IP</option>
                      <option value="ADVISORY_HRD">4. ที่ปรึกษา HRD/พัฒนาองค์กร</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ผู้รายงาน (Member)</label>
                    <select
                      value={formData.author_id}
                      onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      {mockTeamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.nickname || m.roleTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">วันที่ (Date)</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Workstream ที่เกี่ยวข้อง</label>
                    <select
                      value={formData.workstream_code}
                      onChange={(e) => setFormData({ ...formData, workstream_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    >
                      <option value="WS01">WS01: Project Setup & Baseline</option>
                      <option value="WS02">WS02: Legal & Regulatory Framework</option>
                      <option value="WS03">WS03: Gap Analysis & Field Interviews</option>
                      <option value="WS04">WS04: Recommendations & Guidelines</option>
                      <option value="WS05">WS05: Knowledge Management Platform</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ความคืบหน้า (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, progress_percentage: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                {/* What was completed today */}
                <div>
                  <label className="block font-bold text-emerald-900 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>สิ่งที่ทำเสร็จวันนี้ (Completed Today — ขึ้นบรรทัดใหม่สำหรับแต่ละข้อ)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.completed_text}
                    onChange={(e) => setFormData({ ...formData, completed_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl bg-emerald-50/30 leading-relaxed font-sans"
                    placeholder="• ข้อที่ 1&#10;• ข้อที่ 2"
                    required
                  />
                </div>

                {/* In Progress Today */}
                <div>
                  <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>สิ่งที่กำลังดำเนินการอยู่ (In Progress — ถ้ามี)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.in_progress_text}
                    onChange={(e) => setFormData({ ...formData, in_progress_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-amber-200 rounded-xl bg-amber-50/30 leading-relaxed font-sans"
                    placeholder="กำลังยกร่างคู่มือ SOP..."
                  />
                </div>

                {/* Planned for tomorrow */}
                <div>
                  <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>แผนงานสำหรับวันพรุ่งนี้ / ถัดไป (Planned Tomorrow)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.planned_text}
                    onChange={(e) => setFormData({ ...formData, planned_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-blue-200 rounded-xl bg-blue-50/30 leading-relaxed font-sans"
                    placeholder="• นัดสัมภาษณ์ผู้บริหาร สกสว.&#10;• สรุปผลการประชุมร่วม"
                    required
                  />
                </div>

                {/* Blockers */}
                <div>
                  <label className="block font-bold text-rose-900 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>ปัญหา / อุปสรรค / ข้อติดขัด (Blockers — ถ้ามี)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.blockers_text}
                    onChange={(e) => setFormData({ ...formData, blockers_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-rose-200 rounded-xl bg-rose-50/30 leading-relaxed font-sans"
                    placeholder="รอเอกสารระเบียบ กสว. ฉบับแก้ไขเพิ่มเติม..."
                  />
                </div>

                {/* Attachments / Google Drive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ชื่อเอกสาร / ลิงก์</label>
                    <input
                      type="text"
                      value={formData.attachment_title}
                      onChange={(e) => setFormData({ ...formData, attachment_title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      placeholder="เช่น Google Drive สรุปการประชุม"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">URL (Google Drive / ลิงก์)</label>
                    <input
                      type="url"
                      value={formData.attachment_url}
                      onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-blue-600 font-mono"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 -mx-6 -mb-6 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-orange-400" />
                    <span>บันทึกรายงานรายวัน</span>
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
