import { AppLayout } from '~/components/shell/AppLayout';
import { CheckCircle2 } from 'lucide-react';

export default function ReviewsRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-emerald-400 font-mono">
            MODULE 9: REVIEW CENTER
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            ศูนย์กลั่นกรองและรับรองผลงาน (Review & Validation Center)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            กระบวนการ Peer Review, Legal Advisor Validation, และ Expert Review สำหรับเอกสารทุกเวอร์ชัน
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
