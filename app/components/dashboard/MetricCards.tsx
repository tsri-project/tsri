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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOR Coverage Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">TOR Coverage</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {data.torCoveragePercentage}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">+15% จากเดือนก่อน</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.torCoveragePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Deliverables Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Deliverable Progress</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white font-mono">
              {data.deliverablesProgress.completed}
            </span>
            <span className="text-sm text-slate-400 font-mono">
              / {data.deliverablesProgress.total} รายการ
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> กำลังทำ {data.deliverablesProgress.inProgress}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> รอตรวจ {data.deliverablesProgress.pendingReview}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Review & Evidence Gap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending & Gaps</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileClock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {data.pendingReviewsCount}
              </div>
              <div className="text-[11px] text-slate-400">เอกสารรอตรวจทาน</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {data.evidenceGapCount}
              </div>
              <div className="text-[11px] text-slate-400">Evidence Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Open Risk & Open Decision */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">RAID & Decisions</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {data.openRisksCount}
              </div>
              <div className="text-[11px] text-slate-400">ความเสี่ยงเปิดอยู่</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                {data.openDecisionsCount}
              </div>
              <div className="text-[11px] text-slate-400">มติที่รอตัดสินใจ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
