import { NavLink } from '@remix-run/react';
import {
  LayoutDashboard,
  FileCheck2,
  ListTodo,
  FolderKanban,
  Scale,
  GitFork,
  Calendar,
  Users2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileBarChart,
  Building2,
  Search,
  Settings,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { mockCurrentUser } from '~/lib/mock-data';

interface SidebarProps {
  onOpenSearch?: () => void;
}

const mainNavigationItems = [
  { id: '01', name: '01 ภาพรวมโครงการ', path: '/dashboard', icon: LayoutDashboard },
  { id: '02', name: '02 TOR & ผลส่งมอบ', path: '/tor', icon: FileCheck2 },
  { id: '03', name: '03 งานของโครงการ', path: '/tasks', icon: ListTodo },
  { id: '04', name: '04 ศูนย์เอกสาร', path: '/documents', icon: FolderKanban },
  { id: '05', name: '05 กฎหมายและระเบียบ', path: '/legal-inventory', icon: Scale },
  { id: '06', name: '06 Traceability', path: '/traceability', icon: GitFork },
  { id: '07', name: '07 ปฏิทินโครงการ', path: '/calendar', icon: Calendar },
  { id: '08', name: '08 การประชุม', path: '/meetings', icon: MessagesSquare },
  { id: '09', name: '09 Review Center (Batch 1)', path: '/reviews', icon: CheckCircle2 },
  { id: '10', name: '10 Risk / Issue / Decision', path: '/raid', icon: AlertTriangle },
  { id: '11', name: '11 Knowledge & Learning', path: '/knowledge', icon: BookOpen },
  { id: '12', name: '12 รายงาน', path: '/reports', icon: FileBarChart },
  { id: '13', name: '13 ทีมงานและสิทธิ์', path: '/team', icon: Users2 },
];

export function Sidebar({ onOpenSearch }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 text-slate-700 select-none shrink-0 h-full font-sans shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white">
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xs">
          <Building2 className="w-5 h-5 text-[#F36C21]" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1.5 font-mono">
            TSRI ONE LINK
          </div>
          <div className="text-[10px] text-blue-100 font-medium truncate">
            PM & Legal Research Control
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {mainNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group',
                  isActive
                    ? 'bg-[#062B63] text-white shadow-xs border-l-4 border-[#F36C21]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-[#F36C21]' : 'text-slate-400 group-hover:text-[#1356A3]'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="pt-2 pb-1 border-t border-slate-100 my-2"></div>

        {/* Global Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group"
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#F36C21] group-hover:scale-110 transition-transform" />
              <span>ค้นหาทั้งระบบ 🔍</span>
            </span>
            <kbd className="px-1.5 py-0.2 bg-white text-[10px] text-slate-500 rounded border border-slate-200 font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Settings Link */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 mt-1',
              isActive
                ? 'bg-[#062B63] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )
          }
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>ตั้งค่า</span>
        </NavLink>
      </div>

      {/* Current User Card in Light Theme */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <img
            src={mockCurrentUser.avatar_url}
            alt={mockCurrentUser.full_name}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#F36C21] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-slate-900 truncate">
              {mockCurrentUser.full_name}
            </div>
            <div className="text-[10px] text-[#F36C21] font-mono font-bold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F36C21] shrink-0 animate-pulse"></span>
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
