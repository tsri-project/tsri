import {
  FileCheck2,
  AlertCircle,
  FileClock,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { ExecutiveDashboardData } from '~/types';

interface MetricCardsProps {
  data: ExecutiveDashboardData;
}

export function MetricCards({ data }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* 1. TOR Coverage Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-[#1356A3]/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            TOR COVERAGE
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1356A3] flex items-center justify-center border border-blue-100">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {data.torCoveragePercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              +15% จากเดือนก่อน
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1356A3] via-[#168A91] to-[#F36C21] h-full rounded-full transition-all duration-500"
              style={{ width: `${data.torCoveragePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Deliverables Progress */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            DELIVERABLES PROGRESS
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {data.deliverablesProgress.completed}
            </span>
            <span className="text-sm text-slate-500 font-mono font-medium">
              / {data.deliverablesProgress.total} รายการ
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1356A3]"></span> กำลังทำ {data.deliverablesProgress.inProgress}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F36C21]"></span> รอตรวจ {data.deliverablesProgress.pendingReview}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Review & Evidence Gap */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            PENDING & GAPS
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F36C21] flex items-center justify-center border border-amber-100">
            <FileClock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-[#F36C21] font-mono">
                {data.pendingReviewsCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">เอกสารรอตรวจทาน</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-rose-600 font-mono">
                {data.evidenceGapCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Evidence Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Open Risk & Open Decision */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            RAID & DECISIONS
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-50 text-[#062B63] flex items-center justify-center border border-slate-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-rose-600 font-mono">
                {data.openRisksCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">ความเสี่ยงเปิดอยู่</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#168A91] font-mono">
                {data.openDecisionsCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">มติที่รอตัดสินใจ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
