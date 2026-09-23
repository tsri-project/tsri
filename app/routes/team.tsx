import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockTeamMembers } from '~/lib/mock-data';
import { useAuth, UserRole } from '~/lib/use-auth';
import { supabase } from '~/lib/supabase.client';
import {
  Users2,
  Shield,
  Briefcase,
  Target,
  FileCheck2,
  HelpCircle,
  Building,
  Mail,
  CheckCircle2,
  Layers,
  Sparkles,
  Award,
  UserCheck,
  UserX,
  PlusCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  Loader2,
  ShieldAlert,
  Crown,
} from 'lucide-react';
import { cn } from '~/lib/utils';

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  organization: string;
  requested_role: UserRole;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

interface ProjectMemberRecord {
  id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profiles?: {
    id: string;
    email: string;
    full_name: string;
    organization: string;
  };
}

export default function TeamRoute() {
  const { user, profile, role: currentUserRole, isAdminOrPm } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Supabase Data State
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [dbMembers, setDbMembers] = useState<ProjectMemberRecord[]>([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected role overrides for pending requests
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});

  // Direct add member form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('legal_advisor');

  const categories = [
    { id: 'ALL', name: 'สมาชิกทั้งหมด (All 3 Teams)' },
    { id: 'CORE_PM', name: '1. ทีมบริหารโครงการ (Core PM Team)' },
    { id: 'ADVISORY_LEGAL', name: '2.1 ที่ปรึกษากฎหมาย & ระเบียบ ววน.' },
    { id: 'ADVISORY_PRIVATE', name: '2.2 ที่ปรึกษากฎหมายธุรกิจ & การลงทุน' },
    { id: 'ADVISORY_HRD', name: '2.3 ที่ปรึกษา Learning & HRD' },
    ...(isAdminOrPm
      ? [
          {
            id: 'ADMIN_APPROVAL',
            name: `🛡️ ศูนย์อนุมัติสิทธิ์ PM Admin ${
              pendingRequests.length > 0 ? `(${pendingRequests.length} รออนุมัติ)` : ''
            }`,
          },
        ]
      : []),
  ];

  const fetchAdminData = useCallback(async () => {
    if (!isAdminOrPm) return;
    setIsLoadingAdminData(true);

    try {
      // 1. Fetch pending requests
      const { data: reqData, error: reqErr } = await supabase
        .from('user_access_requests')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (!reqErr && reqData) {
        setPendingRequests(reqData as AccessRequest[]);
        // Initialize default roles in state
        const initialRoles: Record<string, UserRole> = {};
        reqData.forEach((r: AccessRequest) => {
          initialRoles[r.id] = r.requested_role || 'legal_advisor';
        });
        setSelectedRoles(initialRoles);
      }

      // 2. Fetch project members with profiles
      const { data: memData, error: memErr } = await supabase
        .from('project_members')
        .select('id, user_id, role, joined_at, profiles(id, email, full_name, organization)')
        .order('joined_at', { ascending: true });

      if (!memErr && memData) {
        setDbMembers(memData as unknown as ProjectMemberRecord[]);
      }
    } catch (err) {
      console.error('Error fetching admin team data:', err);
    } finally {
      setIsLoadingAdminData(false);
    }
  }, [isAdminOrPm]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleApprove = async (request: AccessRequest) => {
    const roleToAssign = selectedRoles[request.id] || request.requested_role || 'viewer';
    setActionLoadingId(request.id);
    setActionMessage(null);

    try {
      // 1. Try calling the RPC function
      const { error: rpcErr } = await supabase.rpc('approve_user_access_request', {
        p_request_id: request.id,
        p_assigned_role: roleToAssign,
      });

      if (rpcErr) {
        // Fallback: Direct DB upsert
        const { data: project } = await supabase.from('projects').select('id').limit(1).single();
        const projectId = project?.id || 'b81c9b34-6009-4505-a4eb-70fc4d759d36';

        await supabase.from('profiles').upsert({
          id: request.user_id,
          email: request.email,
          full_name: request.full_name,
          organization: request.organization || 'สกสว.',
        });

        await supabase.from('project_members').upsert(
          {
            project_id: projectId,
            user_id: request.user_id,
            role: roleToAssign,
          },
          { onConflict: 'project_id,user_id' }
        );

        await supabase
          .from('user_access_requests')
          .update({
            status: 'APPROVED',
            requested_role: roleToAssign,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', request.id);
      }

      setActionMessage({
        type: 'success',
        text: `อนุมัติการเข้าใช้งานของ "${request.full_name}" (${request.email}) ในบทบาท ${roleToAssign} สำเร็จ!`,
      });
      await fetchAdminData();
    } catch (err: any) {
      console.error('Approval error:', err);
      setActionMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการอนุมัติ: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (request: AccessRequest) => {
    if (!window.confirm(`ยืนยันการปฏิเสธคำขอของ ${request.full_name} (${request.email})?`)) return;

    setActionLoadingId(request.id);
    setActionMessage(null);

    try {
      const { error: rpcErr } = await supabase.rpc('reject_user_access_request', {
        p_request_id: request.id,
        p_reason: 'ปฏิเสธโดย PM Admin',
      });

      if (rpcErr) {
        await supabase
          .from('user_access_requests')
          .update({
            status: 'REJECTED',
            reason: 'ปฏิเสธโดย PM Admin',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', request.id);
      }

      setActionMessage({
        type: 'success',
        text: `ปฏิเสธคำขอของ "${request.full_name}" เรียบร้อยแล้ว`,
      });
      await fetchAdminData();
    } catch (err: any) {
      console.error('Reject error:', err);
      setActionMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการปฏิเสธคำขอ: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      setActionMessage({
        type: 'success',
        text: 'ปรับปรุงบทบาทสมาชิกเรียบร้อยแล้ว',
      });
      await fetchAdminData();
    } catch (err: any) {
      console.error('Update role error:', err);
      setActionMessage({
        type: 'error',
        text: `ปรับปรุงบทบาทไม่สำเร็จ: ${err.message}`,
      });
    }
  };

  const handleRemoveMember = async (member: ProjectMemberRecord) => {
    const memberName = member.profiles?.full_name || member.profiles?.email || 'สมาชิก';
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการเพิกถอนสิทธิ์ของ "${memberName}" ออกจากโครงการ?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('project_members').delete().eq('id', member.id);
      if (error) throw error;

      setActionMessage({
        type: 'success',
        text: `เพิกถอนสิทธิ์ของ "${memberName}" เรียบร้อยแล้ว`,
      });
      await fetchAdminData();
    } catch (err: any) {
      console.error('Remove member error:', err);
      setActionMessage({
        type: 'error',
        text: `เพิกถอนสิทธิ์ไม่สำเร็จ: ${err.message}`,
      });
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'project_admin':
        return 'ผู้ดูแลระบบสูงสุด (Project Admin)';
      case 'pm':
        return 'ผู้จัดการโครงการ (PM)';
      case 'legal_advisor':
        return 'ที่ปรึกษากฎหมาย (Legal Advisor)';
      case 'researcher':
        return 'นักวิจัย (Researcher)';
      case 'hrd':
        return 'ทีม HRD & การเรียนรู้';
      case 'stakeholder':
        return 'Stakeholder / บพท.';
      case 'viewer':
        return 'ผู้สังเกตการณ์ (Viewer)';
      default:
        return r;
    }
  };

  const filteredMembers =
    activeTab === 'ALL'
      ? mockTeamMembers
      : mockTeamMembers.filter((m) => m.teamCategory === activeTab);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 13: PROJECT TEAM & ACCESS CONTROL
              </span>
              <span className="text-xs font-semibold text-slate-500">
                โครงสร้างคณะทำงานและระบบอนุมัติสิทธิ์สมาชิก
              </span>
              {isAdminOrPm && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  สิทธิ์ผู้ดูแลระบบ PM Admin: dencapvision@gmail.com
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              รายชื่อคณะทำงานและทีมที่ปรึกษาโครงการ (3 ทีมหลัก)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              โครงสร้างการทำงานแบบบูรณาการตามมติการประชุม Kick-off: ทีมบริหารโครงการ (เจ้าภาพขับเคลื่อน) ➔ ทีมที่ปรึกษา (ผู้ตรวจสอบและรับรองความถูกต้องตาม WORK-WS05-001A) ➔ ทีม HRD (ผู้แปลงองค์ความรู้สู่การเรียนรู้)
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl self-start md:self-auto shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#062B63] text-white flex items-center justify-center font-bold font-mono text-base">
              {mockTeamMembers.length}
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-bold text-slate-800">ผู้เชี่ยวชาญ & ทีมงาน</div>
              <div className="text-[11px] text-slate-500">3 คณะทำงานหลัก</div>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div
            className={cn(
              'p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs',
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            )}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Categories Tab */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                activeTab === cat.id
                  ? cat.id === 'ADMIN_APPROVAL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-[#062B63] text-white shadow-sm'
                  : cat.id === 'ADMIN_APPROVAL'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ADMIN TAB: APPROVALS & MEMBER MANAGEMENT */}
        {activeTab === 'ADMIN_APPROVAL' && isAdminOrPm && (
          <div className="space-y-6">
            {/* Section 1: Pending Applications */}
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      คำขอเข้าใช้งานที่รอการอนุมัติ (Pending Access Requests)
                    </h2>
                    <p className="text-xs text-slate-500">
                      สมาชิกที่ลงทะเบียนเข้ามาและรอ PM Admin (ครูเด่น) มอบหมายบทบาทเพื่อเข้าถึงข้อมูลโครงการ
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={isLoadingAdminData}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoadingAdminData && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  รีเฟรชข้อมูล
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">ไม่มีคำขอรออนุมัติในขณะนี้</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    เมื่อมีทีมงานลงทะเบียนผ่านหน้าแรก คำขอจะปรากฏในตารางนี้ทันที
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{req.full_name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-amber-200 text-amber-800 font-bold">
                            {req.email}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          <span>
                            <strong className="text-slate-700">สังกัด:</strong> {req.organization || 'สกสว.'}
                          </span>
                          <span>
                            <strong className="text-slate-700">ขอตำแหน่ง:</strong> {getRoleLabel(req.requested_role)}
                          </span>
                        </div>
                        {req.reason && (
                          <div className="text-[11px] text-slate-500 bg-white/80 p-2 rounded-xl border border-amber-100 max-w-xl">
                            <strong className="text-slate-700">เหตุผล/หน้าที่:</strong> {req.reason}
                          </div>
                        )}
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600">มอบหมายสิทธิ์:</span>
                          <select
                            value={selectedRoles[req.id] || req.requested_role || 'legal_advisor'}
                            onChange={(e) =>
                              setSelectedRoles({ ...selectedRoles, [req.id]: e.target.value as UserRole })
                            }
                            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#062B63]"
                          >
                            <option value="legal_advisor">ที่ปรึกษากฎหมาย (Legal Advisor)</option>
                            <option value="researcher">ทีมวิจัย (Researcher)</option>
                            <option value="hrd">ทีม HRD & การเรียนรู้</option>
                            <option value="pm">ผู้จัดการโครงการ (PM)</option>
                            <option value="project_admin">ผู้ดูแลระบบสูงสุด (Project Admin)</option>
                            <option value="stakeholder">Stakeholder / บพท.</option>
                            <option value="viewer">ผู้สังเกตการณ์ (Viewer)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleApprove(req)}
                          disabled={actionLoadingId === req.id}
                          className="px-3.5 py-1.5 bg-[#062B63] hover:bg-[#1356A3] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          อนุมัติ
                        </button>

                        <button
                          onClick={() => handleReject(req)}
                          disabled={actionLoadingId === req.id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Active System Members from Supabase Database */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-blue-100 text-[#062B63] rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    สมาชิกโครงการที่ได้รับอนุมัติในระบบจริง (Active Database Members)
                  </h2>
                  <p className="text-xs text-slate-500">
                    ผู้ใช้งานที่มีสิทธิ์เข้าถึงฐานข้อมูล Supabase และโมดูล Review ตามนโยบายความปลอดภัย RLS
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-800 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">ชื่อ - นามสกุล</th>
                      <th className="p-3">อีเมลผู้ใช้งาน</th>
                      <th className="p-3">หน่วยงาน</th>
                      <th className="p-3">บทบาทในระบบ (Role)</th>
                      <th className="p-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#062B63] text-white flex items-center justify-center font-bold text-[11px]">
                            {m.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span>{m.profiles?.full_name || 'ผู้ใช้งานโครงการ'}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{m.profiles?.email || '-'}</td>
                        <td className="p-3 text-slate-600">{m.profiles?.organization || 'สกสว.'}</td>
                        <td className="p-3">
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateMemberRole(m.id, e.target.value as UserRole)}
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-xs font-bold border',
                              m.role === 'project_admin'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : m.role === 'pm'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : m.role === 'legal_advisor'
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            )}
                          >
                            <option value="project_admin">👑 Project Admin</option>
                            <option value="pm">💼 PM (ผู้จัดการโครงการ)</option>
                            <option value="legal_advisor">⚖️ ที่ปรึกษากฎหมาย</option>
                            <option value="researcher">🔬 นักวิจัย</option>
                            <option value="hrd">📚 ทีม HRD</option>
                            <option value="stakeholder">🤝 Stakeholder</option>
                            <option value="viewer">👁️ Viewer</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          {m.profiles?.email !== 'dencapvision@gmail.com' && (
                            <button
                              onClick={() => handleRemoveMember(m)}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold border border-rose-200 transition cursor-pointer"
                            >
                              เพิกถอนสิทธิ์
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TEAM GRID (DEFAULT VIEW) */}
        {activeTab !== 'ADMIN_APPROVAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {member.name}{' '}
                        {member.nickname && (
                          <span className="text-slate-500 font-normal">({member.nickname})</span>
                        )}
                      </h3>
                      <div className="text-xs text-[#062B63] font-semibold mt-0.5">
                        {member.roleTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{member.organization}</span>
                      </div>
                    </div>
                  </div>

                  {member.strategicFit && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mb-4 leading-relaxed">
                      <span className="font-bold text-slate-900">บทบาทเชิงยุทธศาสตร์: </span>
                      {member.strategicFit}
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#F36C21]" />
                      ความรับผิดชอบหลัก:
                    </div>
                    <ul className="space-y-1 pl-4 text-slate-600 list-disc text-[11px] leading-relaxed">
                      {member.mainResponsibilities.slice(0, 3).map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  {member.email && (
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {member.email}
                    </span>
                  )}
                  {member.deliverableLinks && (
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold border border-slate-200">
                      {member.deliverableLinks.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
