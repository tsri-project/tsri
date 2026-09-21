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
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { mockCurrentUser } from '~/lib/mock-data';

const navigationItems = [
  { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'TOR & Deliverables', path: '/tor', icon: FileCheck2 },
  { name: 'Project Tasks', path: '/tasks', icon: ListTodo },
  { name: 'Document Center', path: '/documents', icon: FolderKanban },
  { name: 'Legal Inventory', path: '/legal-inventory', icon: Scale },
  { name: 'Traceability Explorer', path: '/traceability', icon: GitFork },
  { name: 'Calendar & Meetings', path: '/calendar', icon: Calendar },
  { name: 'Review Center', path: '/reviews', icon: CheckCircle2 },
  { name: 'RAID & Decisions', path: '/raid', icon: AlertTriangle },
  { name: 'Knowledge & Learning', path: '/knowledge', icon: BookOpen },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Team & RBAC', path: '/team', icon: Users2 },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 text-slate-300 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
            TSRI One Link
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-mono">
              v1.0
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
            PM & Legal Control Center
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Modules (13 ระบบหลัก)
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    )}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Current User Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
          <img
            src={mockCurrentUser.avatar_url}
            alt={mockCurrentUser.full_name}
            className="w-9 h-9 rounded-full object-cover border border-blue-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {mockCurrentUser.full_name}
            </div>
            <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              project_admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
