import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaTicketAlt } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`, { signal: controller.signal });
                setEvent(data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    console.error(err);
                    setError('Failed to load pass details.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchEvent();
        return () => controller.abort();
    }, [id, reloadKey]);

    const handleResendOTP = async () => {
        setBookingLoading(true);
        setError('');
        try {
            await api.post('/bookings/send-otp');
            setSuccessMsg('A new OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('Verification OTP sent to your registered email.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp: otp.trim() });
                setSuccessMsg('Pass booking requested successfully! Awaiting admin confirmation.');
                setShowOTP(false);
                setOtp('');
            }
        } catch (err) {
            setError(typeof err.response?.data?.message === 'string' ? err.response.data.message : 'Pass booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-700">Loading Garba Pass details...</div>;
    if (error && !event) {
        return (
            <div role="alert" className="mx-auto max-w-lg py-12 text-center text-red-600">
                <p className="text-lg font-semibold">{error}</p>
                <button
                    type="button"
                    onClick={() => {
                        setLoading(true);
                        setReloadKey(current => current + 1);
                    }}
                    className="mt-4 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mt-3 sm:mt-6 border border-amber-100">
            {event.image ? (
                <div className="relative h-80 md:h-96 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                        <span className="bg-amber-500 text-gray-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                            {event.category}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-64 bg-gradient-to-r from-purple-950 via-red-950 to-amber-950 flex items-center justify-center text-amber-400 text-4xl font-black uppercase tracking-widest">
                    {event.category}
                </div>
            )}

            <div className="p-4 sm:p-8 md:p-12">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-8">
                    <div className="flex-1">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">The Rangilo Garba Mahotsav</span>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">{event.title}</h1>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">{event.description}</p>
                    </div>

                    <div className="bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-4 sm:p-6 md:p-8 rounded-2xl border border-amber-200/80 min-w-0 w-full lg:w-auto shrink-0 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 border-b border-amber-200/60 pb-3">
                            <FaTicketAlt className="text-amber-600" /> Pass Summary
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                    <FaMoneyBillWave />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Pass Price</p>
                                    <p className="font-extrabold text-gray-900 text-xl">{event.ticketPrice === 0 ? <span className="text-green-600">Free Entry</span> : `₹${event.ticketPrice}`}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                    <FaChair />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Pass Availability</p>
                                    <p className="font-bold text-gray-900">
                                        <span className={event.availableSeats < 10 ? 'text-red-500 font-extrabold' : 'text-gray-900'}>{event.availableSeats}</span> / {event.totalSeats} passes left
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Event Date</p>
                                    <p className="font-bold text-gray-900">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Location / Venue</p>
                                    <p className="font-bold text-gray-900 text-sm">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {showOTP && (
                            <div className="mb-4">
                                <label htmlFor="booking-otp" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Enter OTP to Confirm Booking</label>
                                <input
                                    id="booking-otp"
                                    name="otp"
                                    type="text"
                                    required
                                    placeholder="6-digit code"
                                    className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 transition shadow-sm font-black tracking-widest text-center text-xl text-gray-900 bg-white"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                            className={`w-full py-4 px-6 rounded-xl font-extrabold text-base transition shadow-lg ${isSoldOut || (successMsg && !showOTP)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white hover:shadow-amber-500/30 hover:-translate-y-0.5'
                                }`}
                        >
                            {bookingLoading ? 'Processing...' : (showOTP ? 'Verify OTP & Confirm Booking' : (successMsg && !showOTP ? 'Request Submitted' : (isSoldOut ? 'Sold Out' : 'Book Pass Now')))}
                        </button>
                        {showOTP && (
                            <div className="flex justify-between items-center mt-3 px-1 text-xs">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={bookingLoading}
                                    className="text-amber-700 hover:underline font-bold"
                                >
                                    Resend OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowOTP(false); setOtp(''); setError(''); }}
                                    className="text-gray-500 hover:underline font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {error && <p className="text-red-600 mt-4 text-center font-semibold text-xs bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                        {successMsg && <p className="text-green-700 mt-4 text-center font-semibold text-xs bg-green-50 p-3 rounded-xl border border-green-100">{successMsg}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;