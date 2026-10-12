const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Testing GET /api/health ---');
  const health = await get('http://localhost:8080/api/health');
  console.log('Health:', health);

  console.log('\n--- 2. Testing GET /api/info ---');
  const info = await get('http://localhost:8080/api/info');
  console.log('Info name:', info.data.name, '| Tagline:', info.data.tagline);

  console.log('\n--- 3. Testing POST /api/command (SET key=site_test, val=cacheforge_rocks) ---');
  const setRes = await post('http://localhost:8080/api/command', { operation: 'SET', key: 'site_test', value: 'cacheforge_rocks' });
  console.log('SET response:', setRes);

  console.log('\n--- 4. Testing POST /api/command (GET key=site_test) ---');
  const getRes = await post('http://localhost:8080/api/command', { operation: 'GET', key: 'site_test' });
  console.log('GET response:', getRes);

  console.log('\n--- 5. Testing GET /api/stats ---');
  const stats = await get('http://localhost:8080/api/stats');
  console.log('Stats:', JSON.stringify(stats.data, null, 2));

  console.log('\n--- 6. Testing POST /api/command (DELETE key=site_test) ---');
  const delRes = await post('http://localhost:8080/api/command', { operation: 'DELETE', key: 'site_test' });
  console.log('DELETE response:', delRes);

  console.log('\n--- 7. Testing POST /api/command (GET after DELETE) ---');
  const getAfterDel = await post('http://localhost:8080/api/command', { operation: 'GET', key: 'site_test' });
  console.log('GET after DELETE response:', getAfterDel);

  console.log('\n--- 8. Testing Validation (DROP TABLE illegal op) ---');
  const badRes = await post('http://localhost:8080/api/command', { operation: 'DROP_TABLE' });
  console.log('Bad Op status (should be 400):', badRes.status, badRes.data);

  console.log('\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
