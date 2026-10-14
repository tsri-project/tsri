import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import {
  Calendar,
  Sparkles,
  FileCheck2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Users,
  Scale,
  Eye,
  X,
  CheckCircle2,
  Clock,
  Download,
  FolderOpen,
  Edit3,
  ListPlus,
} from 'lucide-react';
import { getStoredLiveFocus } from '~/lib/app-state';
import { LiveProjectFocus } from '~/types';

export function TodayActiveFocusBanner() {
  const [focusData, setFocusData] = useState<LiveProjectFocus>(getStoredLiveFocus());
  const [activeDocModal, setActiveDocModal] = useState<'INTERVIEW' | 'LEGAL_MAPPING' | null>(null);

  useEffect(() => {
    // Initial fetch on mount
    setFocusData(getStoredLiveFocus());

    // Listen for storage updates
    const handleStateChange = () => {
      setFocusData(getStoredLiveFocus());
    };

    window.addEventListener('tsri-state-change', handleStateChange);
    window.addEventListener('storage', handleStateChange);
    return () => {
      window.removeEventListener('tsri-state-change', handleStateChange);
      window.removeEventListener('storage', handleStateChange);
    };
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-[#062B63] via-[#0D418A] to-[#1356A3] rounded-3xl p-5 md:p-6 text-white shadow-md border border-blue-900/40 relative overflow-hidden font-sans">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 bg-black/20 px-3 py-0.5 rounded-full border border-orange-400/30">
              สถานะการดำเนินงานปัจจุบัน (Live Project Status)
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 font-bold">
              Gate: {focusData.current_gate}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>วันนี้: {focusData.as_of_date}</span>
            </div>

            <Link
              to="/daily"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-xl transition shadow-xs"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>บันทึกงานรายวัน</span>
            </Link>

            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition border border-white/15"
              title="เข้าสู่ระบบ Admin เพื่อปรับปรุงข้อมูล"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              <span>จัดการหลังบ้าน (Admin)</span>
            </Link>
          </div>
        </div>

        {/* Announcement Banner if present */}
        {focusData.announcement_text && (
          <div className="mt-3 py-2 px-3.5 bg-white/10 rounded-xl border border-white/15 text-xs text-blue-100 flex items-center gap-2">
            <span>{focusData.announcement_text}</span>
          </div>
        )}

        {/* Main Content Grid: 2 Focus Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 relative z-10">
          {/* Card 1: กำลังดำเนินการ — ตรวจทานประเด็นสัมภาษณ์ / Focus Group */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4.5 border border-white/15 flex flex-col justify-between transition group shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                  {focusData.card1_tag || '1. สิ่งที่กำลังดำเนินการอยู่'}
                </span>
                <span className="text-[10px] font-mono text-blue-200">
                  {focusData.card1_code || 'FORM-INT-001 (v0.1)'}
                </span>
              </div>

              <h3 className="text-sm md:text-base font-extrabold text-white mt-1 leading-snug group-hover:text-amber-200 transition">
                {focusData.card1_title}
              </h3>
              <p className="text-xs text-blue-100/90 mt-1.5 leading-relaxed">
                {focusData.card1_description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setActiveDocModal('INTERVIEW')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-[#062B63] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>เปิดดูแบบสัมภาษณ์ 10 ประเด็น</span>
              </button>

              {focusData.card1_drive_link && (
                <a
                  href={focusData.card1_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-200 hover:text-white font-medium flex items-center gap-1 transition bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/10"
                >
                  <ExternalLink className="w-3 h-3 text-amber-300" />
                  <span>Google Drive ประเด็นสัมภาษณ์</span>
                </a>
              )}
            </div>
          </div>

          {/* Card 2: ข้อมูลพร้อมดู — วิเคราะห์ขอบเขตอำนาจหน้าที่ กสว. และ สกสว. */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4.5 border border-white/15 flex flex-col justify-between transition group shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  {focusData.card2_tag || '2. ข้อมูลการศึกษาพร้อมเข้าดู'}
                </span>
                <span className="text-[10px] font-mono text-blue-200">
                  {focusData.card2_code || 'DOC-LEGAL-MAPPING-001'}
                </span>
              </div>

              <h3 className="text-sm md:text-base font-extrabold text-white mt-1 leading-snug group-hover:text-emerald-200 transition">
                {focusData.card2_title}
              </h3>
              <p className="text-xs text-blue-100/90 mt-1.5 leading-relaxed">
                {focusData.card2_description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setActiveDocModal('LEGAL_MAPPING')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#062B63] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>เข้าดูข้อมูลวิเคราะห์อำนาจหน้าที่</span>
              </button>

              {focusData.card2_drive_link && (
                <a
                  href={focusData.card2_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-200 hover:text-white font-medium flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3 h-3 text-orange-400" />
                  <span>Google Drive 4.3.1</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: ดูแบบสัมภาษณ์ 10 ประเด็น (FORM-INT-001) */}
      {activeDocModal === 'INTERVIEW' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  FORM-INT-001-2569 • TOR ข้อ 4.3.2
                </div>
                <h3 className="text-base font-extrabold mt-0.5">
                  แบบสัมภาษณ์กึ่งโครงสร้าง (Semi-Structured Interview) — 10 ประเด็นหลัก
                </h3>
              </div>
              <button
                onClick={() => setActiveDocModal(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs leading-relaxed">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-sm text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  คำชี้แจงและวัตถุประสงค์การเก็บข้อมูลภาคสนาม
                </div>
                <p>
                  ใช้เก็บรวบรวมข้อมูลเกี่ยวกับความเข้าใจ การตีความ และการนำกฎหมาย ระเบียบ ประกาศ หลักเกณฑ์ และมติไปใช้ในการปฏิบัติงานจริง เพื่อนำไปจัดทำ <strong>Legal-to-Work Alignment Matrix</strong> และ <strong>Gap & Risk Analysis</strong>
                </p>
              </div>

              {/* 10 Key Topics Accordion / List */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <span>10 ประเด็นคำถามหลักในการสัมภาษณ์</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-[#062B63] rounded-md font-bold">
                    Draft v0.1
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 1: ความเข้าใจเกี่ยวกับอำนาจหน้าที่ตามกฎหมาย</div>
                    <p className="text-slate-600 text-[11px] mt-1">ความเข้าใจอำนาจหน้าที่ตามกฎหมาย, มาตราที่ใช้อ้างอิงเป็นประจำ, และการตรวจสอบความถูกต้อง</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 2: วิธีการนำข้อกำหนดไปใช้ในการปฏิบัติงาน</div>
                    <p className="text-slate-600 text-[11px] mt-1">ขั้นตอนการตรวจสอบข้อกำหนดทางกฎหมาย, การใช้คู่มือปฏิบัติงาน และแนวทางเมื่อกฎหมายเปลี่ยน</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 3: ขั้นตอนและกระบวนการทำงานจริง</div>
                    <p className="text-slate-600 text-[11px] mt-1">ขั้นตอนการทำงานตั้งแต่เริ่มต้นจนสิ้นสุด, จุดที่มีการตัดสินใจ และระยะเวลาดำเนินการจริง</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 4: เอกสารและหลักฐานในการปฏิบัติงาน</div>
                    <p className="text-slate-600 text-[11px] mt-1">รายการเอกสารที่ต้องใช้/สร้าง, การจัดเก็บ และระบบสารสนเทศในการติดตามงาน</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 5: ปัญหา อุปสรรค และข้อจำกัด</div>
                    <p className="text-slate-600 text-[11px] mt-1">ข้อกำหนดที่มีความคลุมเครือ ล่าช้า ซ้ำซ้อน หรือไม่สอดคล้องกับสภาพการทำงานปัจจุบัน</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 6: ความสอดคล้องระหว่างกฎหมายและการปฏิบัติงานจริง (Gap)</div>
                    <p className="text-slate-600 text-[11px] mt-1">จุดที่การปฏิบัติงานจริงไม่ตรงกับข้อกำหนด และแนวทางที่หน่วยงานใช้แก้ปัญหา</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 7: ความเสี่ยงและความรับผิด</div>
                    <p className="text-slate-600 text-[11px] mt-1">ความเสี่ยงทางกฎหมาย วินัย หรือการเงิน และจุดเสี่ยงที่มีโอกาสเกิดข้อผิดพลาด</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 8: การประสานงานและการส่งต่องาน</div>
                    <p className="text-slate-600 text-[11px] mt-1">การประสานงานภายใน สกสว. และภายนอก (PMU / มหาวิทยาลัย / กสว. / สภานโยบาย)</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 9: การพัฒนาความรู้และคู่มือการปฏิบัติงาน</div>
                    <p className="text-slate-600 text-[11px] mt-1">ความต้องการด้านการอบรม สื่อการเรียนรู้ และรูปแบบคู่มือ SOP ที่ต้องการ</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900 text-xs">ประเด็นที่ 10: ข้อเสนอแนะเพื่อการปรับปรุงและพัฒนา</div>
                    <p className="text-slate-600 text-[11px] mt-1">ข้อเสนอแนะในการแก้ไขกฎหมาย ระเบียบ ปรับปรุง Flow งาน และการนำเทคโนโลยีมาใช้</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href="https://drive.google.com/drive/folders/1Y4uCfXDbjjm3fe63wmDSi29neiYbOwaF?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>เปิด Google Drive ประเด็นสัมภาษณ์</span>
                </a>

                <a
                  href="/documents/05_การเก็บข้อมูลภาคสนาม/05.02_Interview/FORM-INT-001_แบบสัมภาษณ์กึ่งโครงสร้าง_Semi-Structured-Interview_v0.1.md"
                  download
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Markdown</span>
                </a>
              </div>

              <button
                onClick={() => setActiveDocModal(null)}
                className="px-5 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: ดูข้อมูลผลการศึกษาและวิเคราะห์ขอบเขตอำนาจหน้าที่ กสว. และ สกสว. (DOC-LEGAL-MAPPING-001) */}
      {activeDocModal === 'LEGAL_MAPPING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  DOC-LEGAL-MAPPING-001 • TOR ข้อ 4.3.1
                </div>
                <h3 className="text-base font-extrabold mt-0.5">
                  รายงานผลการศึกษาและวิเคราะห์ความเกี่ยวพันของ พ.ร.บ. กับภารกิจหน้าที่ของ สกสว.
                </h3>
              </div>
              <button
                onClick={() => setActiveDocModal(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-sm text-[#062B63]">
                  <Scale className="w-4 h-4 text-[#F36C21]" />
                  บทสรุปผู้บริหาร: บูรณาการ 20 ฉบับ 195 Legal Requirements สู่ 5 ภารกิจหลัก
                </div>
                <p>
                  ศึกษาและวิเคราะห์ความเกี่ยวพันระหว่าง <strong>พ.ร.บ. สภานโยบายฯ 2562 (และฉบับ 2 ปี 2568)</strong> และ <strong>พ.ร.บ. ส่งเสริม ววน. 2562 (และฉบับ 2 ปี 2568)</strong> ร่วมกับกฎหมายลำดับรองและระเบียบ กสว. เพื่อรองรับการกำกับดูแลภารกิจ 5 ด้านของ สกสว.
                </p>
              </div>

              {/* 5 Mandates */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2">
                  สรุปความเกี่ยวพัน 5 ภารกิจหลัก สกสว. กับบทบัญญัติใน พ.ร.บ.
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Mandate 1 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-[#062B63] text-xs">
                      ภารกิจที่ 1: การจัดทำนโยบาย ยุทธศาสตร์ แผน ววน. และกรอบวงเงินงบประมาณ
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>ฐานอำนาจใน พ.ร.บ.:</strong> สภานโยบายฯ ม.11(1)-(2), ม.12(1)-(2), ม.41(1)-(2), ม.47 | ส่งเสริม ววน. ม.6, ม.7
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      จัดทำร่างนโยบาย ยุทธศาสตร์ แผนด้าน ววน. เสนอต่อ กสว., สภานโยบายฯ และ ครม. พร้อมกรอบวงเงิน Multi-year Block Grant
                    </p>
                  </div>

                  {/* Mandate 2 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-[#062B63] text-xs">
                      ภารกิจที่ 2: การจัดสรรและบริหารงบประมาณกองทุนส่งเสริม ววน. (FF / SF)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>ฐานอำนาจใน พ.ร.บ.:</strong> สภานโยบายฯ ม.41(4), ม.57(1)-(2), ม.58 | ส่งเสริม ววน. ม.16, ม.17, ม.18
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      บริหารจัดการระบบการจัดสรรเงินอุดหนุน Fundamental Fund (FF) และ Strategic Fund (SF) ตามประกาศ กสว.
                    </p>
                  </div>

                  {/* Mandate 3 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-[#062B63] text-xs">
                      ภารกิจที่ 3: การกำกับ ติดตาม ตรวจสอบ และประเมินผลสัมฤทธิ์ของระบบ ววน.
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>ฐานอำนาจใน พ.ร.บ.:</strong> สภานโยบายฯ ม.41(8)-(10), ม.48, ม.60-61 | ส่งเสริม ววน. ม.7 วรรคสาม, ม.20, ม.24
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      ติดตามการใช้จ่ายเงินกองทุนของหน่วยรับงบประมาณ รายงานผลสัมฤทธิ์เสนอ กสว., สภานโยบายฯ, ครม. และรัฐสภา
                    </p>
                  </div>

                  {/* Mandate 4 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-[#062B63] text-xs">
                      ภารกิจที่ 4: การส่งเสริม ประสานงาน และเชื่อมโยงระบบวิจัยกับ PMU 8 แห่ง
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>ฐานอำนาจใน พ.ร.บ.:</strong> สภานโยบายฯ ม.41(3), (7), (11), ม.44 | ส่งเสริม ววน. ม.19/1, ม.28, ม.30, ม.32-34
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      กำกับดูแลการใช้จ่ายเงินอุดหนุนของ PMU, ส่งเสริมความร่วมมือ และมาตรการสนับสนุนทุนภาคเอกชน (TBIR / TRIUP Act)
                    </p>
                  </div>

                  {/* Mandate 5 */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 md:col-span-2">
                    <div className="font-bold text-[#062B63] text-xs">
                      ภารกิจที่ 5: การบริหารจัดการกองทุนส่งเสริม ววน. และระบบการเงิน บัญชี การลงทุน
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>ฐานอำนาจใน พ.ร.บ.:</strong> สภานโยบายฯ ม.41(6), ม.53-56, ม.59-62 | ส่งเสริม ววน. ม.10, ม.25-27
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      การบริหารสินทรัพย์ สภาพคล่อง การบัญชี และการนำเงินกองทุนไปหาผลประโยชน์ตามระเบียบสภานโยบายฯ และระเบียบ กสว.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href="https://drive.google.com/drive/folders/1hfMPYkzRQlfuFq9ARDwS0_kFfMNk76Cq?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#062B63] text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#1356A3]" />
                  <span>เปิด Google Drive 4.3.1</span>
                </a>

                <a
                  href="/documents/06_งานวิเคราะห์และสังเคราะห์/06.02_Legal-Mapping/DOC-LEGAL-MAPPING-001_ผลการวิเคราะห์ความสัมพันธ์พรบกับภารกิจสกสว.md"
                  download
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Markdown</span>
                </a>
              </div>

              <button
                onClick={() => setActiveDocModal(null)}
                className="px-5 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
