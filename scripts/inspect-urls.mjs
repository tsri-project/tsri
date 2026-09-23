import https from 'https';

const urls = [
  'https://staging.tsri.pages.dev',
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
          contentSnippet: data.slice(0, 300).replace(/\n/g, ' '),
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
  console.log('=== CHECKING PREVIEW & STAGING URLS (READ-ONLY) ===\n');
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`URL: ${res.url}`);
    if (res.error) {
      console.log(`Error: ${res.error}\n`);
    } else {
      console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`Content-Type: ${res.contentType}`);
      console.log(`Snippet: ${res.contentSnippet}\n`);
    }
  }
}

main();
