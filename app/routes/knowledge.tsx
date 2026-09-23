import { AppLayout } from '~/components/shell/AppLayout';
import { Sparkles, Video, FileText, CheckCircle2, BookOpen, Layers, Award } from 'lucide-react';
import { Link } from '@remix-run/react';

export default function KnowledgeRoute() {
  const kmAssets = [
    {
      title: 'วิดีโอองค์ความรู้กฎหมายและนโยบาย ววน. (15 คลิป)',
      desc: 'วิดีโอระดับผู้บริหาร 6 คลิป (ความยาว 3–5 นาที) และวิดีโอสั้นสำหรับผู้ปฏิบัติการ 9 คลิป (30–60 วินาที)',
      lead: 'คุณแอ๋ม & คุณซัน',
      status: 'DRAFTING',
      progress: 25,
    },
    {
      title: 'อินโฟกราฟิกสรุปสาระสำคัญกฎหมาย (8 ชิ้น)',
      desc: 'สรุปอำนาจหน้าที่ กสว., โครงสร้างกองทุน ววน., ขั้นตอนการจัดซื้อพัสดุวิจัย และกลไก Joint Venture',
      lead: 'คุณสายป่าน & ทีมกราฟิก',
      status: 'PLANNED',
      progress: 10,
    },
    {
      title: 'แบบทดสอบประยุกต์ใช้ตามสถานการณ์จริง (12 ชุด)',
      desc: 'Scenario-based Assessment เพื่อทดสอบ Legal Competency ของบุคลากร สกสว. และผู้เกี่ยวข้อง',
      lead: 'คุณซัน & ดร.หนึ่งนิดา',
      status: 'PLANNED',
      progress: 15,
    },
    {
      title: 'สถาปัตยกรรม Legal Knowledge Matrix & KM Platform',
      desc: 'ระบบโครงสร้างฐานความรู้ดิจิทัล เชื่อมโยงตัวบท มาตรา ข้อกำหนด และแนวปฏิบัติ',
      lead: 'นายอนุสรณ์ หนองนา (เด่น)',
      status: 'IN_REVIEW',
      progress: 40,
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
              MODULE 11: KNOWLEDGE MANAGEMENT & LEARNING ARCHITECTURE
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ระบบจัดการความรู้และสื่อการเรียนรู้ตาม TOR ข้อ 4.3.5
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            ระบบจัดการความรู้และสถาปัตยกรรมการเรียนรู้ (KM & Learning Architecture)
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            แปลงบทบัญญัติทางกฎหมายและระเบียบ ววน. สู่สื่อการเรียนรู้สมัยใหม่ (วิดีโอ 15 คลิป, อินโฟกราฟิก 8 ชิ้น, แบบทดสอบ 12 ชุด) และ KM Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kmAssets.map((asset, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#062B63] text-white rounded-md">
                    TOR 4.3.5 • WS05
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      asset.status === 'IN_REVIEW'
                        ? 'bg-amber-100 text-amber-800'
                        : asset.status === 'DRAFTING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {asset.status === 'IN_REVIEW'
                      ? 'อยู่ระหว่างตรวจทาน'
                      : asset.status === 'DRAFTING'
                      ? 'กำลังยกร่าง'
                      : 'ตามแผน'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {asset.title}
                </h3>
                <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {asset.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>ผู้รับผิดชอบ: <span className="font-semibold text-slate-800">{asset.lead}</span></span>
                  <span className="font-mono font-bold text-slate-800">{asset.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#062B63] rounded-full"
                    style={{ width: `${asset.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
