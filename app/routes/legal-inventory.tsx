import { AppLayout } from '~/components/shell/AppLayout';
import { Scale, BookOpen, CheckCircle2, ShieldAlert, FileBarChart, Users } from 'lucide-react';

export default function LegalInventoryRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-blue-400 font-mono">
            MODULE 5: LEGAL INVENTORY
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            คลังสารสนเทศกฎหมายและระเบียบ สกสว.
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            รวบรวม จำแนกหมวดหมู่ และวิเคราะห์เนื้อหาบทบัญญัติกฎหมาย พระราชบัญญัติ ระเบียบ ข้อบังคับ
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
