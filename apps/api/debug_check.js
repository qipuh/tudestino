
import http from 'http';

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/events/search?limit=1',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Body:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
