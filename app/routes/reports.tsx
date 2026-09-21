import { AppLayout } from '~/components/shell/AppLayout';
import { FileBarChart } from 'lucide-react';

export default function ReportsRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-amber-400 font-mono">
            MODULE 12: FORMAL REPORTS
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            ศูนย์รายงานฉบับทางการและเอกสารเผยแพร่
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            รายงานความก้าวหน้า รายงานรอบ 6 เดือน และรายงานฉบับสมบูรณ์เสนอผู้บริหาร สกสว.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
