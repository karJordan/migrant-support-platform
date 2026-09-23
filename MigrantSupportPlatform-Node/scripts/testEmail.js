require('dotenv').config();

const { sendVerificationCode } = require('../utils/mailer');

const recipient = process.argv[2];

if (!recipient) {
    console.error('Provide a recipient email address');
    process.exit(1);
}

sendVerificationCode(recipient, '123456')
    .then(() => {
        console.log('Test email sent successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to send test email:', error.message);
        process.exit(1);
    });