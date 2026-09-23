import https from 'https';

const candidateUrls = [
  'https://staging.tsri.pages.dev',
  'https://main.tsri.pages.dev',
  'https://8afc8d4.tsri.pages.dev',
  'https://0aecd7b.tsri.pages.dev',
  'https://8afc8d40.tsri.pages.dev',
  'https://0aecd7b0.tsri.pages.dev',
  'https://tsri.pages.dev',
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          contentType: res.headers['content-type'],
          bodySnippet: data.slice(0, 160).replace(/\s+/g, ' ').trim(),
        });
      });
    }).on('error', (err) => {
      resolve({
        url,
        error: err.message,
      });
    });
  });
}

async function main() {
  console.log('=== INSPECTING ALL CANDIDATE PREVIEW / DEPLOYMENT URLS (READ-ONLY) ===\n');
  for (const url of candidateUrls) {
    const res = await checkUrl(url);
    if (res.error) {
      console.log(`[FAIL] ${url} -> ${res.error}`);
    } else {
      console.log(`[${res.statusCode} ${res.statusMessage}] ${url}`);
      console.log(`       Content: ${res.bodySnippet}`);
    }
  }
}

main();
