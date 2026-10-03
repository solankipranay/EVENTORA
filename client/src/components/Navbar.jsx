import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMusic, FaTicketAlt, FaUserShield, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="site-navbar bg-gradient-to-r from-purple-950 via-red-950 to-amber-950 shadow-2xl border-b border-amber-500/20">
            <div className="container mx-auto px-4">
                <div className="nav-content flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <Link to="/" aria-label="The Rangilo Garba Mahotsav home" className="text-white text-2xl font-black flex items-center gap-3 tracking-wide group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-105 transition duration-300">
                            <FaMusic className="text-lg animate-pulse" />
                        </div>
                        <div className="brand-copy">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-red-400 font-extrabold text-2xl">The Rangilo</span>
                            <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-400/80 -mt-1">Garba Mahotsav</span>
                        </div>
                    </Link>
                    <div className="nav-links flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
                        <Link to="/" aria-label="Passes and schedule" title="Passes and schedule" className="text-amber-100/90 hover:text-amber-300 transition flex items-center gap-1.5 py-1">
                            <FaTicketAlt className="text-amber-400" /> <span className="nav-label">Passes & Schedule</span>
                        </Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} aria-label={user.role === 'admin' ? 'Admin portal' : 'My passes'} title={user.role === 'admin' ? 'Admin portal' : 'My passes'} className="text-amber-100/90 hover:text-amber-300 transition flex items-center gap-1.5 py-1">
                                    <FaUserShield className="text-amber-400" /> <span className="nav-label">{user.role === 'admin' ? 'Admin Portal' : 'My Passes'}</span>
                                </Link>
                                <button onClick={handleLogout} aria-label="Log out" title="Log out" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/40 transition flex items-center gap-2">
                                    <FaSignOutAlt /> <span className="nav-label">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" aria-label="Log in" title="Log in" className="text-amber-100/90 hover:text-amber-300 transition flex items-center gap-1.5">
                                    <FaSignInAlt /> <span className="nav-label">Login</span>
                                </Link>
                                <Link to="/register" aria-label="Sign up" title="Sign up" className="bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-gray-950 px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
                                    <FaUserPlus /> <span className="nav-label">Sign Up</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;