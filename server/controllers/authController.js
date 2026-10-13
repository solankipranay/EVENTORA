const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        email = email.trim().toLowerCase();
        let user = await User.findOne({ email });

        if (user) {
            if (!user.isVerified) {
                // User already registered but not yet verified, send a fresh OTP
                const otp = generateOTP();
                await OTP.deleteMany({ email, action: 'account_verification' });
                await OTP.create({ email, otp, action: 'account_verification' });
                await sendOTPEmail(email, otp, 'account_verification');
                return res.status(200).json({
                    message: 'Account not yet verified. A new OTP has been sent to your email.',
                    email: user.email,
                    needsVerification: true
                });
            }
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name: name.trim(),
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent privilege escalation
            isVerified: false
        });

        const otp = generateOTP();
        await OTP.deleteMany({ email, action: 'account_verification' });
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(error.message === 'Unable to send verification email' ? 503 : 500).json({
            message: error.message === 'Unable to send verification email'
                ? 'Unable to send verification email. Please try again.'
                : 'Server Error'
        });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = email.trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.deleteMany({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(error.message === 'Unable to send verification email' ? 503 : 500).json({
            message: error.message === 'Unable to send verification email'
                ? 'Unable to send verification email. Please try again.'
                : 'Server Error'
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        email = email.trim().toLowerCase();
        otp = otp.trim();
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User account not found' });
        }
        await OTP.deleteMany({ email, action: 'account_verification' }); // Delete all OTPs for this action

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error('OTP verification failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        email = email.trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified' });

        const otp = generateOTP();
        await OTP.deleteMany({ email, action: 'account_verification' });
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.json({ message: 'New verification OTP sent to your email.' });
    } catch (error) {
        console.error('OTP resend failed:', error);
        res.status(error.message === 'Unable to send verification email' ? 503 : 500).json({
            message: error.message === 'Unable to send verification email'
                ? 'Unable to send verification email. Please try again.'
                : 'Server Error'
        });
    }
};