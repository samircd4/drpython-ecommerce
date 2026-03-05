import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/client';
import { getErrorMessage } from '../utils/errorUtils';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/auth/forgot-password/`, { email });
            setSubmitted(true);
            toast.success("Reset link sent! Check your email.");
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 404)) {
                toast.error("This email is not associated with any account.");
            } else {
                toast.error(getErrorMessage(error, "Failed to send reset link. Please try again."));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#f8fafc] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[100px] opacity-60"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[100px] opacity-60"
                />
            </div>

            <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-12 relative z-10 border border-white">
                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-extrabold text-gray-900 tracking-tight"
                    >
                        Forgot Password?
                    </motion.h2>
                    <p className="mt-4 text-gray-500 font-medium">
                        {submitted
                            ? "Check your email for instructions to reset your password."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.form
                            key="form-forgot"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-900/10 hover:shadow-purple-900/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 mb-8">
                                We have sent a password reset link to <span className="font-bold text-gray-800">{email}</span>.
                                Please check your inbox (and spam folder).
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-purple-600 font-bold hover:underline mb-4 block w-full"
                            >
                                Try another email
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center">
                    <Link to="/account" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
