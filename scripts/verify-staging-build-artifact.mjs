import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('STAGING BUILD & BUNDLE ARTIFACT INSPECTION (ZERO WRITE REQUESTS)');
console.log('================================================================\n');

const sandboxUrl = 'https://tsri-staging-sandbox.supabase.co';
const sandboxAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1zYW5kYm94IiwicmVmIjoidHNyaS1zdGFnaW5nLXNhbmRib3giLCJyb2xlIjoiYW5vbiJ9.mock_signature_for_staging_sandbox';

// Backup .env
let envBackup = null;
if (fs.existsSync('.env')) {
  envBackup = fs.readFileSync('.env', 'utf8');
  fs.renameSync('.env', '.env.temp_staging_inspect');
}

try {
  console.log(`1. Executing Staging Build with Supabase Sandbox:`);
  console.log(`   - Sandbox URL: ${sandboxUrl}`);
  console.log(`   - BUILD_TARGET: staging`);
  console.log(`   - CF_PAGES_BRANCH: staging\n`);

  const buildOutput = execSync('npx vite build', {
    env: {
      ...process.env,
      VITE_SUPABASE_URL: sandboxUrl,
      VITE_SUPABASE_ANON_KEY: sandboxAnonKey,
      BUILD_TARGET: 'staging',
      CF_PAGES_BRANCH: 'staging',
    },
    encoding: 'utf8',
    stdio: 'pipe',
  });

  console.log('2. Build succeeded (Exit Code: 0).\n');

  // 3. Inspect build/client/assets for embedded Supabase host
  const assetsDir = path.join(process.cwd(), 'build', 'client', 'assets');
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

  console.log(`3. Inspecting ${jsFiles.length} client bundle files in build/client/assets/ ...\n`);

  let foundSandbox = [];
  let foundProduction = [];

  for (const file of jsFiles) {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('tsri-staging-sandbox.supabase.co')) {
      foundSandbox.push(file);
    }
    if (content.includes('aatlledgsftkjfunqsvh.supabase.co')) {
      foundProduction.push(file);
    }
  }

  console.log(`--- INSPECTION RESULTS ---`);
  console.log(`Files containing Sandbox URL (${sandboxUrl}):`);
  foundSandbox.forEach(f => console.log(`  ✓ ${f}`));

  console.log(`\nFiles containing Production DB URL (aatlledgsftkjfunqsvh.supabase.co):`);
  if (foundProduction.length === 0) {
    console.log(`  🔒 NONE (0 files) - Production DB is completely absent from the client bundle!`);
  } else {
    foundProduction.forEach(f => console.log(`  ❌ VIOLATION in ${f}`));
  }

} catch (err) {
  console.error('Build / Inspection Error:', err.message);
  if (err.stdout) console.log('Stdout:', err.stdout);
  if (err.stderr) console.log('Stderr:', err.stderr);
} finally {
  // Restore .env
  if (envBackup !== null && fs.existsSync('.env.temp_staging_inspect')) {
    fs.renameSync('.env.temp_staging_inspect', '.env');
  }
}
