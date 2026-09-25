import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching Garba passes', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate, fetchBookings]);

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this pass request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling pass request');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-700">Loading your Garba passes...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-950 via-red-950 to-amber-950 text-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8 border border-amber-500/20 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-red-500 text-gray-950 rounded-2xl flex items-center justify-center text-3xl font-black uppercase tracking-widest shrink-0 shadow-lg shadow-amber-500/30">
                    {user?.name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Welcome, {user?.name}!</h1>
                    <p className="text-amber-200/90 flex items-center justify-center sm:justify-start gap-2 text-sm font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span> The Rangilo Garba Visitor Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3">
                    <FaTicketAlt className="text-amber-600" /> My Garba & Food Passes ({bookings.length})
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-amber-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTicketAlt className="text-amber-400 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-600 mb-6 mt-4 font-bold">You haven't requested any Garba or Food passes yet.</p>
                    <Link to="/" className="inline-block bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black py-3.5 px-8 rounded-xl transition shadow-lg shadow-amber-500/20">
                        Browse Passes & Event Schedule
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-amber-100 flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex-grow">
                                {booking.eventId ? (
                                    <>
                                        <div className="flex justify-between items-start mb-4 gap-2">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 mb-1 inline-block">
                                                    {booking.eventId.category}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 leading-snug">{booking.eventId.title}</h3>
                                            </div>
                                            <div className="flex flex-col gap-1 items-end shrink-0">
                                                <span className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                {booking.status !== 'cancelled' && (
                                                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {booking.paymentStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-4 space-y-1.5 font-medium bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                                            <p><strong className="text-gray-900">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                                            <p><strong className="text-gray-900">Pass Price:</strong> {booking.amount === 0 ? 'Free Entry' : `₹${booking.amount}`}</p>
                                            <p><strong className="text-gray-900">Requested On:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500 italic text-sm">Pass details unavailable (may have been removed by organizer)</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0 border-t border-gray-100">
                                {booking.eventId && booking.status !== 'cancelled' ? (
                                    <>
                                        <Link to={`/events/${booking.eventId._id}`} className="text-amber-700 font-bold text-xs hover:underline">View Pass</Link>
                                        <button
                                            onClick={() => cancelBooking(booking._id)}
                                            className="text-red-500 font-bold text-xs hover:text-red-700 transition flex items-center gap-1"
                                        >
                                            <FaTimesCircle /> Cancel Pass
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center text-xs text-gray-400 font-bold italic">Pass Request Cancelled</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;