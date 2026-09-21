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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Project Lifecycle & Gate Milestones
          </div>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            สถานะ Gate ปัจจุบัน: <span className="text-blue-400">{currentGate} — {GATE_DETAILS[currentGate].name}</span>
          </h2>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start sm:self-auto">
          {GATE_DETAILS[currentGate].description}
        </div>
      </div>

      {/* Responsive Horizontal Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
        {GATES.map((gate, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const info = GATE_DETAILS[gate];

          return (
            <div
              key={gate}
              className={cn(
                'relative p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[90px]',
                isCurrent
                  ? 'bg-gradient-to-b from-blue-900/40 to-indigo-900/40 border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                  : isPassed
                  ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-xs font-bold font-mono px-1.5 py-0.5 rounded',
                    isCurrent
                      ? 'bg-blue-500 text-white'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {gate}
                </span>

                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isCurrent && <Clock className="w-4 h-4 text-blue-400 animate-pulse" />}
                {isFuture && <Circle className="w-3.5 h-3.5 text-slate-600" />}
              </div>

              <div>
                <div
                  className={cn(
                    'text-xs font-semibold line-clamp-1',
                    isCurrent ? 'text-white' : isPassed ? 'text-slate-200' : 'text-slate-400'
                  )}
                >
                  {info.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
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
