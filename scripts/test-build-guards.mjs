import { execSync } from 'child_process';
import fs from 'fs';

console.log('===============================================================');
console.log('TEST SUITE: BUILD GUARDS & ENVIRONMENT SAFETY VERIFICATION');
console.log('===============================================================\n');

// Backup .env if exists
let envBackup = null;
if (fs.existsSync('.env')) {
  envBackup = fs.readFileSync('.env', 'utf8');
  fs.renameSync('.env', '.env.temp_guard_test');
}

const results = [];

function runBuildTest(testName, envVars, expectedOutcome) {
  console.log(`--- RUNNING: ${testName} ---`);
  let exitCode = 0;
  let output = '';
  try {
    output = execSync('npx vite build', {
      env: {
        ...process.env,
        ...envVars,
      },
      encoding: 'utf8',
      stdio: 'pipe',
    });
    exitCode = 0;
  } catch (err) {
    exitCode = err.status || 1;
    output = (err.stdout || '') + '\n' + (err.stderr || '');
  }

  const passed =
    (expectedOutcome === 'FAIL' && exitCode !== 0) ||
    (expectedOutcome === 'SUCCESS' && exitCode === 0);

  const keyMessageMatch = output.match(/❌ \[BUILD GUARD FAILURE\][^\n]+(\n[^\n]+)?/);
  const keyMessage = keyMessageMatch ? keyMessageMatch[0].trim() : 'Build executed / regular error';

  results.push({
    testName,
    exitCode,
    expectedOutcome,
    passed,
    keyMessage,
  });

  console.log(`Exit Code: ${exitCode}`);
  console.log(`Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Guard Message: ${keyMessage}\n`);
}

try {
  // Test Case 1: ไม่มี env (Empty env vars)
  runBuildTest(
    'Test 1: ไม่มี env (Empty / Missing Variables)',
    {
      VITE_SUPABASE_URL: '',
      SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      SUPABASE_ANON_KEY: '',
      BUILD_TARGET: '',
      CF_PAGES_BRANCH: '',
    },
    'FAIL'
  );

  // Test Case 2: ลืม BUILD_TARGET แต่ใช้ Production URL
  runBuildTest(
    'Test 2: ลืม BUILD_TARGET + ใช้ Production URL',
    {
      VITE_SUPABASE_URL: 'https://aatlledgsftkjfunqsvh.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb-prod-anon-key-mock',
      BUILD_TARGET: '',
      CF_PAGES_BRANCH: '',
    },
    'FAIL'
  );

  // Test Case 3: staging/sandbox URL ที่ถูกต้อง
  runBuildTest(
    'Test 3: Staging / Sandbox URL ที่ถูกต้อง',
    {
      VITE_SUPABASE_URL: 'https://tsri-sandbox-demo.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb-sandbox-anon-key-mock-1234567890',
      BUILD_TARGET: 'staging',
      CF_PAGES_BRANCH: 'staging',
    },
    'SUCCESS'
  );
} finally {
  // Restore .env
  if (envBackup !== null) {
    if (fs.existsSync('.env.temp_guard_test')) {
      fs.renameSync('.env.temp_guard_test', '.env');
    }
  }
}

console.log('===============================================================');
console.log('FINAL BUILD GUARD TEST SUMMARY');
console.log('===============================================================');
console.table(results);
