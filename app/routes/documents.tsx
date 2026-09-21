import { useState, useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import { AppLayout } from '~/components/shell/AppLayout';
import { DocumentVersionModal } from '~/components/documents/DocumentVersionModal';
import { mockDocuments } from '~/lib/mock-data';
import {
  DocumentItem,
  DocumentPrefix,
  DOCUMENT_STATUS_BADGES,
  DocumentVersionItem,
} from '~/types';
import {
  DOCUMENT_TYPE_DICTIONARY,
  ORGANIZATION_DICTIONARY,
  RESEARCH_LIFECYCLE_FOLDERS,
  DocumentTypeCode,
  OrganizationCode,
  generateStandardFileName,
} from '~/lib/rag-document-parser';
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  FileText,
  History,
  Folder,
  ChevronRight,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  FileCode,
  Lock,
} from 'lucide-react';
import { formatThaiDate } from '~/lib/utils';

export const clientLoader = async () => {
  return { documents: mockDocuments };
};

export default function DocumentsRoute() {
  const { documents: initialDocuments } = useLoaderData<{ documents: DocumentItem[] }>();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL');
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<DocumentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Document Generator State
  const [formType, setFormType] = useState<DocumentTypeCode>('LAW');
  const [formOrg, setFormOrg] = useState<OrganizationCode>('NSC');
  const [formSeq, setFormSeq] = useState('001');
  const [formYear, setFormYear] = useState('2562');
  const [formTitle, setFormTitle] = useState('พระราชบัญญัติสภานโยบายการอุดมศึกษา');
  const [formStatus, setFormStatus] = useState('ฉบับใช้บังคับ');
  const [formCategory, setFormCategory] = useState('01.01_พระราชบัญญัติสภานโยบาย');

  const generatedFileName = useMemo(() => {
    return generateStandardFileName(
      formType,
      formOrg,
      formSeq,
      formYear,
      formTitle,
      formStatus,
      'pdf'
    );
  }, [formType, formOrg, formSeq, formYear, formTitle, formStatus]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchQuery =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.document_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'ALL' || doc.prefix_code === selectedType;
      const matchOrg = selectedOrg === 'ALL' || doc.document_code.includes(`-${selectedOrg}-`);

      return matchQuery && matchType && matchOrg;
    });
  }, [documents, searchQuery, selectedType, selectedOrg]);

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
    if (!formTitle) return;

    const docId = `${formType}-${formOrg}-${formSeq.padStart(3, '0')}-${formYear}`;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      project_id: 'proj-tsri-2026-01',
      prefix_code: formType as DocumentPrefix,
      document_code: docId,
      title: formTitle,
      category: formCategory,
      issuing_body: ORGANIZATION_DICTIONARY[formOrg],
      status: 'VALIDATED',
      latest_version_number: '1.0',
      tags: [formType, formOrg, formStatus],
      is_confidential: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        {
          id: `ver-${Date.now()}-1`,
          document_id: `doc-${Date.now()}`,
          project_id: 'proj-tsri-2026-01',
          version_number: '1.0',
          file_name: generatedFileName,
          file_size_bytes: 2450000,
          file_mime_type: 'application/pdf',
          storage_r2_key: `vault/${generatedFileName}`,
          change_summary: `ลงทะเบียนตามมาตรฐาน RAG Naming: ${generatedFileName}`,
          status: 'VALIDATED',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#062b63] via-slate-900 to-slate-950 border border-[#1356a3]/40 p-5 md:p-6 rounded-2xl shadow-xl">
          <div>
            <div className="text-xs font-semibold text-[#f36c21] font-mono flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4" />
              04 ศูนย์เอกสาร — ระบบสารบรรณโครงการ & RAG REGISTRY
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              ศูนย์จัดเก็บเอกสารและคลังข้อมูลสารบรรณ สกสว.
            </h1>
            <p className="text-xs md:text-sm text-blue-200 mt-1">
              มาตรฐานการตั้งชื่อไฟล์: <code className="text-[#f36c21] bg-black/40 px-2 py-0.5 rounded">[รหัสประเภท]-[หน่วยงาน]-[ลำดับ]-[ปี]_[ชื่อเรื่อง]-[สถานะ]</code>
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f36c21] hover:bg-[#d95813] text-white text-xs font-bold rounded-xl shadow-lg transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            ลงทะเบียนเอกสารตามมาตรฐาน Naming
          </button>
        </div>

        {/* Main Grid: Folder Tree Explorer + Document Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Research Lifecycle Folder Tree */}
          <div className="lg:col-span-1 bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/30 rounded-2xl p-4 shadow-xl flex flex-col h-fit">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1356a3]/30">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#f36c21]" />
                โครงสร้างโฟลเดอร์โครงการ
              </h3>
              <span className="text-[10px] text-blue-300 font-mono">10 หมวด</span>
            </div>

            <div className="space-y-1 text-xs max-h-[560px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedFolder('ALL')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedFolder === 'ALL'
                    ? 'bg-[#1356a3] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-[#062b63]/50'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-[#f36c21]" />
                <span>แสดงทุกโฟลเดอร์ (All)</span>
              </button>

              {RESEARCH_LIFECYCLE_FOLDERS.map((folder) => (
                <div key={folder.code} className="space-y-0.5">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-blue-200 bg-slate-900/60 rounded-lg flex items-center gap-1.5 mt-1">
                    <Folder className="w-3 h-3 text-[#168a91]" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {folder.subfolders && (
                    <div className="pl-3 space-y-0.5 border-l border-[#1356a3]/20 ml-2">
                      {folder.subfolders.map((sub) => (
                        <button
                          key={sub.code}
                          onClick={() => setSelectedFolder(sub.name)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition truncate block ${
                            selectedFolder === sub.name
                              ? 'bg-[#168a91] text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#062b63]/30'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Search Filters & Document Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-gradient-to-b from-[#062b63]/60 to-slate-950 border border-[#1356a3]/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตาม Document ID หรือชื่อเรื่อง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#f36c21]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-[#1356a3]/40 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#f36c21]"
                >
                  <option value="ALL">ทุกประเภทเอกสาร (Type)</option>
                  {Object.entries(DOCUMENT_TYPE_DICTIONARY).map(([code, info]) => (
                    <option key={code} value={code}>
                      {code} — {info.thaiName}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="bg-slate-950 border border-[#1356a3]/40 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#f36c21]"
                >
                  <option value="ALL">ทุกหน่วยงาน (Org)</option>
                  {Object.entries(ORGANIZATION_DICTIONARY).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} — {name.substring(0, 20)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Table */}
            <div className="bg-gradient-to-b from-[#062b63]/80 to-slate-950 border border-[#1356a3]/40 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#062b63] text-blue-200 font-semibold border-b border-[#1356a3]/40">
                    <tr>
                      <th className="py-3.5 px-4">Document ID</th>
                      <th className="py-3.5 px-4">ชื่อเอกสาร / กฎหมาย</th>
                      <th className="py-3.5 px-4">หน่วยงาน</th>
                      <th className="py-3.5 px-4">เวอร์ชัน</th>
                      <th className="py-3.5 px-4">สถานะ</th>
                      <th className="py-3.5 px-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1356a3]/20">
                    {filteredDocuments.map((doc) => {
                      const statusInfo = DOCUMENT_STATUS_BADGES[doc.status];
                      return (
                        <tr key={doc.id} className="hover:bg-[#1356a3]/20 transition group">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#f36c21]">
                            {doc.document_code}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-white max-w-sm">
                            <div className="line-clamp-2">{doc.title}</div>
                            <div className="text-[10px] text-blue-300/80 mt-0.5 font-mono">
                              โฟลเดอร์: {doc.category}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{doc.issuing_body || '-'}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-200 font-bold">
                            v{doc.latest_version_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${statusInfo.class}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedDocForVersion(doc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1356a3] hover:bg-[#f36c21] text-white rounded-lg transition text-xs font-semibold shadow"
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
                <div className="py-12 text-center text-slate-400 text-xs">
                  ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <DocumentVersionModal
        document={selectedDocForVersion}
        onClose={() => setSelectedDocForVersion(null)}
        onUploadNewVersion={handleUploadVersion}
      />

      {/* Register Document Modal with Standard Naming Generator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-slate-900 border border-[#1356a3]/60 rounded-3xl shadow-2xl p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[#f36c21]" />
              ลงทะเบียนเอกสารตามระบบสารบรรณ & Naming Convention
            </h2>
            <p className="text-xs text-blue-200 mb-4">
              ระบบจะสร้าง Document ID และชื่อไฟล์มาตรฐานภาษาไทยสำหรับ RAG Database อัตโนมัติ
            </p>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              {/* Generator Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#062b63]/40 p-3.5 rounded-2xl border border-[#1356a3]/40">
                <div>
                  <label className="block text-[11px] text-blue-200 font-semibold mb-1">
                    1. รหัสประเภท
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as DocumentTypeCode)}
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {Object.keys(DOCUMENT_TYPE_DICTIONARY).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-blue-200 font-semibold mb-1">
                    2. หน่วยงาน
                  </label>
                  <select
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value as OrganizationCode)}
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {Object.keys(ORGANIZATION_DICTIONARY).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-blue-200 font-semibold mb-1">
                    3. ลำดับ (Seq)
                  </label>
                  <input
                    type="text"
                    value={formSeq}
                    onChange={(e) => setFormSeq(e.target.value)}
                    placeholder="001"
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-blue-200 font-semibold mb-1">
                    4. ปี (พ.ศ.)
                  </label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2562"
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  5. ชื่อเรื่องภาษาไทย *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น พระราชบัญญัติสภานโยบายการอุดมศึกษา"
                  className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-xl px-3 py-2 text-xs text-white focus:border-[#f36c21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    6. สถานะเอกสาร
                  </label>
                  <input
                    type="text"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    placeholder="ฉบับใช้บังคับ / ฉบับลงนาม"
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    7. โฟลเดอร์ปลายทาง
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-[#1356a3]/40 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {RESEARCH_LIFECYCLE_FOLDERS.flatMap((f) => f.subfolders || []).map((sub) => (
                      <option key={sub.code} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Preview Banner */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-[#f36c21]/40 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-[#f36c21] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  RAG Standard File Name Preview
                </div>
                <div className="font-mono text-xs font-bold text-white break-all select-all">
                  {generatedFileName}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1356a3]/30">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f36c21] hover:bg-[#d95813] text-white text-xs font-bold rounded-xl shadow transition"
                >
                  บันทึกลงทะเบียนเอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
