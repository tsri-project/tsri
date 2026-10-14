import { NavLink } from '@remix-run/react';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  Calendar,
  Layers,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { cn } from '~/lib/utils';

const mobileNavItems = [
  { name: 'ภาพรวม', path: '/dashboard', icon: LayoutDashboard },
  { name: 'ผลส่งมอบ', path: '/tor', icon: FileCheck2 },
  { name: 'ตรวจสอบ', path: '/reviews', icon: CheckCircle2 },
  { name: 'เอกสาร', path: '/documents', icon: FolderKanban },
];

export function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs font-semibold transition',
                isActive
                  ? 'text-[#062B63] font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-5 h-5 mb-0.5',
                    isActive ? 'text-[#F36C21] stroke-[2.5]' : 'text-slate-400'
                  )}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <Layers className="w-5 h-5 mb-0.5 text-slate-400" />
        <span>ทั้งหมด</span>
      </button>
    </nav>
  );
}
