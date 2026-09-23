import { AppLayout } from '~/components/shell/AppLayout';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Plus, HelpCircle } from 'lucide-react';

export default function RaidRoute() {
  const raidItems = [
    {
      id: 'RAID-01',
      type: 'RISK',
      title: 'ความล่าช้าในการส่งคืนเงินเหลือจ่ายข้ามปีของมหาวิทยาลัย/หน่วยรับงบประมาณ',
      impact: 'HIGH',
      status: 'OPEN',
      owner: 'นายกานต์กุญช์ บำรุงชาติ',
      mitigation: 'ยกร่างข้อเสนอแก้ไขระเบียบ กสว. และหารือร่วมกับกรมบัญชีกลางในรายงาน Gap Analysis (DEL-02)',
    },
    {
      id: 'RAID-02',
      type: 'ISSUE',
      title: 'ความคลุมเครือของอำนาจ กสว. ในการร่วมลงทุนตามมาตรา 58',
      impact: 'HIGH',
      status: 'RESOLVED',
      owner: 'ผศ.ดร.มารุต ตั้งวัฒนาชุลีพร',
      mitigation: 'ตรวจสอบเทียบตัวบท พ.ร.บ. ววน. และยืนยันใน Expert Review Record REV-B1-001 เรียบร้อย',
    },
    {
      id: 'RAID-03',
      type: 'DECISION',
      title: 'การอนุมัติกรอบ Expert Review Package Batch 1 (WORK-WS05-001A v0.1)',
      impact: 'MEDIUM',
      status: 'RESOLVED',
      owner: 'คุณไกรพุฒิ อินทรโยธา & นายอนุสรณ์ หนองนา',
      mitigation: 'ผ่านความเห็นชอบและส่งมอบให้คณะที่ปรึกษาตรวจทานช่วง 18-25 ก.ย. 69',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
              MODULE 10: RAID LOG (RISKS, ASSUMPTIONS, ISSUES, DECISIONS)
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ทะเบียนบริหารความเสี่ยงและข้อตัดสินใจ
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            ทะเบียนบริหารความเสี่ยงและข้อติดขัด (RAID Log)
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            ติดตามประเด็นความเสี่ยงทางกฎหมาย (Legal Risks), ข้อติดขัดเชิงปฏิบัติการ (Operational Friction), และมติการตัดสินใจเพื่อปลดล็อก Gate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {raidItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md ${
                      item.type === 'RISK'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : item.type === 'ISSUE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {item.id} • {item.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}
                  >
                    {item.status === 'RESOLVED' ? 'คลี่คลายแล้ว' : 'เปิดอยู่ (Open)'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {item.title}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 leading-relaxed">
                  <span className="font-bold text-slate-800">แนวทางจัดการ: </span>
                  {item.mitigation}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>ผู้รับผิดชอบ: <span className="font-semibold text-slate-800">{item.owner}</span></span>
                <span className="font-bold text-rose-700">ผลกระทบ: {item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
