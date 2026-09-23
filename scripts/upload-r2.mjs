import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const baseDir = join(process.cwd(), 'document', 'PRJ-TSRI-2569-001');
const bucketName = 'tsri-documents-vault';

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  for (const file of files) {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function uploadAll() {
  console.log(`🔍 Scanning directory: ${baseDir}`);
  const files = getAllFiles(baseDir);
  console.log(`📦 Found ${files.length} files to sync with Cloudflare R2 bucket [${bucketName}]...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relPath = relative(baseDir, filePath).replace(/\\/g, '/');
    const r2Key = `PRJ-TSRI-2569-001/${relPath}`;

    console.log(`[${i + 1}/${files.length}] Uploading: ${r2Key}`);
    try {
      // Use wrangler r2 object put
      const cmd = `npx wrangler r2 object put "${bucketName}/${r2Key}" --file "${filePath}" --remote`;
      execSync(cmd, { stdio: 'inherit' });
      success++;
    } catch (err) {
      console.error(`❌ Failed uploading ${r2Key}:`, err.message);
      failed++;
    }
  }

  console.log(`\n🎉 Upload complete! Success: ${success}, Failed: ${failed}`);
}

uploadAll();
