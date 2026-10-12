const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
// Send verification code email
async function sendVerificationCode(email, code) {
    return transporter.sendMail({
        from: {
            name: 'MigrantHub',
            address: process.env.EMAIL_FROM
        },
        to: email,
        subject: 'Your MigrantHub verification code',
        text: `Your MigrantHub verification code is ${code}. It expires in 10 minutes.`,
        html: `
            <h2>MigrantHub verification</h2>
            <p>Your verification code is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
                ${code}
            </p>
            <p>This code expires in 10 minutes.</p>
        `
    });
}
// Send password reset code email
async function sendPasswordResetCode(email, code) {
    return transporter.sendMail({
        from: {
            name: 'MigrantHub',
            address: process.env.EMAIL_FROM
        },
        to: email,
        subject: 'Reset your MigrantHub password',
        text: `Your MigrantHub password reset code is ${code}. It expires in 10 minutes.`,
        html: `
            <h2>Reset your MigrantHub password</h2>
            <p>Your password reset code is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
                ${code}
            </p>
            <p>This code expires in 10 minutes.</p>
        `
    });
}

// Export the transporter and email functions
module.exports = {
    transporter,
    sendVerificationCode,
    sendPasswordResetCode
};
