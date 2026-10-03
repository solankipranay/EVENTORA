import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [summary, setSummary] = useState({ totalRevenue: 0, confirmedPassHolders: 0, pendingRequests: 0 });
    const [eventsTotal, setEventsTotal] = useState(0);
    const [bookingsTotal, setBookingsTotal] = useState(0);
    const [eventsPage, setEventsPage] = useState(1);
    const [bookingsPage, setBookingsPage] = useState(1);
    const [eventsHaveMore, setEventsHaveMore] = useState(false);
    const [bookingsHaveMore, setBookingsHaveMore] = useState(false);
    const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
    const [loadingMoreBookings, setLoadingMoreBookings] = useState(false);

    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', location: '', category: 'Entry Pass', totalSeats: '', ticketPrice: '', image: ''
    });

    const fetchData = useCallback(async () => {
        try {
            const [eventsRes, bookingsRes, summaryRes] = await Promise.all([
                api.get('/events', { params: { page: 1, limit: 25 } }),
                api.get('/bookings/my', { params: { page: 1, limit: 25 } }),
                api.get('/bookings/summary')
            ]);
            setLoadError('');
            setEvents(eventsRes.data.items);
            setEventsTotal(eventsRes.data.total);
            setEventsHaveMore(eventsRes.data.page < eventsRes.data.totalPages);
            setEventsPage(eventsRes.data.page);
            setBookings(bookingsRes.data.items);
            setBookingsTotal(bookingsRes.data.total);
            setBookingsHaveMore(bookingsRes.data.page < bookingsRes.data.totalPages);
            setBookingsPage(bookingsRes.data.page);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
            setLoadError('Admin data could not be loaded. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMoreEvents = async () => {
        setLoadingMoreEvents(true);
        try {
            const nextPage = eventsPage + 1;
            const { data } = await api.get('/events', { params: { page: nextPage, limit: 25 } });
            setEvents(current => [...current, ...data.items]);
            setEventsPage(data.page);
            setEventsHaveMore(data.page < data.totalPages);
        } catch (error) {
            console.error('Error loading more events', error);
            setLoadError('More events could not be loaded. Please try again.');
        } finally {
            setLoadingMoreEvents(false);
        }
    };

    const loadMoreBookings = async () => {
        setLoadingMoreBookings(true);
        try {
            const nextPage = bookingsPage + 1;
            const { data } = await api.get('/bookings/my', { params: { page: nextPage, limit: 25 } });
            setBookings(current => [...current, ...data.items]);
            setBookingsPage(data.page);
            setBookingsHaveMore(data.page < data.totalPages);
        } catch (error) {
            console.error('Error loading more bookings', error);
            setLoadError('More booking requests could not be loaded. Please try again.');
        } finally {
            setLoadingMoreBookings(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, fetchData]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', {
                ...formData,
                totalSeats: Number(formData.totalSeats),
                ticketPrice: Number(formData.ticketPrice) || 0
            });
            setShowEventForm(false);
            setFormData({ title: '', description: '', date: '', location: '', category: 'Entry Pass', totalSeats: '', ticketPrice: '', image: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating pass/event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this Garba pass/schedule item?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting item');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            const { data } = await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            if (!data.notificationSent) {
                alert(data.message);
            }
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming pass');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm('Cancel this user\'s Garba pass request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling pass');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-700">Loading admin portal...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Top Admin Banner */}
            <div className="bg-gradient-to-r from-purple-950 via-red-950 to-amber-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <span className="text-amber-400 text-xs font-black uppercase tracking-widest block mb-1">Organizers Portal</span>
                    <h1 className="text-2xl sm:text-3xl font-black mb-2">The Rangilo Admin Dashboard</h1>
                    <p className="text-amber-200/80 text-sm font-medium">Manage Garba Entry Passes, Food Passes, 9-Night Event Schedules & Verify Bookings.</p>
                </div>
                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-gray-950 font-black py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                    {showEventForm ? 'Cancel Form' : '+ Create Pass / Schedule Item'}
                </button>
            </div>

            {loadError && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
                    <p>{loadError}</p>
                    <button type="button" onClick={fetchData} className="mt-2 rounded-lg bg-white px-4 py-2 font-bold text-red-700 shadow-sm hover:bg-red-100">
                        Try again
                    </button>
                </div>
            )}

            {/* Admin Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">Total Pass Revenue</p>
                        <h3 className="text-3xl font-black text-emerald-600">₹{summary.totalRevenue}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">₹</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">Confirmed Pass Holders</p>
                        <h3 className="text-3xl font-black text-indigo-600">{summary.confirmedPassHolders}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">👤</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">Pending Pass Requests</p>
                        <h3 className="text-3xl font-black text-amber-600">{summary.pendingRequests}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">⏳</div>
                </div>
            </div>

            {/* Form for Creating Entry Pass / Food Pass / Event Schedule */}
            {showEventForm && (
                <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md border border-amber-200 mb-8 animate-fadeIn">
                    <h2 className="text-2xl font-black mb-6 text-gray-900 border-b border-amber-100 pb-3 flex items-center gap-2">
                        <FaTicketAlt className="text-amber-600" /> Add New Garba Pass / Event Schedule Item
                    </h2>
                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Title (e.g. VIP All-Night Pass, Royal Food Thali Pass)</label>
                            <input required type="text" placeholder="Pass / Schedule Title" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Category</label>
                            <select required className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Entry Pass">Entry Pass (VIP, Single, Couple, Group)</option>
                                <option value="Food Pass">Food Pass (Thali, Farali, Stall Voucher)</option>
                                <option value="Event Schedule">Event Schedule (Night 1 to 9 Special Lineup)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Date</label>
                            <input required type="date" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Venue / Stall Location</label>
                            <input required type="text" placeholder="Location (e.g., Royal Palace Lawns, Food Pavilion)" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Total Pass Capacity / Seat Limit</label>
                            <input required type="number" placeholder="Total Pass Quantity" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Price in ₹ (0 for Free)</label>
                            <input required type="number" placeholder="Pass Price in ₹" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Image URL</label>
                            <input type="text" placeholder="Image URL (Unsplash or direct image link)" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pass / Event Description</label>
                            <textarea required placeholder="Detailed description of what's included in this pass or night schedule..." className="w-full border border-gray-200 px-4 py-3 rounded-xl h-28 focus:ring-2 focus:ring-amber-500 outline-none transition font-medium" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <button type="submit" className="md:col-span-2 bg-gradient-to-r from-amber-500 to-red-600 text-white font-black py-4 mt-2 rounded-xl hover:from-amber-600 hover:to-red-700 transition shadow-lg shadow-amber-500/20">
                            Publish Garba Pass / Schedule Item
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Garba Passes & Schedule List */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800 text-sm font-black">{eventsTotal}</span>
                        All Garba Passes & Schedules
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {events.length === 0 ? <li className="p-6 text-gray-500 text-center">No passes or schedule items created yet.</li> :
                                events.map(event => (
                                    <li key={event._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-amber-50/40 transition border-b border-gray-100 last:border-0">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 mb-1 inline-block">
                                                {event.category}
                                            </span>
                                            <h4 className="font-bold text-gray-900 mb-1 leading-tight">{event.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 font-semibold text-gray-700"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {new Date(event.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 font-semibold text-gray-700"><div className={`w-2 h-2 rounded-full ${event.availableSeats > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div> {event.availableSeats}/{event.totalSeats} passes left</span>
                                                <span className="font-bold text-amber-800">₹{event.ticketPrice}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(event._id)} className="w-full sm:w-auto text-red-600 hover:text-white hover:bg-red-600 border border-red-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm shrink-0">
                                            Delete
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    {eventsHaveMore && (
                        <button type="button" disabled={loadingMoreEvents} onClick={loadMoreEvents} className="mt-3 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-60">
                            {loadingMoreEvents ? 'Loading...' : 'Load more events'}
                        </button>
                    )}
                </div>

                {/* Pass Booking Requests Section */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 text-gray-950 text-sm font-black">{bookingsTotal}</span>
                        Pass Booking Requests
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {bookings.length === 0 ? <li className="p-6 text-gray-500 text-center">No pass requests yet.</li> :
                                bookings.map(booking => (
                                    <li key={booking._id} className={`p-6 hover:bg-amber-50/30 transition border-l-4 ${booking.status === 'pending' ? 'border-l-amber-500' : booking.status === 'confirmed' ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg leading-tight">{booking.eventId?.title || 'Deleted Item'}</h4>
                                                {booking.eventId?.category && <span className="text-[10px] font-black uppercase text-amber-700">{booking.eventId.category}</span>}
                                            </div>
                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{booking.status}</span>
                                                {booking.status !== 'cancelled' && <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-800'}`}>{booking.paymentStatus.replace('_', ' ')}</span>}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3.5 mb-3 border border-gray-100 text-xs font-medium">
                                            <p className="text-gray-700 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-gray-400 uppercase text-[10px]">User:</span>
                                                <span className="font-bold text-gray-900">{booking.userId?.name}</span>
                                                <span className="text-gray-400">({booking.userId?.email})</span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-gray-400 uppercase text-[10px]">Amount:</span>
                                                <span className={`font-extrabold ${booking.amount === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>{booking.amount === 0 ? 'Free Entry' : `₹${booking.amount}`}</span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2">
                                                <span className="font-bold w-16 text-gray-400 uppercase text-[10px]">Date:</span>
                                                <span>{new Date(booking.bookedAt).toLocaleString()}</span>
                                            </p>
                                            {booking.eventId ? (
                                                <p className="text-gray-700 flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/80">
                                                    <span className="font-bold w-16 text-gray-400 uppercase text-[10px]">Availability:</span>
                                                    <span className={`font-bold ${(booking.eventId.availableSeats || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{booking.eventId.availableSeats ?? 0}</span> passes remaining of {booking.eventId.totalSeats ?? 0}
                                                </p>
                                            ) : (
                                                <p className="text-red-500 italic text-[11px] mt-2 pt-2 border-t border-gray-200/80">Pass item has been deleted</p>
                                            )}
                                        </div>

                                        {/* Action buttons for admin */}
                                        {booking.status === 'pending' && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button onClick={() => handleConfirmBooking(booking._id, 'paid')} className="flex-1 min-w-[120px] bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm transition">
                                                    ✓ Approve as Paid Pass
                                                </button>
                                                <button onClick={() => handleConfirmBooking(booking._id, 'not_paid')} className="flex-1 min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm transition">
                                                    ✓ Approve Undecided
                                                </button>
                                                <button onClick={() => handleCancelBooking(booking._id)} className="w-[80px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-xl transition">
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    {bookingsHaveMore && (
                        <button type="button" disabled={loadingMoreBookings} onClick={loadMoreBookings} className="mt-3 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-60">
                            {loadingMoreBookings ? 'Loading...' : 'Load more bookings'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;