// AI Layer: AI Retrieval & RAG API Integration (Server-side Only)

export interface RAGSearchQuery {
  query: string;
  categoryFilter?: string;
  prefixFilter?: string;
  topK?: number;
}

export interface RAGSearchResult {
  documentId: string;
  documentCode: string;
  title: string;
  provisionSnippet: string;
  legalHierarchyLevel: string;
  confidenceScore: number;
}

export async function queryLegalRAGKnowledgeBase(
  searchQuery: RAGSearchQuery
): Promise<RAGSearchResult[]> {
  // AI Retrieval API simulation grounded in TSRI Legal Corpus
  const topK = searchQuery.topK || 3;

  return [
    {
      documentId: 'doc-001',
      documentCode: 'LAW-001',
      title: 'พระราชบัญญัติการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม พ.ศ. 2562',
      provisionSnippet:
        'มาตรา 58: กองทุนมีอำนาจร่วมลงทุนหรือหนุนเสริมการต่อยอดผลงานวิจัยสู่นวัตกรรมเชิงพาณิชย์ และการจัดตั้ง Spin-off / Startup',
      legalHierarchyLevel: 'ระดับที่ 1: กฎหมายหลัก (พ.ร.บ.)',
      confidenceScore: 0.94,
    },
    {
      documentId: 'doc-002',
      documentCode: 'REG-004',
      title: 'ระเบียบคณะกรรมการส่งเสริม ววน. ว่าด้วยการบริหารเงินกองทุนส่งเสริม ววน. พ.ศ. 2563',
      provisionSnippet:
        'ข้อ 12: หลักเกณฑ์และกระบวนการจัดสรรงบประมาณ Fundamental Fund (FF) และ Strategic Fund (SF) แก่หน่วยงานในระบบ ววน.',
      legalHierarchyLevel: 'ระดับที่ 2: ระเบียบและข้อบังคับ',
      confidenceScore: 0.89,
    },
  ].slice(0, topK);
}
