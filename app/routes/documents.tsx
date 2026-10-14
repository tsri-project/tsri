import { PageHero } from '~/components/shell/PageHero';
import { useState, useMemo, useEffect } from 'react';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
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

  const [searchParams] = useSearchParams();
  const requestedDocumentId = searchParams.get('id');
  useEffect(() => {
    if (requestedDocumentId) {
      setSelectedDocForVersion(initialDocuments.find(doc => doc.id === requestedDocumentId) || null);
    }
  }, [requestedDocumentId, initialDocuments]);

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
      <div className="themed-page p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        {/* Top Header Banner in Light Theme */}
        <PageHero title="ศูนย์เอกสาร" description="ค้นหาเอกสารโครงการ เปิดรายละเอียด และตรวจสอบฉบับเอกสารที่ต้องใช้" references={<div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#062B63] text-white rounded-lg">
                MODULE 04
              </span>
              <span className="text-xs font-bold text-[#F36C21] uppercase tracking-wider font-mono">
                CENTRAL DOCUMENT VAULT & R2 STORAGE
              </span>
            </div>}><div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Google Drive Master Folder Link */}
            <a
              href="https://drive.google.com/drive/folders/1OZQaNmTQmaWFJfdcMwkatS8RP7Wuc9d8?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 shadow-xs transition"
              title="เปิด Google Drive โฟลเดอร์รวมเอกสารโครงการ 14 หมวด"
            >
              <ExternalLink className="w-4 h-4 text-amber-600" />
              <span>Google Drive คลังเอกสาร</span>
            </a>

            {/* Google Drive Plan Folder 00.03 */}
            <a
              href="https://drive.google.com/drive/u/0/folders/1czzJh_4vNz-rjnFeh20I8oTiEEISNKKE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 shadow-xs transition"
              title="เปิดโฟลเดอร์แผนงาน Timeline & Milestone หมวด 00.03"
            >
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              <span>โฟลเดอร์แผนงาน (00.03)</span>
            </a>

            {/* R2 Cloudflare Sync Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-[#062B63] shadow-xs">
              <Cloud className="w-4 h-4 text-[#1356A3]" />
              <span>R2: tsri-documents-vault</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-2xl shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-[#F36C21]" />
              ลงทะเบียนเอกสารใหม่
            </button>
          </div></PageHero>

        {/* Featured Documents of Today (Oct 8, 2026) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-200 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                  🔥 กำลังดำเนินการ: แบบสัมภาษณ์กึ่งโครงสร้าง 10 ประเด็น
                </span>
                <span className="text-[10px] font-mono text-slate-500">v0.1 Draft</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                FORM-INT-001-2569: แบบสัมภาษณ์กึ่งโครงสร้าง (Semi-Structured Interview)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                เครื่องมือวิจัยสำหรับสัมภาษณ์และ Focus Group 10 ประเด็นหลัก ครอบคลุมอำนาจหน้าที่, Flow งานจริง, ปัญหาอุปสรรค, Gap และความเสี่ยง
              </p>
            </div>
            <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">หมวด 05.02 การเก็บข้อมูล</span>
              <a
                href="https://drive.google.com/drive/folders/1Y4uCfXDbjjm3fe63wmDSi29neiYbOwaF?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <span>Google Drive สัมภาษณ์</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-white border border-emerald-200 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full">
                  ✓ ข้อคิดเห็นที่ปรึกษา (ฝ่ายวิชาการ 4 ท่าน)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Verified</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                WORK-WS05-001A: การตรวจสอบและให้ข้อคิดเห็นของที่ปรึกษา (4 ท่าน)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                เอกสารบันทึกข้อคิดเห็นต่อบทบัญญัติกฎหมายและแนวทางวิเคราะห์อำนาจหน้าที่ สกสว. จาก ผศ.ดร.มารุต, นายกานต์กุญช์, อ.นภวัฒน์, ผศ.ดร.กนกพร
              </p>
            </div>
            <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">หมวด 05.03 ข้อคิดเห็นที่ปรึกษา</span>
              <a
                href="https://drive.google.com/drive/folders/1hfMPYkzRQlfuFq9ARDwS0_kFfMNk76Cq?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <span>Google Drive ข้อคิดเห็น</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-white border border-blue-200 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300 rounded-full">
                  📖 ข้อมูลวิเคราะห์: ขอบเขตอำนาจหน้าที่ กสว. และ สกสว.
                </span>
                <span className="text-[10px] font-mono text-slate-500">v1.0 Ready</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                DOC-LEGAL-MAPPING-001: ผลการศึกษาและวิเคราะห์ความเกี่ยวพันของ พ.ร.บ. กับภารกิจหน้าที่ สกสว.
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                รายงานถอดบทบัญญัติกฎหมาย 20 ฉบับ (195 ข้อกำหนด) สู่ 5 ภารกิจหลัก สกสว. ตามขอบเขต TOR ข้อ 4.3.1
              </p>
            </div>
            <div className="mt-3.5 pt-3 border-t border-blue-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">หมวด 06.02 Legal Mapping</span>
              <a
                href="/documents/06_งานวิเคราะห์และสังเคราะห์/06.02_Legal-Mapping/DOC-LEGAL-MAPPING-001_ผลการวิเคราะห์ความสัมพันธ์พรบกับภารกิจสกสว.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#062B63] hover:bg-[#1356A3] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <span>เปิดอ่านผลวิเคราะห์</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Folder Explorer Tree vs Right Document List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: 13 Lifecycle Folders Tree */}
          <div className="theme-card bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
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
            <div className="theme-card bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
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
            <div className="theme-card bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
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
            <div className="theme-card bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
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
