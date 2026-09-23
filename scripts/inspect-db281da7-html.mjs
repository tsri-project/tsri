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

async function inspectHtml() {
  const indexPage = await fetchUrl('https://db281da7.tsri.pages.dev');
  console.log('HTML Snippet (first 1000 chars):');
  console.log(indexPage.data.slice(0, 1000));

  const allScripts = [...indexPage.data.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  console.log('\nAll src attributes:', allScripts);

  for (const s of allScripts) {
    const fullUrl = s.startsWith('http') ? s : `https://db281da7.tsri.pages.dev${s}`;
    const file = await fetchUrl(fullUrl);
    console.log(`Checking ${s} (${file.data.length} bytes):`);
    if (file.data.includes('aatlledgsftkjfunqsvh.supabase.co')) {
      console.log(`⚠️ EMBEDDED HOST: aatlledgsftkjfunqsvh.supabase.co (Production DB)`);
    }
  }
}

inspectHtml();
