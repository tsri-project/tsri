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
      <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#f36c21]/50 transition">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            TOR Coverage
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#1356a3]/40 text-[#f36c21] flex items-center justify-center border border-[#1356a3]/50">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {data.torCoveragePercentage}%
            </span>
            <span className="text-xs text-[#20B2AA] font-bold">+15% จากเดือนก่อน</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full mt-3 overflow-hidden border border-[#1356a3]/30">
            <div
              className="bg-gradient-to-r from-[#1356a3] via-[#168a91] to-[#f36c21] h-full rounded-full transition-all duration-500"
              style={{ width: `${data.torCoveragePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Deliverables Progress */}
      <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#168a91]/50 transition">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Deliverable Progress
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#168a91]/30 text-[#168a91] flex items-center justify-center border border-[#168a91]/40">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white font-mono">
              {data.deliverablesProgress.completed}
            </span>
            <span className="text-sm text-slate-300 font-mono">
              / {data.deliverablesProgress.total} รายการ
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1356a3]"></span> กำลังทำ {data.deliverablesProgress.inProgress}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f36c21]"></span> รอตรวจ {data.deliverablesProgress.pendingReview}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Review & Evidence Gap */}
      <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#f36c21]/50 transition">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Pending & Gaps
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#f36c21]/20 text-[#f36c21] flex items-center justify-center border border-[#f36c21]/40">
            <FileClock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-[#f36c21] font-mono">
                {data.pendingReviewsCount}
              </div>
              <div className="text-[11px] text-slate-300">เอกสารรอตรวจทาน</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {data.evidenceGapCount}
              </div>
              <div className="text-[11px] text-slate-300">Evidence Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Open Risk & Open Decision */}
      <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            RAID & Decisions
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#062b63] text-blue-300 flex items-center justify-center border border-[#1356a3]/40">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {data.openRisksCount}
              </div>
              <div className="text-[11px] text-slate-300">ความเสี่ยงเปิดอยู่</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#168a91] font-mono">
                {data.openDecisionsCount}
              </div>
              <div className="text-[11px] text-slate-300">มติที่รอตัดสินใจ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
