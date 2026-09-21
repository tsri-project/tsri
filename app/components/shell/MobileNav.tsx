import { NavLink } from '@remix-run/react';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  Calendar,
  Layers,
} from 'lucide-react';
import { cn } from '~/lib/utils';

const mobileNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'TOR & Work', path: '/tor', icon: FileCheck2 },
  { name: 'Documents', path: '/documents', icon: FolderKanban },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
];

export function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition',
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-5 h-5 mb-0.5',
                    isActive ? 'text-blue-400 stroke-[2.5]' : 'text-slate-400'
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
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200"
      >
        <Layers className="w-5 h-5 mb-0.5 text-slate-400" />
        <span>ทั้งหมด</span>
      </button>
    </nav>
  );
}
