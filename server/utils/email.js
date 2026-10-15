const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: `Garba Pass Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your pass booking for <strong>${eventTitle}</strong> at <strong>The Rangilo Garba Mahotsav</strong> is successfully confirmed!</p>
        <p>Thank you for booking with us. See you at the Garba Arena!</p>
      `
        });
        return true;
    } catch (error) {
        console.error('Booking confirmation email delivery failed:', error);
        return false;
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your The Rangilo Account' : 'The Rangilo Garba Pass Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP code to verify your new account at The Rangilo Garba Mahotsav.'
            : 'Please use the following OTP code to verify and confirm your Garba pass booking.';

        await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: title,
            html: `
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
    } catch (error) {
        console.error('Verification email delivery failed:', error);
        throw new Error('Unable to send verification email');
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };