const fetch = require('node-fetch'); // or use native fetch if Node 18+

async function testEmailJS() {
    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: 'service_xw04039',
                template_id: 'template_1a2mg5b',
                user_id: 'nFU5O8zDzgJ_ZPhBi',
                accessToken: 'el7jh12qgOELviLH6ViOQ',
                template_params: {
                    to_email: 'gcgroup207@gmail.com',
                    subject: 'Test Subject',
                    message: 'Test Message'
                }
            })
        });
        
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

testEmailJS();
