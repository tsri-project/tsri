import { ProjectGate, GATE_DETAILS } from '~/types';
import { ShieldCheck } from 'lucide-react';

interface GateStatusBadgeProps {
  currentGate: ProjectGate;
  showDetails?: boolean;
}

export function GateStatusBadge({ currentGate, showDetails = false }: GateStatusBadgeProps) {
  const gateInfo = GATE_DETAILS[currentGate];

  return (
    <div className="flex items-center gap-2 font-sans">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#062b63] to-[#1356a3] border border-[#f36c21]/60 rounded-full text-blue-200 text-xs font-semibold tracking-wide shadow-md backdrop-blur">
        <ShieldCheck className="w-3.5 h-3.5 text-[#f36c21]" />
        <span className="font-bold text-white tracking-wider font-mono">{currentGate}</span>
        <span className="hidden sm:inline text-blue-300/80">|</span>
        <span className="hidden sm:inline text-slate-200 font-medium">{gateInfo.name}</span>
      </div>
      {showDetails && (
        <span className="text-xs text-slate-300 hidden lg:inline">
          {gateInfo.titleTh}
        </span>
      )}
    </div>
  );
}
