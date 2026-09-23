import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function inspectManifest() {
  const manifest = await fetchUrl('https://db281da7.tsri.pages.dev/assets/manifest-8ba553ff.js');
  console.log('Manifest JS:');
  console.log(manifest.data.slice(0, 1000));

  // Find all /assets/*.js files mentioned in manifest
  const matches = [...manifest.data.matchAll(/\/assets\/[a-zA-Z0-9_-]+\.js/g)].map(m => m[0]);
  const uniqueFiles = [...new Set(matches)];
  console.log('\nUnique bundle files in db281da7:', uniqueFiles);

  for (const f of uniqueFiles) {
    const js = await fetchUrl(`https://db281da7.tsri.pages.dev${f}`);
    if (js.data.includes('aatlledgsftkjfunqsvh.supabase.co')) {
      console.log(`⚠️ ${f} CONTAINS PRODUCTION DB: aatlledgsftkjfunqsvh.supabase.co`);
    }
  }
}

inspectManifest();
