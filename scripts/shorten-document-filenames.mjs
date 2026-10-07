import fs from 'fs';
import path from 'path';

console.log('=== SHORTENING LONG FILENAMES (>200 BYTES) FOR LINUX CI COMPATIBILITY ===\n');

const renameMap = [
  {
    oldPath: 'public/documents/02_กฎหมายลำดับรอง/02.01_ระเบียบสภานโยบาย/REG-NSC-001-2562_ระเบียบสภานโยบาย-ว่าด้วยการบริหารกองทุนส่งเสริมวิทยาศาสตร์การวิจัยและนวัตกรรม_พ.ศ.-2562_v0.1.pdf.pdf',
    newPath: 'public/documents/02_กฎหมายลำดับรอง/02.01_ระเบียบสภานโยบาย/REG-NSC-001-2562_Fund-Management-2562.pdf',
  },
  {
    oldPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.01_ระเบียบสภานโยบาย/REG-NSC-001-2562_ระเบียบสภานโยบาย-ว่าด้วยการบริหารกองทุนส่งเสริมวิทยาศาสตร์การวิจัยและนวัตกรรม_พ.ศ.-2562_v0.1.pdf.pdf',
    newPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.01_ระเบียบสภานโยบาย/REG-NSC-001-2562_Fund-Management-2562.pdf',
  },
  {
    oldPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-004-2566_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการพัฒนาด้านวิทยาศาสตร์และเทคโนโลยี_พ.ศ.-2566.pdf',
    newPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-004-2566_Budget-SciTech-2566.pdf',
  },
  {
    oldPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-004-2566_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการพัฒนาด้านวิทยาศาสตร์และเทคโนโลยี_พ.ศ.-2566.pdf',
    newPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-004-2566_Budget-SciTech-2566.pdf',
  },
  {
    oldPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-005-2568_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการพัฒนาด้านวิทยาศาสตร์และเทคโนโลยี-ฉบับที่-2_พ.ศ.-2568.pdf',
    newPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-005-2568_Budget-SciTech-No2-2568.pdf',
  },
  {
    oldPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-005-2568_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการพัฒนาด้านวิทยาศาสตร์และเทคโนโลยี-ฉบับที่-2_พ.ศ.-2568.pdf',
    newPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-005-2568_Budget-SciTech-No2-2568.pdf',
  },
  {
    oldPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-006-2566_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการขับเคลื่อนการนำผลงานไปใช้ประโยชน์_พ.ศ.-2566.pdf',
    newPath: 'public/documents/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-006-2566_Budget-Utilization-2566.pdf',
  },
  {
    oldPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-006-2566_ประกาศ-กสว-เรื่องการจัดทำคำของบประมาณเพื่อสนับสนุนการขับเคลื่อนการนำผลงานไปใช้ประโยชน์_พ.ศ.-2566.pdf',
    newPath: 'document/PRJ-TSRI-2569-001/02_กฎหมายลำดับรอง/02.03_ประกาศ-กสว/ANN-PMH-006-2566_Budget-Utilization-2566.pdf',
  },
];

for (const item of renameMap) {
  const fullOld = path.join(process.cwd(), item.oldPath);
  const fullNew = path.join(process.cwd(), item.newPath);

  if (fs.existsSync(fullOld)) {
    fs.renameSync(fullOld, fullNew);
    console.log(`✓ Renamed: ${path.basename(item.oldPath)} -> ${path.basename(item.newPath)}`);
  } else {
    console.log(`- Skipped (Not found): ${item.oldPath}`);
  }
}

// Update app/lib/mock-data.ts
const mockDataPath = path.join(process.cwd(), 'app', 'lib', 'mock-data.ts');
if (fs.existsSync(mockDataPath)) {
  let content = fs.readFileSync(mockDataPath, 'utf8');
  content = content.replace(
    'REG-NSC-001-2562_ระเบียบสภานโยบาย-ว่าด้วยการบริหารกองทุนส่งเสริมวิทยาศาสตร์การวิจัยและนวัตกรรม_พ.ศ.-2562_v0.1.pdf.pdf',
    'REG-NSC-001-2562_Fund-Management-2562.pdf'
  );
  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log('\n✓ Updated mock-data.ts with new filename references.');
}
