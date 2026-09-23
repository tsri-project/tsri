import { useState } from 'react';
import {
  DocumentItem,
  DocumentVersionItem,
  DOCUMENT_STATUS_BADGES,
  DOCUMENT_PREFIX_LABELS,
} from '~/types';
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  History,
  Download,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { formatThaiDateTime, formatFileSize } from '~/lib/utils';

interface DocumentVersionModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onUploadNewVersion: (docId: string, versionData: Partial<DocumentVersionItem>) => void;
}

export function DocumentVersionModal({
  document,
  onClose,
  onUploadNewVersion,
}: DocumentVersionModalProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [versionNumber, setVersionNumber] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [fileName, setFileName] = useState('');

  if (!document) return null;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNumber || !fileName) return;

    onUploadNewVersion(document.id, {
      version_number: versionNumber,
      file_name: fileName,
      file_size_bytes: 2500000,
      file_mime_type: 'application/pdf',
      change_summary: changeSummary,
      status: 'UNDER_REVIEW',
    });

    setShowUploadForm(false);
    setVersionNumber('');
    setChangeSummary('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white text-[#062B63] rounded-md shadow-xs">
                {document.document_code}
              </span>
              <span className="text-xs text-blue-100">
                {DOCUMENT_PREFIX_LABELS[document.prefix_code]}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white leading-snug">
              {document.title}
            </h2>
            <div className="text-xs text-blue-100 mt-1">
              หมวดหมู่: {document.category} • หน่วยงานผู้ออก: {document.issuing_body || 'สกสว.'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body in Light Theme */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#1356A3]" />
              ประวัติและสถานะเวอร์ชัน (Version History)
            </h3>
            {!showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Upload className="w-3.5 h-3.5" />
                อัปโหลดเวอร์ชันใหม่ (New Version)
              </button>
            )}
          </div>

          {/* Upload Form Box */}
          {showUploadForm && (
            <form
              onSubmit={handleUploadSubmit}
              className="p-5 bg-slate-50 border border-blue-200 rounded-2xl space-y-3 animate-fade-in"
            >
              <div className="text-xs font-bold text-[#062B63] uppercase tracking-wide">
                เพิ่มไฟล์เวอร์ชันใหม่ (ห้ามเขียนทับเวอร์ชันที่ Validated แล้ว)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เลขเวอร์ชัน (เช่น 1.2, 2.0) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.2"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อไฟล์เอกสาร (PDF/DOCX) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Document_v1.2.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สรุปรายละเอียดการแก้ไข (Change Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="ระบุจุดที่มีการแก้ไข หรือผลการตรวจทาน..."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  บันทึกเวอร์ชันใหม่
                </button>
              </div>
            </form>
          )}

          {/* Versions Timeline List */}
          <div className="space-y-3">
            {document.versions && document.versions.length > 0 ? (
              document.versions.map((ver) => {
                const statusInfo = DOCUMENT_STATUS_BADGES[ver.status];
                const isValidated = ver.status === 'VALIDATED';

                return (
                  <div
                    key={ver.id}
                    className={`p-4.5 rounded-2xl border transition ${
                      isValidated
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          v{ver.version_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.class}`}
                        >
                          ● {statusInfo.label}
                        </span>
                        {isValidated && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <Lock className="w-3 h-3" /> รับรองแล้ว (Locked)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {formatThaiDateTime(ver.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 mb-2">
                      <span className="font-bold text-slate-900">ชื่อไฟล์: </span>
                      <span className="font-mono">{ver.file_name}</span> ({formatFileSize(ver.file_size_bytes)})
                    </div>

                    {ver.change_summary && (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                        <span className="font-bold text-slate-900">รายละเอียดการเปลี่ยนแปลง: </span>
                        {ver.change_summary}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-mono text-[10px] truncate max-w-xs text-slate-400">
                        R2 Key: {ver.storage_r2_key}
                      </span>
                      {ver.storage_url ? (
                        <a
                          href={ver.storage_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#062B63] hover:bg-[#1356A3] text-white font-bold rounded-xl shadow-xs transition"
                        >
                          <Download className="w-3.5 h-3.5" /> เปิด/ดาวน์โหลด
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(`เปิดดาวน์โหลดไฟล์ ${ver.file_name}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                        >
                          <Download className="w-3.5 h-3.5" /> ดาวน์โหลดไฟล์
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                ยังไม่มีข้อมูลเวอร์ชันสำหรับเอกสารนี้
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
