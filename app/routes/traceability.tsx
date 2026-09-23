import { AppLayout } from '~/components/shell/AppLayout';
import { GitFork, ArrowRight, ShieldCheck, CheckCircle2, Layers, Search, Sparkles } from 'lucide-react';
import { Link } from '@remix-run/react';

export default function TraceabilityRoute() {
  const nodes = [
    { step: 1, title: 'Document', desc: 'เอกสาร/พ.ร.บ./ระเบียบ 46 ฉบับ', status: 'DONE' },
    { step: 2, title: 'Provision', desc: 'บทบัญญัติ/มาตรา/ข้อ (ม.58, ม.19/1)', status: 'DONE' },
    { step: 3, title: 'Requirement', desc: 'ข้อกำหนดทางกฎหมายและระเบียบ', status: 'DONE' },
    { step: 4, title: 'Mandate', desc: 'อำนาจหน้าที่ กสว. & สกสว.', status: 'DONE' },
    { step: 5, title: 'Function', desc: 'ภารกิจสนับสนุนและบริหารกองทุน', status: 'DONE' },
    { step: 6, title: 'Work', desc: 'Work Packages (WS01 - WS05)', status: 'IN_REVIEW' },
    { step: 7, title: 'Process', desc: 'กระบวนการเบิกจ่ายและบริหารทุน', status: 'IN_REVIEW' },
    { step: 8, title: 'Role', desc: 'คณะที่ปรึกษา & ผู้ปฏิบัติงาน', status: 'IN_REVIEW' },
    { step: 9, title: 'Evidence', desc: 'Evidence Audit Trail & R2 Records', status: 'IN_REVIEW' },
    { step: 10, title: 'Actual Practice', desc: 'แนวปฏิบัติจริงในมหาวิทยาลัย/PMU', status: 'PLANNED' },
    { step: 11, title: 'Gap', desc: 'ช่องว่างทางกฎหมายและ Friction', status: 'PLANNED' },
    { step: 12, title: 'Learning', desc: 'ชุดองค์ความรู้ 15 คลิป & KM', status: 'PLANNED' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
              MODULE 6: LEGAL TRACEABILITY EXPLORER
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ระบบตรวจสอบสายธารความเชื่อมโยง 12 Nodes
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            เครื่องมือสืบค้นความเชื่อมโยงทางกฎหมายและการปฏิบัติ (Traceability Explorer)
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            สำรวจสายธารความเชื่อมโยงตั้งแต่ตัวบทกฎหมายต้นทาง ➔ ข้อกำหนดอำนาจหน้าที่ ➔ งานวิจัยตาม TOR ➔ หลักฐานการตรวจรับรอง (Evidence Audit Trail) ➔ ช่องว่าง (Gap) ➔ สถาปัตยกรรมความรู้ KM
          </p>
        </div>

        {/* Traceability Chain Diagram Visual */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สถาปัตยกรรมสายธารความเชื่อมโยง (Legal Traceability Chain Architecture - 12 Nodes)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เชื่อมโยงผลการจัดระบบข้อ 4.3.1 เข้าสู่การตรวจสอบโดยผู้เชี่ยวชาญ Batch 1
              </p>
            </div>
            <Link
              to="/reviews"
              className="text-xs font-bold text-[#062B63] hover:text-[#1356A3] flex items-center gap-1"
            >
              ไปที่ Expert Review Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {nodes.map((node) => (
              <div
                key={node.step}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-[#062B63]/40 hover:bg-blue-50/20 transition group"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-mono font-bold text-[#062B63] bg-white px-2 py-0.5 rounded border border-slate-200">
                    Node #{node.step}
                  </span>
                  {node.status === 'DONE' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : node.status === 'IN_REVIEW' ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <div className="my-2.5">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#062B63]">
                    {node.title}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">{node.desc}</div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-500">
                  {node.status === 'DONE' ? (
                    <span className="text-emerald-700">รับรองแล้ว (100%)</span>
                  ) : node.status === 'IN_REVIEW' ? (
                    <span className="text-amber-700">กำลังตรวจทาน</span>
                  ) : (
                    <span>ตามแผนงาน</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
