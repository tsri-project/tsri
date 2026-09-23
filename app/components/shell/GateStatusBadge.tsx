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
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#062B63] to-[#1356A3] border border-[#F36C21]/60 rounded-full text-white text-xs font-semibold tracking-wide shadow-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-[#F36C21]" />
        <span className="font-extrabold text-white tracking-wider font-mono">{currentGate}</span>
        <span className="hidden sm:inline text-blue-200">|</span>
        <span className="hidden sm:inline text-white font-medium">{gateInfo.name}</span>
      </div>
      {showDetails && (
        <span className="text-xs text-slate-500 font-medium hidden lg:inline">
          {gateInfo.titleTh}
        </span>
      )}
    </div>
  );
}
