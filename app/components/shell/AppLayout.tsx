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
} from 'lucide-react';
import { Link } from '@remix-run/react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

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
                {mockProject.organization} • One Link for All
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
              title="สืบค้นด่วน (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">ค้นหาด่วน...</span>
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
              <div className="font-bold text-white text-base">TSRI Main Modules</div>
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              1. Executive Dashboard
            </Link>
            <Link
              to="/tor"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              2. TOR & Deliverables
            </Link>
            <Link
              to="/tasks"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              3. Project Tasks
            </Link>
            <Link
              to="/documents"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              4. Document Center & Versions
            </Link>
            <Link
              to="/legal-inventory"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              5. Legal Inventory
            </Link>
            <Link
              to="/traceability"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              6. Traceability Explorer
            </Link>
            <Link
              to="/calendar"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              7-8. Calendar & Meeting Center
            </Link>
            <Link
              to="/reviews"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              9. Review Center
            </Link>
            <Link
              to="/raid"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              10. RAID & Decision Log
            </Link>
            <Link
              to="/knowledge"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              11. Knowledge & Learning
            </Link>
            <Link
              to="/reports"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              12. Reports
            </Link>
            <Link
              to="/team"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="block p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
            >
              13. Team & RBAC
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
