import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaMusic } from 'react-icons/fa';
import api from '../utils/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/resend-otp', { email: email.trim() });
            alert('A fresh OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email.trim(), password);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                const data = await verifyOTP(email.trim(), otp.trim());
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(typeof err === 'string' ? err : (err?.message || 'Login failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-6 sm:mt-12 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-amber-100">
            <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-lg shadow-amber-500/30">
                    <FaMusic />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-gray-500 text-sm font-medium">Sign in to your The Rangilo Garba account</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-center text-xs font-semibold shadow-inner border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                {!showOTP ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-sm font-medium text-gray-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-sm font-medium text-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Verification Code (OTP)</label>
                        <input
                            type="text"
                            required
                            placeholder="6-digit code"
                            className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 transition shadow-sm font-black tracking-widest text-center text-xl text-gray-900 bg-amber-50/50"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                        />
                        <div className="flex justify-between items-center mt-3 text-xs">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-amber-700 font-bold hover:underline"
                            >
                                Resend OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowOTP(false); setOtp(''); setError(''); }}
                                className="text-gray-500 font-medium hover:underline"
                            >
                                ← Back to Password
                            </button>
                        </div>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
                </button>
            </form>

            <p className="text-center mt-8 text-xs text-gray-600 font-medium">
                Don't have an account? <Link to="/register" className="text-amber-700 font-bold hover:underline">Sign up for Passes</Link>
            </p>
        </div>
    );
};

export default Login;