import { useState } from 'react';
import { navigationGroups } from './navigation';
import { useLocation } from '@remix-run/react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GlobalSearch } from './GlobalSearch';
import { useRequireAuth } from '~/lib/use-auth';
import { Search, Menu, X, Building2, Loader2 } from 'lucide-react';
import { Link } from '@remix-run/react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentPage =
    navigationGroups
      .flatMap((group) => group.items)
      .find((item) => item.path === location.pathname)?.name ||
    'โครงการกฎหมาย สกสว.';
  const { isLoading, isAuthenticated } = useRequireAuth('/login');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // If auth is verifying, show clean animated loading screen to prevent content flash
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3.5 p-6 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-xs w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#062B63] flex items-center justify-center text-white shadow-lg shadow-[#062B63]/20">
            <Building2 className="w-7 h-7 text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              TSRI One Link for All
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              PM & Legal Research Control
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#062B63] mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            <span>กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, return null while useRequireAuth navigates to /login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-shell flex h-dvh w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <a href="#main-content" className="skip-link">
        ข้ามไปเนื้อหาหลัก
      </a>
      {/* Desktop Sidebar */}
      <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Navigation in Light Theme */}
        <header className="h-16 px-4 md:px-8 bg-white/95 border-b border-slate-200 backdrop-blur-md flex items-center justify-between gap-4 z-30 shrink-0 shadow-2xs">
          {/* Left: Mobile Toggle & Project Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="เปิดเมนูทั้งหมด"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold text-slate-900 truncate max-w-[220px] sm:max-w-md lg:max-w-lg">
                  {currentPage}
                </h1>
              </div>
              <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                โครงการศึกษาและพัฒนาองค์ความรู้ด้านกฎหมาย สกสว.
              </div>
            </div>
          </div>

          {/* Center / Right: Gate Status & Global Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs text-slate-700 transition shadow-2xs"
              aria-label="ค้นหาข้อมูลทั้งระบบ"
              title="ค้นหาทั้งระบบ (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#1356A3]" />
              <span className="hidden md:inline font-medium">ค้นหาข้อมูล</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 bg-white text-[10px] text-slate-500 rounded border border-slate-200 font-mono shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto pb-24 md:pb-6 bg-slate-50"
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenMenu={() => setIsMobileDrawerOpen(true)} />
      </div>

      {/* Global Search Overlay Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Full Menu Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white/95 backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#1356A3]" />
              <div className="font-extrabold text-slate-900 text-base font-mono">
                TSRI ONE LINK
              </div>
            </div>
            <button
              aria-label="ปิดเมนู"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigationGroups.map((group) => (
              <section key={group.title} className="pb-3">
                <h2 className="px-3 py-2 text-sm text-slate-500">
                  {group.title}
                </h2>
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="block p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:text-slate-900 font-medium text-sm hover:bg-slate-100 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </section>
            ))}

            <div className="pt-3 border-t border-slate-200 my-2 space-y-2">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full text-left p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[#1356A3] font-bold text-xs flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                ค้นหาข้อมูล
              </button>
              <Link
                to="/settings"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="block p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-xs"
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
