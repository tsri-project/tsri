import { useState } from 'react';
import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { mockDeliverables } from '~/lib/mock-data';
import { Deliverable, WORK_STATUS_BADGES, GATE_DETAILS } from '~/types';
import {
  FileCheck2,
  Calendar,
  ShieldCheck,
  Plus,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const loader: LoaderFunction = async () => {
  return json<{ deliverables: Deliverable[] }>({ deliverables: mockDeliverables });
};

export default function TorRoute() {
  const { deliverables } = useLoaderData<{ deliverables: Deliverable[] }>();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-xs font-semibold text-emerald-400 font-mono">
              MODULE 2: TOR & DELIVERABLES MANAGEMENT
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              ข้อกำหนด TOR และรายการส่งมอบผลผลิต (Deliverables)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              ติดตามความก้าวหน้าผลผลิตตามสัญญา น้ำหนักคะแนน และการเชื่อมโยง Gate Milestones
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">น้ำหนักรวม:</div>
            <div className="text-sm font-bold font-mono text-emerald-400">100%</div>
          </div>
        </div>

        {/* Deliverables Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliverables.map((del) => {
            const statusInfo = WORK_STATUS_BADGES[del.status];
            const gateInfo = GATE_DETAILS[del.gate_milestone];

            return (
              <div
                key={del.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      {del.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        น้ำหนัก {del.weight_percentage}%
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusInfo.class}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {del.title}
                  </h3>

                  {del.description && (
                    <p className="text-xs text-slate-400 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      {del.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      กำหนดส่งมอบ: {formatThaiDate(del.due_date)}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-blue-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      {del.gate_milestone}: {gateInfo.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
