// RAG Document Parser & File Naming Engine
// Standard: [TYPE]-[ORG]-[SEQ]-[YEAR]_[TITLE]-[STATUS].[EXT]

export type DocumentTypeCode =
  | 'LAW'
  | 'REG'
  | 'ANN'
  | 'RULE'
  | 'RES'
  | 'ORD'
  | 'GUIDE'
  | 'FORM'
  | 'TOR'
  | 'MOM'
  | 'REP'
  | 'EVD'
  | 'REV'
  | 'DEL';

export const DOCUMENT_TYPE_DICTIONARY: Record<
  DocumentTypeCode,
  { thaiName: string; usage: string; hierarchyLevel: number }
> = {
  LAW: { thaiName: 'พระราชบัญญัติ/กฎหมายหลัก', usage: 'พ.ร.บ. แม่บท', hierarchyLevel: 1 },
  REG: { thaiName: 'ระเบียบ', usage: 'ระเบียบสภาฯ / ระเบียบ กสว.', hierarchyLevel: 2 },
  ANN: { thaiName: 'ประกาศ', usage: 'ประกาศ กสว. / สกสว.', hierarchyLevel: 2 },
  RULE: { thaiName: 'หลักเกณฑ์', usage: 'หลักเกณฑ์ / เงื่อนไข', hierarchyLevel: 2 },
  RES: { thaiName: 'มติ', usage: 'มติ กสว. / มติคณะกรรมการ', hierarchyLevel: 2 },
  ORD: { thaiName: 'คำสั่ง', usage: 'คำสั่ง สกสว.', hierarchyLevel: 2 },
  GUIDE: { thaiName: 'แนวปฏิบัติ', usage: 'แนวปฏิบัติ / คู่มือ', hierarchyLevel: 3 },
  FORM: { thaiName: 'แบบฟอร์ม', usage: 'แบบฟอร์มเอกสาร', hierarchyLevel: 3 },
  TOR: { thaiName: 'TOR / สัญญา', usage: 'ข้อกำหนดโครงการ', hierarchyLevel: 1 },
  MOM: { thaiName: 'รายงานการประชุม', usage: 'Minutes of Meeting', hierarchyLevel: 2 },
  REP: { thaiName: 'รายงาน', usage: 'รายงานวิจัย / รายงานวิเคราะห์', hierarchyLevel: 2 },
  EVD: { thaiName: 'หลักฐาน', usage: 'Evidence ข้อมูลจริง', hierarchyLevel: 3 },
  REV: { thaiName: 'ความเห็นผู้เชี่ยวชาญ', usage: 'Review & Validation', hierarchyLevel: 2 },
  DEL: { thaiName: 'ผลส่งมอบ', usage: 'Deliverable ตาม TOR', hierarchyLevel: 1 },
};

export type OrganizationCode = 'NSC' | 'PMH' | 'TSRI' | 'CAB' | 'MOF' | 'CGD' | 'PROJ';

export const ORGANIZATION_DICTIONARY: Record<OrganizationCode, string> = {
  NSC: 'สภานโยบายการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรมแห่งชาติ',
  PMH: 'คณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (กสว.)',
  TSRI: 'สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)',
  CAB: 'คณะรัฐมนตรี',
  MOF: 'กระทรวงการคลัง',
  CGD: 'กรมบัญชีกลาง',
  PROJ: 'เอกสารโครงการวิจัย',
};

export interface ResearchFolderNode {
  code: string;
  name: string;
  description?: string;
  subfolders?: { code: string; name: string }[];
}

export const RESEARCH_LIFECYCLE_FOLDERS: ResearchFolderNode[] = [
  {
    code: '00',
    name: '00_บริหารโครงการ',
    subfolders: [
      { code: '00.01', name: '00.01_TOR-สัญญา' },
      { code: '00.02', name: '00.02_คำสั่งแต่งตั้ง' },
      { code: '00.03', name: '00.03_แผนงาน-Timeline' },
      { code: '00.04', name: '00.04_รายงานการประชุม' },
      { code: '00.05', name: '00.05_Decision-Log' },
      { code: '00.06', name: '00.06_เอกสารส่งมอบ' },
    ],
  },
  {
    code: '01',
    name: '01_กฎหมายแม่บท',
    subfolders: [
      { code: '01.01', name: '01.01_พระราชบัญญัติสภานโยบาย' },
      { code: '01.02', name: '01.02_พระราชบัญญัติส่งเสริม-ววน' },
    ],
  },
  {
    code: '02',
    name: '02_กฎหมายลำดับรอง',
    subfolders: [
      { code: '02.01', name: '02.01_ระเบียบสภานโยบาย' },
      { code: '02.02', name: '02.02_ระเบียบ-กสว' },
      { code: '02.03', name: '02.03_ประกาศ-กสว' },
      { code: '02.04', name: '02.04_หลักเกณฑ์' },
      { code: '02.05', name: '02.05_มติ' },
      { code: '02.06', name: '02.06_คำสั่ง' },
    ],
  },
  {
    code: '03',
    name: '03_กฎหมายที่เกี่ยวข้อง',
    subfolders: [
      { code: '03.01', name: '03.01_งบประมาณ' },
      { code: '03.02', name: '03.02_การเงิน-การคลัง' },
      { code: '03.03', name: '03.03_จัดซื้อจัดจ้าง-พัสดุ' },
      { code: '03.04', name: '03.04_บุคลากร' },
      { code: '03.05', name: '03.05_กองทุน-การลงทุน' },
      { code: '03.06', name: '03.06_กฎหมายอื่น' },
    ],
  },
  {
    code: '04',
    name: '04_เอกสารการปฏิบัติงานจริง',
    subfolders: [
      { code: '04.01', name: '04.01_แนวปฏิบัติ' },
      { code: '04.02', name: '04.02_คู่มือ' },
      { code: '04.03', name: '04.03_แบบฟอร์ม' },
      { code: '04.04', name: '04.04_Process' },
      { code: '04.05', name: '04.05_หลักฐานการปฏิบัติงาน' },
    ],
  },
  {
    code: '05',
    name: '05_งานวิจัยภาคสนาม',
    subfolders: [
      { code: '05.01', name: '05.01_Interview' },
      { code: '05.02', name: '05.02_Focus-Group' },
      { code: '05.03', name: '05.03_Workshop' },
      { code: '05.04', name: '05.04_Questionnaire' },
      { code: '05.05', name: '05.05_Actual-Practice' },
    ],
  },
  {
    code: '06',
    name: '06_งานวิเคราะห์',
    subfolders: [
      { code: '06.01', name: '06.01_Legal-Inventory' },
      { code: '06.02', name: '06.02_Legal-Mapping' },
      { code: '06.03', name: '06.03_Traceability' },
      { code: '06.04', name: '06.04_Gap-Analysis' },
      { code: '06.05', name: '06.05_Risk-Analysis' },
      { code: '06.06', name: '06.06_Recommendations' },
    ],
  },
  {
    code: '07',
    name: '07_Expert-Review',
    subfolders: [
      { code: '07.01', name: '07.01_ส่งตรวจ' },
      { code: '07.02', name: '07.02_ความเห็นผู้เชี่ยวชาญ' },
      { code: '07.03', name: '07.03_Revision' },
      { code: '07.04', name: '07.04_Validated' },
    ],
  },
  {
    code: '08',
    name: '08_Knowledge-Learning',
    subfolders: [
      { code: '08.01', name: '08.01_Knowledge-Matrix' },
      { code: '08.02', name: '08.02_Learning-Journey' },
      { code: '08.03', name: '08.03_Video' },
      { code: '08.04', name: '08.04_Infographic' },
      { code: '08.05', name: '08.05_Assessment' },
      { code: '08.06', name: '08.06_Manual' },
    ],
  },
  {
    code: '09',
    name: '09_Final-Deliverables',
    subfolders: [
      { code: '09.01', name: '09.01_รายงาน' },
      { code: '09.02', name: '09.02_คู่มือ' },
      { code: '09.03', name: '09.03_สื่อ' },
      { code: '09.04', name: '09.04_KM' },
      { code: '09.05', name: '09.05_Acceptance-Pack' },
    ],
  },
  {
    code: '99',
    name: '99_Archive',
    subfolders: [{ code: '99.01', name: '99.01_เอกสารยกเลิก-สิ้นผล' }],
  },
];

export interface ParsedDocumentMeta {
  typeCode: DocumentTypeCode;
  orgCode: OrganizationCode;
  sequence: string;
  year: string;
  documentId: string;
  title: string;
  statusText: string;
  fileExtension: string;
  suggestedFolder: string;
  isValidNaming: boolean;
}

export function parseStandardFileName(fileName: string): ParsedDocumentMeta {
  // Regex: [TYPE]-[ORG]-[SEQ]-[YEAR]_[TITLE]-[STATUS].[EXT]
  const pattern = /^([A-Z]{3,5})-([A-Z]{3,5})-(\d{3})-([0-9xX]{4})_([^_]+)-([^\.]+)\.([a-zA-Z0-9]+)$/;
  const match = fileName.match(pattern);

  if (match) {
    const [_, type, org, seq, year, title, status, ext] = match;
    const documentId = `${type}-${org}-${seq}-${year}`;

    let suggestedFolder = '00_บริหารโครงการ';
    if (type === 'LAW') suggestedFolder = '01_กฎหมายแม่บท';
    else if (['REG', 'ANN', 'RULE', 'RES', 'ORD'].includes(type)) suggestedFolder = '02_กฎหมายลำดับรอง';
    else if (['GUIDE', 'FORM', 'EVD'].includes(type)) suggestedFolder = '04_เอกสารการปฏิบัติงานจริง';
    else if (type === 'REP') suggestedFolder = '06_งานวิเคราะห์';
    else if (type === 'REV') suggestedFolder = '07_Expert-Review';
    else if (type === 'DEL') suggestedFolder = '09_Final-Deliverables';

    return {
      typeCode: type as DocumentTypeCode,
      orgCode: org as OrganizationCode,
      sequence: seq,
      year,
      documentId,
      title: title.replace(/-/g, ' '),
      statusText: status.replace(/-/g, ' '),
      fileExtension: ext,
      suggestedFolder,
      isValidNaming: true,
    };
  }

  return {
    typeCode: 'DOC' as any,
    orgCode: 'PROJ',
    sequence: '001',
    year: '2569',
    documentId: 'UNKNOWN',
    title: fileName,
    statusText: 'ฉบับร่าง',
    fileExtension: fileName.split('.').pop() || 'pdf',
    suggestedFolder: '00_บริหารโครงการ',
    isValidNaming: false,
  };
}

export function generateStandardFileName(
  type: DocumentTypeCode,
  org: OrganizationCode,
  seq: string | number,
  year: string,
  title: string,
  status: string,
  ext: string = 'pdf'
): string {
  const seqFormatted = String(seq).padStart(3, '0');
  const sanitizedTitle = title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9ก-๙-]/g, '');
  const sanitizedStatus = status.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9ก-๙-]/g, '');

  return `${type}-${org}-${seqFormatted}-${year}_${sanitizedTitle}-${sanitizedStatus}.${ext}`;
}
