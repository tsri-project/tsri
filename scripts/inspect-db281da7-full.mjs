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

async function inspectFull() {
  const indexPage = await fetchUrl('https://db281da7.tsri.pages.dev');
  console.log('Full HTML:');
  console.log(indexPage.data);
}

inspectFull();
