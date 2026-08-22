const emailjs = require('@emailjs/nodejs');

async function testEmailJS() {
    try {
        const res = await emailjs.send(
            'service_xw04039',
            'template_1a2mg5b',
            {
                to_email: 'gcgroup207@gmail.com',
                subject: 'Test Subject SDK',
                message: 'Test Message SDK'
            },
            {
                publicKey: 'nFU5O8zDzgJ_ZPhBi',
                privateKey: 'el7jh12qgOELviLH6ViOQ'
            }
        );
        console.log('Status SDK:', res.status);
        console.log('Response SDK:', res.text);
    } catch (e) {
        console.error('SDK Error:', e);
    }
}

testEmailJS();
