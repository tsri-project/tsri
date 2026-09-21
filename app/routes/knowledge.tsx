import { AppLayout } from '~/components/shell/AppLayout';
import { BookOpen } from 'lucide-react';

export default function KnowledgeRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-cyan-400 font-mono">
            MODULE 11: KNOWLEDGE & LEARNING
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            คลังองค์ความรู้และบทเรียน (Lessons Learned & Knowledge Assets)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            ชุดองค์ความรู้ คู่มือการปฏิบัติงาน SOP และแนวปฏิบัติที่ดีสำหรับการบริหาร ววน.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
