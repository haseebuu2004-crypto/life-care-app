const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login Response Status:', res.statusCode);
    
    if (res.statusCode !== 200) {
      console.log('Login failed:', data);
      process.exit(1);
    }
    
    const cookies = res.headers['set-cookie'];
    if (!cookies) {
      console.log('Failed to get cookie. Exiting.');
      process.exit(1);
    }
    
    const cookie = cookies[0].split(';')[0];
    
    // Test Dashboard
    const dashOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const dashReq = http.request(dashOptions, dashRes => {
      let dashData = '';
      dashRes.on('data', chunk => dashData += chunk);
      dashRes.on('end', () => {
        console.log('Dashboard Response Status:', dashRes.statusCode);
        if (dashRes.statusCode === 200) {
            console.log('Sanity Test PASS');
            process.exit(0);
        } else {
            console.log('Sanity Test FAIL', dashData);
            process.exit(1);
        }
      });
    });
    dashReq.on('error', e => console.error(e));
    dashReq.end();
  });
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ email: 'hasieeyy4444@gmail.com', password: 'admin' })); // if the password is admin, actually the user said 'user123' or 'admin123' or real password.
req.end();
