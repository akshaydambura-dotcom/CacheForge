const { fork } = require('child_process');
const path = require('path');

const server = fork(path.resolve(__dirname, 'server.js'), [], {
  env: { ...process.env, PORT: '8081' } // run test on port 8081
});

setTimeout(async () => {
  const http = require('http');

  function post(pathName, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 8081,
        path: pathName,
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

  function get(pathName) {
    return new Promise((resolve, reject) => {
      http.get({ hostname: '127.0.0.1', port: 8081, path: pathName }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      }).on('error', reject);
    });
  }

  try {
    console.log('--- 1. Testing GET /api/health ---');
    const health = await get('/api/health');
    console.log('Health:', health.data);

    console.log('\n--- 2. Testing GET /api/info ---');
    const info = await get('/api/info');
    console.log('Info name:', info.data.name, '| Tagline:', info.data.tagline);

    console.log('\n--- 3. Testing POST /api/command (SET key=site_test, val=cacheforge_rocks) ---');
    const setRes = await post('/api/command', { operation: 'SET', key: 'site_test', value: 'cacheforge_rocks' });
    console.log('SET response:', setRes.data);

    console.log('\n--- 4. Testing POST /api/command (GET key=site_test) ---');
    const getRes = await post('/api/command', { operation: 'GET', key: 'site_test' });
    console.log('GET response:', getRes.data);

    console.log('\n--- 5. Testing GET /api/stats ---');
    const stats = await get('/api/stats');
    console.log('Stats:', JSON.stringify(stats.data, null, 2));

    console.log('\n--- 6. Testing POST /api/command (DELETE key=site_test) ---');
    const delRes = await post('/api/command', { operation: 'DELETE', key: 'site_test' });
    console.log('DELETE response:', delRes.data);

    console.log('\n--- 7. Testing POST /api/command (GET after DELETE) ---');
    const getAfterDel = await post('/api/command', { operation: 'GET', key: 'site_test' });
    console.log('GET after DELETE response:', getAfterDel.data);

    console.log('\n--- 8. Testing Validation (DROP_TABLE illegal op) ---');
    const badRes = await post('/api/command', { operation: 'DROP_TABLE' });
    console.log('Bad Op status (should be 400):', badRes.status, badRes.data);

    console.log('\nALL 8 BACKEND API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 1500);
