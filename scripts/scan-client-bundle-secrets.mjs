import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const clientDir = path.join(process.cwd(), 'build', 'client');

const secretsToCheck = [
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
  { name: 'R2_ACCESS_KEY_ID', value: process.env.R2_ACCESS_KEY_ID },
  { name: 'R2_SECRET_ACCESS_KEY', value: process.env.R2_SECRET_ACCESS_KEY },
  { name: 'LINE_CHANNEL_ACCESS_TOKEN', value: process.env.LINE_CHANNEL_ACCESS_TOKEN },
  { name: 'LINE_CHANNEL_SECRET', value: process.env.LINE_CHANNEL_SECRET },
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function scanClientBundle() {
  console.log('================================================================');
  console.log('SECURITY SCAN: CHECKING build/client FOR SENSITIVE SECRETS');
  console.log('================================================================\n');

  const files = getAllFiles(clientDir);
  console.log(`Total files scanned in build/client: ${files.length}\n`);

  const results = [];

  for (const secret of secretsToCheck) {
    if (!secret.value || secret.value.trim().length < 5) {
      results.push({
        Secret_Name: secret.name,
        Configured_In_Env: false,
        Found_In_Client_Bundle: false,
        Status: 'PASSED (Not defined)',
      });
      continue;
    }

    let foundIn = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(secret.value)) {
        foundIn.push(path.relative(clientDir, filePath));
      }
    }

    const passed = foundIn.length === 0;
    results.push({
      Secret_Name: secret.name,
      Configured_In_Env: true,
      Found_In_Client_Bundle: foundIn.length > 0,
      Matched_Files_Count: foundIn.length,
      Status: passed ? '✅ SAFE (0 matches)' : `❌ LEAKED in ${foundIn.join(', ')}`,
    });
  }

  console.table(results);
}

scanClientBundle();
