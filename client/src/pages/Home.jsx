import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaTicketAlt, FaUtensils, FaMusic, FaFilter } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const query = search.trim();
        const timeoutId = setTimeout(async () => {
            setLoading(true);
            setLoadError('');
            try {
                const { data } = await api.get('/events', {
                    params: {
                        page,
                        limit: 24,
                        ...(query ? { search: query } : {}),
                        ...(selectedCategory !== 'All' ? { category: selectedCategory } : {})
                    },
                    signal: controller.signal
                });
                setEvents(current => page === 1 ? data.items : [...current, ...data.items]);
                setHasMore(data.page < data.totalPages);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Error fetching Garba passes:', error);
                    setLoadError('Passes could not be loaded. Check your connection and try again.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, query ? 250 : 0);
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [search, selectedCategory, page, reloadKey]);

    const categories = ['All', 'Entry Pass', 'Food Pass', 'Event Schedule'];

    const filteredEvents = events;

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-purple-950 via-red-950 to-amber-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-12 shadow-2xl border border-amber-500/20">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=70&w=1600&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="relative p-4 sm:p-8 md:p-16 text-center flex flex-col items-center z-10">
                    <span className="bg-amber-500/20 text-amber-300 backdrop-blur-md px-3 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase mb-5 sm:mb-6 border border-amber-400/30 flex items-center gap-2 shadow-lg">
                        <FaMusic className="text-amber-400" /> Grand Navratri Festival 2026
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">The Rangilo</span> Garba Mahotsav
                    </h1>
                    <p className="text-amber-100/90 text-sm sm:text-base md:text-xl mb-6 sm:mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                        Immerse yourself in 9 nights of electrifying Garba & Dandiya Raas! Secure your <strong className="text-amber-300 font-semibold">Entry Passes</strong>, <strong className="text-amber-300 font-semibold">Food Passes</strong>, and explore the complete <strong className="text-amber-300 font-semibold">Event Schedule</strong> with celebrity performances.
                    </p>

                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-4 sm:left-6 text-amber-600 text-lg sm:text-xl group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Garba passes, food thalis, star nights..."
                            className="w-full pl-11 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-5 rounded-full text-sm sm:text-lg text-gray-900 bg-white/95 backdrop-blur-md border-2 border-amber-400/50 focus:border-amber-500 focus:outline-none transition-all placeholder-gray-400 font-medium shadow-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12 px-1 sm:px-2">
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Garba Entry Passes</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Book VIP Season Passes, Single Night Passes, Couple Passes, and Group Entry passes with instant verification.</p>
                </div>
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaUtensils />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Authentic Food Passes</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Pre-book Royal Kathiyawadi Unlimited Thalis, Farali Upvas Fasting Passes, and Food Court credit coupons.</p>
                </div>
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-red-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-500/30">
                        <FaMusic />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">9-Night Event Schedule</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Check daily singer lineups, Ganesh Sthapana Aarti, Costume competitions, and Dussehra Grand Finale schedules.</p>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2 border-b border-amber-100 pb-6">
                <div className="flex items-center gap-2">
                    <FaFilter className="text-amber-600" />
                    <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Explore Passes & Schedule</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setPage(1);
                            }}
                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-sm ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-amber-500/30'
                                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-amber-700">Loading passes & schedules...</div>
            ) : loadError ? (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
                    <p>{loadError}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1);
                            setReloadKey(current => current + 1);
                        }}
                        className="mt-2 rounded-lg bg-white px-4 py-2 font-bold text-red-700 shadow-sm hover:bg-red-100"
                    >
                        Try again
                    </button>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 text-xl text-gray-500">No passes or schedule found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {filteredEvents.map(event => (
                        <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-amber-100 hover:-translate-y-1">
                            <div className="h-52 bg-gray-200 overflow-hidden relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} loading="lazy" decoding="async" className="w-full h-full object-cover transform hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-900 to-red-900 text-amber-400 font-bold text-2xl">
                                        {event.category || 'Garba Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg text-amber-300 border border-amber-400/40">
                                    {event.ticketPrice === 0 ? <span className="text-green-400">FREE ENTRY</span> : <span>₹{event.ticketPrice}</span>}
                                </div>
                                <div className="absolute top-4 left-4 bg-amber-500 text-gray-950 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
                                    {event.category}
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{event.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                                <div className="flex flex-col gap-2 mb-6 text-gray-600 text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-amber-600" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-amber-600" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden border border-gray-100">
                                        <div className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(5, (event.availableSeats / event.totalSeats) * 100))}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4 font-medium">{event.availableSeats} passes available (Total: {event.totalSeats})</p>
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-amber-500/20">
                                        View Details & Book Pass
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !loadError && hasMore && (
                <button
                    type="button"
                    onClick={() => setPage(current => current + 1)}
                    className="mx-auto -mt-8 mb-12 block rounded-xl bg-amber-600 px-6 py-3 font-bold text-white shadow-md hover:bg-amber-700"
                >
                    Load more passes
                </button>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-12 pb-8 border-t border-amber-200/60 text-center bg-gradient-to-b from-transparent to-amber-50/50 rounded-2xl">
                <div className="flex justify-center items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        <FaMusic />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-wide">The Rangilo</span>
                </div>
                <p className="text-gray-600 text-sm mb-6 max-w-lg mx-auto font-light">
                    The Official Garba & Dandiya Mahotsav Platform. Booking Entry Passes, Royal Food Passes & Event Schedules for 9 Nights of Navratri.
                </p>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} The Rangilo Garba Mahotsav. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;