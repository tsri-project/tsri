import { ProjectGate, GATE_DETAILS } from '~/types';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface GateProgressBarProps {
  currentGate: ProjectGate;
}

const GATES: ProjectGate[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'];

export function GateProgressBar({ currentGate }: GateProgressBarProps) {
  const currentIndex = GATES.indexOf(currentGate);

  return (
    <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl p-4 md:p-6 shadow-2xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1356a3]/30">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#f36c21] flex items-center gap-1.5 font-mono">
            <span>●</span> PROJECT LIFECYCLE & QUALITY GATES
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
            สถานะ Gate ปัจจุบัน: <span className="text-[#f36c21] font-mono">{currentGate}</span> — <span className="text-blue-200">{GATE_DETAILS[currentGate].name}</span>
          </h2>
        </div>
        <div className="text-xs text-blue-100 bg-[#1356a3]/40 px-3 py-1.5 rounded-xl border border-[#1356a3]/50 self-start sm:self-auto font-medium shadow-inner">
          {GATE_DETAILS[currentGate].description}
        </div>
      </div>

      {/* Responsive Horizontal Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
        {GATES.map((gate, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const info = GATE_DETAILS[gate];

          return (
            <div
              key={gate}
              className={cn(
                'relative p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[95px]',
                isCurrent
                  ? 'bg-gradient-to-b from-[#1356a3]/90 to-[#062b63] border-[#f36c21] ring-2 ring-[#f36c21]/40 shadow-xl shadow-[#f36c21]/15'
                  : isPassed
                  ? 'bg-[#168a91]/20 border-[#168a91]/50 text-slate-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-bold font-mono px-2 py-0.5 rounded',
                    isCurrent
                      ? 'bg-[#f36c21] text-white shadow'
                      : isPassed
                      ? 'bg-[#168a91] text-white'
                      : 'bg-slate-900 text-slate-400'
                  )}
                >
                  {gate}
                </span>

                {isPassed && <CheckCircle2 className="w-4 h-4 text-[#20B2AA]" />}
                {isCurrent && <Clock className="w-4 h-4 text-[#f36c21] animate-pulse" />}
                {isFuture && <Circle className="w-3.5 h-3.5 text-slate-600" />}
              </div>

              <div>
                <div
                  className={cn(
                    'text-xs font-bold line-clamp-1',
                    isCurrent ? 'text-white' : isPassed ? 'text-blue-100' : 'text-slate-400'
                  )}
                >
                  {info.name}
                </div>
                <div className="text-[10px] text-blue-300/80 line-clamp-1 mt-0.5">
                  {info.titleTh.split(':')[1] || info.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
