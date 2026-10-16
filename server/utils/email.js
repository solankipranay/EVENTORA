const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const fromEmail = process.env.EMAIL_FROM || 'solankipranay34@gmail.com';
const fromName = process.env.EMAIL_FROM_NAME || 'The Rangilo Garba Mahotsav';

const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('BREVO_API_KEY is not configured in environment variables');
        throw new Error('Email service is not configured');
    }

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: fromName,
                email: fromEmail
            },
            to,
            subject,
            htmlContent
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${response.status}: Failed to send email via Brevo`;
        console.error('Brevo API Error:', errorMsg);
        throw new Error(errorMsg);
    }

    return await response.json();
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        await sendBrevoEmail({
            to: [{ email: userEmail, name: userName || 'Valued Guest' }],
            subject: `Garba Pass Confirmed: ${eventTitle}`,
            htmlContent: `
                <h2>Hi ${userName || 'there'}!</h2>
                <p>Your pass booking for <strong>${eventTitle}</strong> at <strong>The Rangilo Garba Mahotsav</strong> is successfully confirmed!</p>
                <p>Thank you for booking with us. See you at the Garba Arena!</p>
            `
        });
        return true;
    } catch (error) {
        console.error('Booking confirmation email delivery failed:', error.message);
        return false;
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification'
            ? 'Verify your The Rangilo Account'
            : 'The Rangilo Garba Pass Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP code to verify your new account at The Rangilo Garba Mahotsav.'
            : 'Please use the following OTP code to verify and confirm your Garba pass booking.';

        await sendBrevoEmail({
            to: [{ email: userEmail }],
            subject: title,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #991b1b;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #fff7ed; color: #991b1b; border: 2px dashed #f97316; width: max-content; letter-spacing: 5px; border-radius: 8px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this code, please ignore this email.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error('Verification email delivery failed:', error.message);
        throw new Error('Unable to send verification email');
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };