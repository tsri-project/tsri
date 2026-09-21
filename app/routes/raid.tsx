import { AppLayout } from '~/components/shell/AppLayout';
import { AlertTriangle } from 'lucide-react';

export default function RaidRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-rose-400 font-mono">
            MODULE 10: RAID & DECISION LOG
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            ทะเบียนความเสี่ยง ประเด็นปัญหา และมติการตัดสินใจ (RAID Log)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Risks, Assumptions, Issues, Dependencies และประวัติการตัดสินใจเชิงนโยบาย
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
