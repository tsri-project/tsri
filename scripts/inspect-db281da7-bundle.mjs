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

async function inspectDb281da7() {
  console.log('=== INSPECTING db281da7.tsri.pages.dev (READ-ONLY) ===\n');
  const indexPage = await fetchUrl('https://db281da7.tsri.pages.dev');
  console.log(`Index status: ${indexPage.status}`);
  
  // Find script tags
  const scriptRegex = /src="(\/assets\/[^"]+\.js)"/g;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(indexPage.data)) !== null) {
    scripts.push(match[1]);
  }

  console.log('Found scripts:', scripts);

  for (const s of scripts) {
    const jsUrl = `https://db281da7.tsri.pages.dev${s}`;
    const jsContent = await fetchUrl(jsUrl);
    console.log(`\nInspecting ${s} (${jsContent.data.length} bytes)...`);
    if (jsContent.data.includes('aatlledgsftkjfunqsvh.supabase.co')) {
      console.log(`⚠️ CONTAINS PRODUCTION SUPABASE DB: aatlledgsftkjfunqsvh.supabase.co`);
    }
    if (jsContent.data.includes('staging') || jsContent.data.includes('sandbox')) {
      console.log(`Contains staging/sandbox references.`);
    }
  }
}

inspectDb281da7();
