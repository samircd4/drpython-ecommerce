import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUserPlus, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

import CopyableText from '../components/CopyableText';

const API_URL = import.meta.env.VITE_API_URL;

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard');
            return;
        }

        if (!location.state) {
            toast.error("No order details found.");
            navigate('/');
            return;
        }

        if (location.state) {
            if (location.state.email) setEmail(location.state.email);
            if (location.state.name) setName(location.state.name);
            if (location.state.phone) setPhone(location.state.phone);
        }
    }, [location.state, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register/`, {
                full_name: name,
                email,
                phone_number: phone,
                password,
                link_order_id: location.state?.newOrder?.id // Pass order ID to link order
            });

            toast.success("Account created successfully! Please log in.");
            setIsRegistered(true);
            // Optionally auto-login here if the backend supports it, 
            // otherwise guide them to login page or just show success state.
        } catch (error) {
            console.error("Registration error:", error);
            const msg = error.response?.data?.message ||
                error.response?.data?.detail ||
                JSON.stringify(error.response?.data) ||
                "Registration failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <FaCheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Order Placed Successfully!
                    </h2>
                    {location.state?.newOrder?.id && (
                        <div className="mt-2 text-xl font-medium text-gray-700 flex items-center gap-2">
                            Order ID: <CopyableText value={location.state.newOrder.id.toString()} />
                        </div>
                    )}
                </div>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. A confirmation email has been sent to <span className="font-semibold">{email || 'your email'}</span>.
                </p>

                {!isRegistered ? (
                    <div className="bg-purple-50 rounded-lg p-6 max-w-md mx-auto border border-purple-100">
                        <div className="flex items-center justify-center mb-4">
                            <FaUserPlus className="text-purple-600 text-xl mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Create an Account</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Save your details for future orders and track this shipment easily.
                        </p>

                        <form onSubmit={handleRegister} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Create Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Re-enter password"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium disabled:opacity-70"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto border border-green-100">
                        <h3 className="text-lg font-bold text-green-800 mb-2">Account Created!</h3>
                        <p className="text-sm text-green-700 mb-4">
                            You can now log in to view your order history and manage your profile.
                        </p>
                        <Link
                            to="/account"
                            className="inline-block bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link to="/products" className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium">
                        Continue Shopping <FaArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
