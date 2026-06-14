const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'gcgroup207@gmail.com',
        pass: 'ldca tnzi zteh cyyt'
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
