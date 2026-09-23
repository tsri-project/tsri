import https from 'https';

const urlsToCheck = [
  'https://db281da7.tsri.pages.dev',
  'https://db281da7.tsri.pages.dev/assets/use-auth-BTSEgw1_.js',
  'https://staging.tsri.pages.dev',
  'https://staging.tsri.pages.dev/assets/app-CN30G0vx.css',
  'https://5d45b6ba.tsri.pages.dev',
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
          snippet: data.slice(0, 160).replace(/\s+/g, ' ').trim(),
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
  console.log('================================================================');
  console.log('VERIFICATION: OLD DEPLOYMENT & STAGING ACCESS CHECK (READ-ONLY)');
  console.log('================================================================\n');

  for (const url of urlsToCheck) {
    const res = await checkUrl(url);
    if (res.error) {
      console.log(`[FAIL] ${url} -> ${res.error}`);
    } else {
      console.log(`[${res.statusCode} ${res.statusMessage}] ${url}`);
      console.log(`       Type: ${res.contentType}`);
      console.log(`       Snippet: ${res.snippet}\n`);
    }
  }
}

main();
