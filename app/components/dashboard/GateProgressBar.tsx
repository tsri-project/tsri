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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#F36C21] flex items-center gap-1.5 font-mono">
            <span>●</span> PROJECT LIFECYCLE & QUALITY GATES
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
            สถานะ Gate ปัจจุบัน:{' '}
            <span className="text-[#F36C21] font-mono px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-lg">
              {currentGate}
            </span>{' '}
            — <span className="text-[#062B63]">{GATE_DETAILS[currentGate].name}</span>
          </h2>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto font-medium shadow-xs">
          {GATE_DETAILS[currentGate].description}
        </div>
      </div>

      {/* Responsive Horizontal Stepper in Light Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {GATES.map((gate, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const info = GATE_DETAILS[gate];

          return (
            <div
              key={gate}
              className={cn(
                'relative p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[96px]',
                isCurrent
                  ? 'bg-gradient-to-b from-orange-50/60 to-white border-2 border-[#F36C21] shadow-md ring-4 ring-orange-50'
                  : isPassed
                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                  : 'bg-slate-50/60 border-slate-200 text-slate-400'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-bold font-mono px-2 py-0.5 rounded-md',
                    isCurrent
                      ? 'bg-[#F36C21] text-white shadow-xs'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {gate}
                </span>

                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isCurrent && <Clock className="w-4 h-4 text-[#F36C21] animate-pulse" />}
                {isFuture && <Circle className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              <div>
                <div
                  className={cn(
                    'text-xs font-bold line-clamp-1',
                    isCurrent ? 'text-slate-900 font-extrabold' : isPassed ? 'text-emerald-950 font-semibold' : 'text-slate-500'
                  )}
                >
                  {info.name}
                </div>
                <div
                  className={cn(
                    'text-[10px] line-clamp-1 mt-0.5',
                    isCurrent ? 'text-orange-950 font-medium' : isPassed ? 'text-emerald-800' : 'text-slate-400'
                  )}
                >
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
