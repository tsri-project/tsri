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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                {document.document_code}
              </span>
              <span className="text-xs text-slate-400">
                {DOCUMENT_PREFIX_LABELS[document.prefix_code]}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {document.title}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              หมวดหมู่: {document.category} • หน่วยงานผู้ออก: {document.issuing_body || 'สกสว.'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              ประวัติและสถานะเวอร์ชัน (Version History)
            </h3>
            {!showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
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
              className="p-4 bg-slate-950 border border-blue-500/30 rounded-xl space-y-3 animate-fade-in"
            >
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                เพิ่มไฟล์เวอร์ชันใหม่ (ห้ามเขียนทับเวอร์ชันที่ Validated แล้ว)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    เลขเวอร์ชัน (เช่น 1.2, 2.0) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.2"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    ชื่อไฟล์เอกสาร (PDF/DOCX) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Document_v1.2.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  สรุปรายละเอียดการแก้ไข (Change Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="ระบุจุดที่มีการแก้ไข หรือผลการตรวจทาน..."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
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
                    className={`p-4 rounded-xl border transition ${
                      isValidated
                        ? 'bg-slate-950/80 border-emerald-500/40'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                          v{ver.version_number}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                        {isValidated && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <Lock className="w-3 h-3" /> ล็อก (Validated)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatThaiDateTime(ver.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      <span className="font-semibold text-slate-400">ชื่อไฟล์: </span>
                      {ver.file_name} ({formatFileSize(ver.file_size_bytes)})
                    </div>

                    {ver.change_summary && (
                      <div className="text-xs text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-300">รายละเอียดการเปลี่ยนแปลง: </span>
                        {ver.change_summary}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/60">
                      <button className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition">
                        <Download className="w-3.5 h-3.5" /> ดาวน์โหลดไฟล์
                      </button>
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
