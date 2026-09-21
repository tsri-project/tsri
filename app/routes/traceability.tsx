import { AppLayout } from '~/components/shell/AppLayout';
import { GitFork, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TraceabilityRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-blue-400 font-mono">
            MODULE 6: LEGAL TRACEABILITY EXPLORER
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            เครื่องมือสืบค้นความเชื่อมโยงทางกฎหมายและการปฏิบัติ (Traceability Explorer)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            สำรวจสายธารความเชื่อมโยงตั้งแต่ตัวบทกฎหมาย ➔ อำนาจหน้าที่ ➔ งานวิจัย ➔ แนวปฏิบัติจริง ➔ ช่องว่าง (Gap) ➔ องค์ความรู้
          </p>
        </div>

        {/* Traceability Chain Diagram Visual */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-sm font-bold text-white mb-4">
            Legal Traceability Chain Architecture (12 Nodes Flow)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { step: 1, title: 'Document', desc: 'เอกสาร/พ.ร.บ./ระเบียบ' },
              { step: 2, title: 'Provision', desc: 'บทบัญญัติ/มาตรา/ข้อ' },
              { step: 3, title: 'Requirement', desc: 'ข้อกำหนดทางกฎหมาย' },
              { step: 4, title: 'Mandate', desc: 'อำนาจหน้าที่ตามกฎหมาย' },
              { step: 5, title: 'Function', desc: 'ภารกิจของ สกสว.' },
              { step: 6, title: 'Work', desc: 'งานวิจัย/งานโครงการ' },
              { step: 7, title: 'Process', desc: 'กระบวนการทำงาน' },
              { step: 8, title: 'Role', desc: 'บทบาทผู้รับผิดชอบ' },
              { step: 9, title: 'Evidence', desc: 'หลักฐานยืนยัน' },
              { step: 10, title: 'Actual Practice', desc: 'แนวปฏิบัติจริง' },
              { step: 11, title: 'Gap', desc: 'ช่องว่าง/ปัญหา' },
              { step: 12, title: 'Learning', desc: 'องค์ความรู้/ข้อเสนอแนะ' },
            ].map((node) => (
              <div
                key={node.step}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-blue-500/50 transition group"
              >
                <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-400">
                  <span className="text-[10px] font-mono font-bold">Node #{node.step}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="my-2">
                  <div className="text-xs font-bold text-white group-hover:text-blue-300">
                    {node.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{node.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
