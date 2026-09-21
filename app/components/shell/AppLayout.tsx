import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GlobalSearch } from './GlobalSearch';
import { GateStatusBadge } from './GateStatusBadge';
import { mockProject, mockCurrentUser } from '~/lib/mock-data';
import {
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Building2,
  Settings,
} from 'lucide-react';
import { Link } from '@remix-run/react';

const mobileMenuItems = [
  { id: '01', name: '01 ภาพรวมโครงการ', path: '/dashboard' },
  { id: '02', name: '02 TOR & ผลส่งมอบ', path: '/tor' },
  { id: '03', name: '03 งานของโครงการ', path: '/tasks' },
  { id: '04', name: '04 ศูนย์เอกสาร', path: '/documents' },
  { id: '05', name: '05 กฎหมายและระเบียบ', path: '/legal-inventory' },
  { id: '06', name: '06 Traceability', path: '/traceability' },
  { id: '07', name: '07 ปฏิทินโครงการ', path: '/calendar' },
  { id: '08', name: '08 การประชุม', path: '/meetings' },
  { id: '09', name: '09 Review Center', path: '/reviews' },
  { id: '10', name: '10 Risk / Issue / Decision', path: '/raid' },
  { id: '11', name: '11 Knowledge & Learning', path: '/knowledge' },
  { id: '12', name: '12 รายงาน', path: '/reports' },
  { id: '13', name: '13 ทีมงานและสิทธิ์', path: '/team' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Navigation */}
        <header className="h-16 px-4 md:px-6 bg-slate-900/80 border-b border-slate-800 backdrop-blur flex items-center justify-between gap-4 z-30 shrink-0">
          {/* Left: Mobile Toggle & Project Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white truncate max-w-[220px] sm:max-w-md lg:max-w-lg">
                  {mockProject.title}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  {mockProject.code}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                {mockProject.organization} • One Project One Link
              </div>
            </div>
          </div>

          {/* Center / Right: Gate Status & Global Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Gate Status Pill */}
            <GateStatusBadge currentGate={mockProject.current_gate} showDetails={true} />

            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-300 transition shadow-inner"
              title="ค้นหาทั้งระบบ (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">ค้นหาทั้งระบบ 🔍</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 bg-slate-900 text-[10px] text-slate-400 rounded border border-slate-700 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenMenu={() => setIsMobileDrawerOpen(true)} />
      </div>

      {/* Global Search Overlay Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Full Menu Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-400" />
              <div className="font-bold text-white text-base font-mono">TSRI ONE LINK</div>
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {mobileMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="block p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white font-medium text-xs hover:bg-slate-800 transition"
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-800 my-2 space-y-2">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full text-left p-3 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-300 font-semibold text-xs flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                ค้นหาทั้งระบบ 🔍
              </button>
              <Link
                to="/settings"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="block p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white font-medium text-xs"
              >
                ตั้งค่า
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
