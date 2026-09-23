import { AppLayout } from '~/components/shell/AppLayout';
import { Scale, BookOpen, CheckCircle2, ShieldAlert, FileBarChart, Users, ChevronRight, FolderOpen } from 'lucide-react';
import { Link } from '@remix-run/react';
import { mockDocuments } from '~/lib/mock-data';

export const clientLoader = async () => {
  return { documents: mockDocuments };
};

export default function LegalInventoryRoute() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63]/10 text-[#062B63] border border-[#062B63]/20 rounded-md">
                MODULE 5: LEGAL INVENTORY & REPOSITORY
              </span>
              <span className="text-xs font-semibold text-slate-500">
                คลังสารสนเทศกฎหมายและระเบียบ สกสว.
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              คลังสารสนเทศกฎหมายและระเบียบ สกสว. (Legal Inventory)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              รวบรวม จำแนกหมวดหมู่ 13 หมวด และวิเคราะห์เนื้อหาบทบัญญัติกฎหมาย พระราชบัญญัติ ระเบียบ ข้อบังคับ 46 รายการ บน Cloudflare R2 Vault
            </p>
          </div>

          <Link
            to="/documents"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-sm transition self-start sm:self-auto"
          >
            <FolderOpen className="w-4 h-4 text-orange-400" />
            เปิด Document Center เต็มรูปแบบ
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-50 rounded-xl text-[#062B63]">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">01. กฎหมายแม่บท</h3>
                <p className="text-xs text-slate-500">พ.ร.บ. สภานโยบายฯ & พ.ร.บ. ววน.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              ครอบคลุม พ.ร.บ. สภานโยบายฯ 2562 และฉบับที่ 2 ปี 2568, พ.ร.บ. ส่งเสริม ววน. 2562 และฉบับที่ 2
            </p>
            <Link to="/documents" className="text-xs font-bold text-[#062B63] hover:underline flex items-center gap-1">
              ดูเอกสารหมวดนี้ <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">02. กฎหมายลำดับรอง</h3>
                <p className="text-xs text-slate-500">ระเบียบสภานโยบาย, ระเบียบ/ประกาศ กสว.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              ระเบียบ กสว. 7 ฉบับ และประกาศ กสว. 11 ฉบับ (การใช้จ่ายเงินอุดหนุน PMU, มาตรการ TBIR, การนำเงินไปหาผลประโยชน์)
            </p>
            <Link to="/documents" className="text-xs font-bold text-[#062B63] hover:underline flex items-center gap-1">
              ดูเอกสารหมวดนี้ <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">00. บริหารโครงการ & TOR</h3>
                <p className="text-xs text-slate-500">สัญญา, MOM, คำสั่งแต่งตั้ง บค.7/2569</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              เอกสาร TOR-PROJ-001, รายงานการประชุม MOM Kickoff, คำสั่งแต่งตั้ง และ Master Control Files
            </p>
            <Link to="/documents" className="text-xs font-bold text-[#062B63] hover:underline flex items-center gap-1">
              ดูเอกสารหมวดนี้ <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
