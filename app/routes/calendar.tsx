import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockMeetings } from '~/lib/mock-data';
import { MeetingItem, ProjectGate } from '~/types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Users,
  CheckCircle,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { formatThaiDate, formatThaiDateTime } from '~/lib/utils';

export const clientLoader = async () => {
  return { meetings: mockMeetings };
};

export default function CalendarRoute() {
  const { meetings: initialMeetings } = useLoaderData<{ meetings: MeetingItem[] }>();
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Meeting Form
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState('คณะทำงาน');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newDuration, setNewDuration] = useState(120);
  const [newLocation, setNewLocation] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [newGate, setNewGate] = useState<ProjectGate>('G2');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newNumber || !newScheduledAt) return;

    const newMeeting: MeetingItem = {
      id: `meet-${Date.now()}`,
      project_id: 'proj-tsri-2026-01',
      meeting_number: newNumber,
      title: newTitle,
      meeting_type: newType,
      gate_ref: newGate,
      scheduled_at: new Date(newScheduledAt).toISOString(),
      duration_minutes: Number(newDuration),
      location_or_link: newLocation,
      agenda: newAgenda,
      status: 'SCHEDULED',
      attendees_count: 5,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewNumber('');
    setNewScheduledAt('');
    setNewLocation('');
    setNewAgenda('');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-xs font-semibold text-purple-400 font-mono">
              MODULE 7 & 8: CALENDAR & MEETING CENTER
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              ปฏิทินนัดหมายและศูนย์บันทึกการประชุม (MOM)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              กำหนดนัดหมายการประชุมคณะทำงาน, การกลั่นกรอง Gate Milestones และติดตามมติการประชุม
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            สร้างนัดหมายการประชุมใหม่
          </button>
        </div>

        {/* Meeting List & Detail Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                      {mtg.meeting_number}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {mtg.meeting_type}
                    </span>
                  </div>
                  {mtg.gate_ref && (
                    <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      Gate {mtg.gate_ref}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {mtg.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2 text-blue-300 font-medium">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{formatThaiDateTime(mtg.scheduled_at)}</span>
                    <span className="text-slate-500">•</span>
                    <span>({mtg.duration_minutes} นาที)</span>
                  </div>
                  {mtg.location_or_link && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{mtg.location_or_link}</span>
                    </div>
                  )}
                  {mtg.agenda && (
                    <div className="pt-2 border-t border-slate-800/60 text-slate-400 whitespace-pre-line text-[11px]">
                      <span className="font-semibold text-slate-300">วาระการประชุม:</span>
                      <div className="mt-1">{mtg.agenda}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  ผู้เข้าร่วม: {mtg.attendees_count || 0} ท่าน
                </span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    บันทึก MOM
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              กำหนดนัดหมายการประชุมใหม่ (New Meeting)
            </h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">รหัสการประชุม *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น MTG-2026-07"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ประเภทการประชุม</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                  >
                    <option value="คณะทำงาน">คณะทำงานวิจัย</option>
                    <option value="ผู้เชี่ยวชาญ">ประชุมผู้เชี่ยวชาญ & ผู้มีส่วนได้ส่วนเสีย</option>
                    <option value="Gate Review">Gate Review</option>
                    <option value="ประชุมภายใน">ประชุมภายในทีมงาน</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">หัวข้อการประชุม *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ประชุมพิจารณาร่างข้อเสนอแนะเชิงนโยบาย..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">วันและเวลาประชุม *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduledAt}
                    onChange={(e) => setNewScheduledAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">เชื่อมโยง Gate</label>
                  <select
                    value={newGate}
                    onChange={(e) => setNewGate(e.target.value as ProjectGate)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                  >
                    <option value="G0">G0: Project Baseline</option>
                    <option value="G1">G1: Source Verification</option>
                    <option value="G2">G2: Research Validation</option>
                    <option value="G3">G3: Analysis Validation</option>
                    <option value="G4">G4: Knowledge Validation</option>
                    <option value="G5">G5: Acceptance Readiness</option>
                    <option value="G6">G6: Release</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">สถานที่ หรือลิงก์การประชุม</label>
                <input
                  type="text"
                  placeholder="เช่น ห้องประชุม 501 สกสว. / Zoom Meeting Link"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">วาระการประชุม</label>
                <textarea
                  rows={3}
                  placeholder="ระบุวาระการประชุม..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  สร้างการประชุม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
