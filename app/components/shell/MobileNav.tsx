import { NavLink, Link } from '@remix-run/react';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  ListTodo,
  Layers,
  Plus,
} from 'lucide-react';
import { cn } from '~/lib/utils';

export function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none safe-area-pb">
      <nav
        aria-label="เมนูหลักสำหรับมือถือ"
        className="pointer-events-auto floating-mobile-dock flex items-center justify-between px-3 py-2 max-w-md mx-auto"
      >
        {/* 1. ภาพรวม */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[11px] font-medium transition-all duration-150',
              isActive
                ? 'text-[#062B63] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-blue-50 text-[#1356A3]' : 'text-slate-400'
                )}
              >
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="mt-0.5">ภาพรวม</span>
            </>
          )}
        </NavLink>

        {/* 2. งานวิจัย (Tasks) */}
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[11px] font-medium transition-all duration-150',
              isActive
                ? 'text-[#062B63] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-400'
                )}
              >
                <ListTodo className="w-5 h-5" />
              </div>
              <span className="mt-0.5">งานวิจัย</span>
            </>
          )}
        </NavLink>

        {/* 3. Center Elevated Action Button (+) */}
        <div className="relative -top-3 flex flex-col items-center">
          <Link
            to="/daily"
            aria-label="บันทึกงานรายวัน"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#062B63] via-[#1356A3] to-[#2C73C7] text-white flex items-center justify-center shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white ring-4 ring-slate-100/60"
            title="บันทึกงานรายวัน"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <span className="text-[10px] font-bold text-slate-600 mt-1">บันทึกงาน</span>
        </div>

        {/* 4. ผลส่งมอบ (TOR) */}
        <NavLink
          to="/tor"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[11px] font-medium transition-all duration-150',
              isActive
                ? 'text-[#062B63] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-orange-50 text-[#F36C21]' : 'text-slate-400'
                )}
              >
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="mt-0.5">ผลส่งมอบ</span>
            </>
          )}
        </NavLink>

        {/* 5. เมนูทั้งหมด */}
        <button
          onClick={onOpenMenu}
          aria-label="เปิดเมนูทั้งหมด"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-all duration-150"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <span className="mt-0.5">ทั้งหมด</span>
        </button>
      </nav>
    </div>
  );
}
