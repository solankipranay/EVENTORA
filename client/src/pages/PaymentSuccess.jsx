import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500 transform transition-all hover:-translate-y-1">
                <FaCheckCircle className="text-amber-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Check Your Pass Status</h1>
                <p className="text-gray-500 mb-8 text-lg">This page does not verify a payment or confirm a booking. Check your dashboard for the current status of your pass request.</p>
                <div className="space-y-4">
                    <Link to="/dashboard" className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl">
                        View My Tickets
                    </Link>
                    <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition">
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;