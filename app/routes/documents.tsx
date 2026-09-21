import { useState, useMemo } from 'react';
import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { DocumentVersionModal } from '~/components/documents/DocumentVersionModal';
import { mockDocuments } from '~/lib/mock-data';
import {
  DocumentItem,
  DocumentPrefix,
  DocumentStatus,
  DOCUMENT_PREFIX_LABELS,
  DOCUMENT_STATUS_BADGES,
  DocumentVersionItem,
} from '~/types';
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  FileText,
  History,
  Tag,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const loader: LoaderFunction = async () => {
  return json<{ documents: DocumentItem[] }>({ documents: mockDocuments });
};

const PREFIXES: DocumentPrefix[] = [
  'LAW',
  'REG',
  'ANN',
  'RULE',
  'RES',
  'ORD',
  'GUIDE',
  'FORM',
  'TOR',
  'MOM',
  'REP',
  'REV',
  'EVD',
  'DEL',
];

export default function DocumentsRoute() {
  const { documents: initialDocuments } = useLoaderData<{ documents: DocumentItem[] }>();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<DocumentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Doc Form States
  const [newCode, setNewCode] = useState('');
  const [newPrefix, setNewPrefix] = useState<DocumentPrefix>('LAW');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newIssuingBody, setNewIssuingBody] = useState('');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchQuery =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.document_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPrefix = selectedPrefix === 'ALL' || doc.prefix_code === selectedPrefix;
      const matchStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;

      return matchQuery && matchPrefix && matchStatus;
    });
  }, [documents, searchQuery, selectedPrefix, selectedStatus]);

  const handleUploadVersion = (docId: string, versionData: Partial<DocumentVersionItem>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const newVersion: DocumentVersionItem = {
            id: `ver-${Date.now()}`,
            document_id: docId,
            project_id: doc.project_id,
            version_number: versionData.version_number || '1.1',
            file_name: versionData.file_name || 'document.pdf',
            file_size_bytes: versionData.file_size_bytes || 1024000,
            file_mime_type: 'application/pdf',
            storage_r2_key: `uploads/${versionData.file_name}`,
            change_summary: versionData.change_summary,
            status: 'UNDER_REVIEW',
            created_at: new Date().toISOString(),
          };

          const updatedDoc: DocumentItem = {
            ...doc,
            latest_version_number: newVersion.version_number,
            status: 'UNDER_REVIEW',
            versions: [newVersion, ...(doc.versions || [])],
          };

          if (selectedDocForVersion?.id === docId) {
            setSelectedDocForVersion(updatedDoc);
          }
          return updatedDoc;
        }
        return doc;
      })
    );
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newCategory) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      project_id: 'proj-tsri-2026-01',
      prefix_code: newPrefix,
      document_code: newCode,
      title: newTitle,
      category: newCategory,
      issuing_body: newIssuingBody || 'สกสว.',
      status: 'RAW',
      latest_version_number: '1.0',
      tags: [newPrefix, newCategory],
      is_confidential: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        {
          id: `ver-${Date.now()}-1`,
          document_id: `doc-${Date.now()}`,
          project_id: 'proj-tsri-2026-01',
          version_number: '1.0',
          file_name: `${newCode}_v1.0.pdf`,
          file_size_bytes: 1500000,
          file_mime_type: 'application/pdf',
          storage_r2_key: `documents/${newCode}_v1.0.pdf`,
          change_summary: 'ลงทะเบียนเอกสารฉบับเริ่มต้น',
          status: 'RAW',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowCreateModal(false);
    setNewCode('');
    setNewTitle('');
    setNewCategory('');
    setNewIssuingBody('');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-xs font-semibold text-blue-400 font-mono">
              MODULE 4: DOCUMENT CENTER & VERSIONS
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              ศูนย์จัดเก็บเอกสารและทะเบียนกฎหมาย สกสว.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              จัดหมวดหมู่เอกสาร, ควบคุมเวอร์ชัน (Immutable History), และตรวจสอบความสอดคล้องตามระเบียบ
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            ลงทะเบียนเอกสารใหม่
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัส, ชื่อเอกสาร หรือหมวดหมู่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>ประเภท ID:</span>
            </div>
            <select
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">ทั้งหมด (ทุกประเภท ID)</option>
              {PREFIXES.map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix} — {DOCUMENT_PREFIX_LABELS[prefix]}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">ทุกสถานะ (Status)</option>
              {Object.keys(DOCUMENT_STATUS_BADGES).map((status) => (
                <option key={status} value={status}>
                  {status} — {DOCUMENT_STATUS_BADGES[status as DocumentStatus].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">รหัสเอกสาร</th>
                  <th className="py-3.5 px-4">ชื่อเอกสาร / ตัวบท</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4">หน่วยงานผู้ออก</th>
                  <th className="py-3.5 px-4">เวอร์ชัน</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">วันที่บันทึก</th>
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDocuments.map((doc) => {
                  const statusInfo = DOCUMENT_STATUS_BADGES[doc.status];
                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/50 transition group">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {doc.document_code}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-sm">
                        <div className="line-clamp-2">{doc.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {doc.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{doc.category}</td>
                      <td className="py-3.5 px-4 text-slate-400">{doc.issuing_body || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                        v{doc.latest_version_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded border ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {formatThaiDate(doc.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedDocForVersion(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition text-xs font-semibold shadow"
                        >
                          <History className="w-3.5 h-3.5" />
                          ประวัติ Version
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* Version History Modal */}
      <DocumentVersionModal
        document={selectedDocForVersion}
        onClose={() => setSelectedDocForVersion(null)}
        onUploadNewVersion={handleUploadVersion}
      />

      {/* Register New Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              ลงทะเบียนเอกสารใหม่เข้าระบบ (Register Document)
            </h2>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Prefix ID *</label>
                  <select
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value as DocumentPrefix)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                  >
                    {PREFIXES.map((p) => (
                      <option key={p} value={p}>
                        {p} — {DOCUMENT_PREFIX_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">รหัสเอกสาร (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น LAW-005, REG-009"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">ชื่อเอกสาร / กฎหมาย *</label>
                <input
                  type="text"
                  required
                  placeholder="ระบุชื่อเต็มของเอกสาร..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">หมวดหมู่เอกสาร *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น การเงิน, กฎหมายจัดตั้ง"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">หน่วยงานผู้ออก</label>
                  <input
                    type="text"
                    placeholder="เช่น สกสว., ครม."
                    value={newIssuingBody}
                    onChange={(e) => setNewIssuingBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  บันทึกเอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
