import { useState, useMemo } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
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
  Download,
  ExternalLink,
  ShieldCheck,
  Cloud,
  HardDrive,
  X,
} from 'lucide-react';
import { formatThaiDate, formatFileSize } from '~/lib/utils';

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

      const matchFolder =
        selectedFolder === 'ALL' ||
        doc.category.toLowerCase().includes(selectedFolder.toLowerCase());

      const matchType = selectedType === 'ALL' || doc.prefix_code === selectedType;
      const matchOrg = selectedOrg === 'ALL' || doc.document_code.includes(`-${selectedOrg}-`);

      return matchQuery && matchFolder && matchType && matchOrg;
    });
  }, [documents, searchQuery, selectedFolder, selectedType, selectedOrg]);

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
            storage_url: `/documents/${versionData.file_name}`,
            change_summary: versionData.change_summary,
            status: 'UNDER_REVIEW',
            created_at: new Date().toISOString(),
          };
          return {
            ...doc,
            latest_version_number: versionData.version_number || doc.latest_version_number,
            updated_at: new Date().toISOString(),
            versions: [newVersion, ...(doc.versions || [])],
          };
        }
        return doc;
      })
    );
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const docCode = `${formType}-${formOrg}-${formSeq}-${formYear}`;
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      project_id: 'proj-tsri-2026-01',
      prefix_code: formType as DocumentPrefix,
      document_code: docCode,
      title: formTitle,
      category: formCategory,
      issuing_body: ORGANIZATION_DICTIONARY[formOrg] || 'สกสว.',
      effective_date: '2026-01-15',
      status: 'RAW',
      latest_version_number: '1.0',
      tags: [formType, formOrg, formYear],
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
          file_size_bytes: 1540000,
          file_mime_type: 'application/pdf',
          storage_r2_key: `documents/${generatedFileName}`,
          storage_url: `/documents/${generatedFileName}`,
          change_summary: 'ลงทะเบียนเอกสารใหม่เข้าระบบคลัง R2',
          status: 'RAW',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setDocuments([newDoc, ...documents]);
    setShowCreateModal(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Top Header Banner in Light Theme */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-lg">
                MODULE 04
              </span>
              <span className="text-xs font-bold text-[#F36C21] uppercase tracking-wider font-mono">
                CENTRAL DOCUMENT VAULT & R2 STORAGE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              ศูนย์รวบรวมเอกสารและคลังข้อมูลกฎหมาย (Document Vault)
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
              จัดเก็บเอกสารอย่างเป็นระบบ 13 โฟลเดอร์วงจรวิจัย พร้อมระบบตั้งชื่อมาตรฐาน (Standardized Filing Convention) และจัดเก็บบน Cloudflare R2
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* R2 Cloudflare Sync Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-[#062B63] shadow-xs">
              <Cloud className="w-4 h-4 text-[#1356A3]" />
              <span>R2 Bucket: tsri-documents-vault</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-2xl shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-[#F36C21]" />
              ลงทะเบียนเอกสารใหม่
            </button>
          </div>
        </div>

        {/* Main Grid: Left Folder Explorer Tree vs Right Document List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: 13 Lifecycle Folders Tree */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#1356A3]" />
                โครงสร้าง 13 โฟลเดอร์วิจัย
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold">
                {documents.length} ฉบับ
              </span>
            </div>

            <div className="space-y-1 text-xs max-h-[600px] overflow-y-auto pr-1 scrollbar-none">
              <button
                onClick={() => setSelectedFolder('ALL')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedFolder === 'ALL'
                    ? 'bg-[#062B63] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-[#F36C21]" />
                <span>แสดงทุกโฟลเดอร์ (ทั้งหมด)</span>
              </button>

              {RESEARCH_LIFECYCLE_FOLDERS.map((folder) => (
                <div key={folder.code} className="space-y-0.5">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-800 bg-slate-50 rounded-xl flex items-center gap-1.5 mt-1 border border-slate-100">
                    <Folder className="w-3 h-3 text-[#1356A3]" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {folder.subfolders && (
                    <div className="pl-3 space-y-0.5 border-l border-slate-200 ml-3">
                      {folder.subfolders.map((sub) => (
                        <button
                          key={sub.code}
                          onClick={() => setSelectedFolder(sub.name)}
                          className={`w-full text-left px-2 py-1 rounded-lg text-[11px] transition truncate block ${
                            selectedFolder === sub.name
                              ? 'bg-blue-50 text-[#1356A3] font-extrabold border border-blue-200'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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

          {/* Right Column: Filters & Documents Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตาม Document Code หรือชื่อเอกสาร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1356A3]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2 focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
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
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2 focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                >
                  <option value="ALL">ทุกหน่วยงาน (Org)</option>
                  {Object.entries(ORGANIZATION_DICTIONARY).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} — {name.substring(0, 20)}...
                    </option>
                  ))}
                </select>

                {selectedFolder !== 'ALL' && (
                  <button
                    onClick={() => setSelectedFolder('ALL')}
                    className="text-xs text-[#F36C21] font-bold hover:underline flex items-center gap-1 ml-1"
                  >
                    ล้างโฟลเดอร์ <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Table in Light Theme */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 rounded-l-xl">Document ID</th>
                      <th className="py-3.5 px-4">ชื่อเอกสาร / กฎหมาย</th>
                      <th className="py-3.5 px-4">หมวดหมู่ / โฟลเดอร์</th>
                      <th className="py-3.5 px-4">เวอร์ชัน</th>
                      <th className="py-3.5 px-4">สถานะ</th>
                      <th className="py-3.5 px-4 text-right rounded-r-xl">เปิดไฟล์ / R2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => {
                      const statusInfo = DOCUMENT_STATUS_BADGES[doc.status];
                      const latestVer = doc.versions?.[0];
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1356A3]">
                            {doc.document_code}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm">
                            <div className="line-clamp-2 font-bold">{doc.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {doc.issuing_body || 'สกสว.'} • {formatThaiDate(doc.created_at)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                            {doc.category}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                            v{doc.latest_version_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusInfo.class}`}
                            >
                              ● {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {latestVer?.storage_url ? (
                                <a
                                  href={latestVer.storage_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-[#062B63] hover:text-white hover:bg-[#062B63] rounded-xl border border-slate-200 transition shadow-2xs"
                                  title="เปิดดู / ดาวน์โหลดไฟล์"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              ) : (
                                <button
                                  onClick={() => setSelectedDocForVersion(doc)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                                  title="ดูเวอร์ชัน"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedDocForVersion(doc)}
                                className="p-1.5 text-slate-600 hover:text-[#1356A3] hover:bg-blue-50 rounded-xl border border-slate-200 transition"
                                title="ประวัติเวอร์ชัน (Version History)"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Document Version History */}
        {selectedDocForVersion && (
          <DocumentVersionModal
            document={selectedDocForVersion}
            onClose={() => setSelectedDocForVersion(null)}
            onUploadNewVersion={handleUploadVersion}
          />
        )}

        {/* Modal: Create Document Generator */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#062B63] to-[#1356A3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F36C21]">
                    RAG DOCUMENT CONVENTION GENERATOR
                  </div>
                  <h3 className="text-base font-extrabold mt-0.5">
                    ลงทะเบียนและสร้างรหัสเอกสารมาตรฐาน (Document Standard Filing)
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Generated Preview Box */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-1">
                  <div className="text-[11px] font-bold text-[#062B63] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F36C21]" />
                    ชื่อไฟล์มาตรฐานที่จะบันทึกบน Cloudflare R2:
                  </div>
                  <div className="font-mono text-xs font-bold text-[#1356A3] break-all">
                    {generatedFileName}
                  </div>
                </div>

                {/* Grid: Type & Org */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      1. ประเภทเอกสาร (Doc Type) *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as DocumentTypeCode)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    >
                      {Object.entries(DOCUMENT_TYPE_DICTIONARY).map(([code, info]) => (
                        <option key={code} value={code}>
                          {code} — {info.thaiName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. หน่วยงานผู้ออก (Organization) *
                    </label>
                    <select
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value as OrganizationCode)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    >
                      {Object.entries(ORGANIZATION_DICTIONARY).map(([code, name]) => (
                        <option key={code} value={code}>
                          {code} — {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid: Seq & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      3. ลำดับเอกสาร (Sequence 3 หลัก) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="001"
                      value={formSeq}
                      onChange={(e) => setFormSeq(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      4. ปี พ.ศ. (Year 4 หลัก) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2562"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    5. ชื่อเรื่องเอกสาร (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อเอกสารหรือกฎหมายภาษาไทย..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  />
                </div>

                {/* Category Folder Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    6. จัดเก็บในโฟลเดอร์วิจัย (Research Folder) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-[#1356A3] focus:outline-none"
                  >
                    <option value="00_บริหารและควบคุมโครงการ / 00.01_TOR-สัญญา">00_บริหารและควบคุมโครงการ / 00.01_TOR-สัญญา</option>
                    <option value="01_กฎหมายแม่บท / 01.01_พระราชบัญญัติสภานโยบาย">01_กฎหมายแม่บท / 01.01_พระราชบัญญัติสภานโยบาย</option>
                    <option value="01_กฎหมายแม่บท / 01.02_พระราชบัญญัติส่งเสริม-ววน">01_กฎหมายแม่บท / 01.02_พระราชบัญญัติส่งเสริม-ววน</option>
                    <option value="02_กฎหมายลำดับรอง / 02.01_ระเบียบสภานโยบาย">02_กฎหมายลำดับรอง / 02.01_ระเบียบสภานโยบาย</option>
                    <option value="02_กฎหมายลำดับรอง / 02.02_ระเบียบ-กสว">02_กฎหมายลำดับรอง / 02.02_ระเบียบ-กสว</option>
                    <option value="02_กฎหมายลำดับรอง / 02.03_ประกาศ-กสว">02_กฎหมายลำดับรอง / 02.03_ประกาศ-กสว</option>
                    <option value="02_กฎหมายลำดับรอง / 02.06_คำสั่ง">02_กฎหมายลำดับรอง / 02.06_คำสั่ง</option>
                    <option value="06_งานวิเคราะห์และสังเคราะห์ / 06.01_Gap-Analysis">06_งานวิเคราะห์และสังเคราะห์ / 06.01_Gap-Analysis</option>
                  </select>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#F36C21]" />
                    <span>สร้างและบันทึกลงคลัง</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
