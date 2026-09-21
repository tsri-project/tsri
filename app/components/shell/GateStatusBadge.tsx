import { ProjectGate, GATE_DETAILS } from '~/types';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface GateStatusBadgeProps {
  currentGate: ProjectGate;
  showDetails?: boolean;
}

export function GateStatusBadge({ currentGate, showDetails = false }: GateStatusBadgeProps) {
  const gateInfo = GATE_DETAILS[currentGate];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/40 rounded-full text-blue-300 text-xs font-semibold tracking-wide shadow-sm backdrop-blur">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span className="font-bold text-white tracking-wider">{currentGate}</span>
        <span className="hidden sm:inline text-blue-300/80">|</span>
        <span className="hidden sm:inline text-slate-300 font-normal">{gateInfo.name}</span>
      </div>
      {showDetails && (
        <span className="text-xs text-slate-400 hidden lg:inline">
          {gateInfo.titleTh}
        </span>
      )}
    </div>
  );
}
