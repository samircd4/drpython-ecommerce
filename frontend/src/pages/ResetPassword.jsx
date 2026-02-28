import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { BASE_URL } from '../api/client';
import { getErrorMessage } from '../utils/errorUtils';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/auth/reset-password/`, {
                uidb64: uid,
                token: token,
                new_password: password
            });
            toast.success("Password reset successfully! Please login.");
            navigate('/account');
        } catch (error) {
            toast.error(getErrorMessage(error, "Invalid or expired link."));
        } finally {
            setLoading(false);
        }
    };

    if (!uid || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
                    <p className="text-gray-600 mb-6">This password reset link is invalid or missing parameters.</p>
                    <button onClick={() => navigate('/account')} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#f8fafc] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
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
            </div>

            <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-12 relative z-10 border border-white">
                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-extrabold text-gray-900 tracking-tight"
                    >
                        Set New Password
                    </motion.h2>
                    <p className="mt-4 text-gray-500 font-medium">
                        Create a strong password for your account.
                    </p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                            placeholder="New Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                            placeholder="Confirm Password"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-900/10 hover:shadow-purple-900/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? 'Resetting...' : (
                            <>
                                Reset Password
                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </motion.form>
            </div>
        </div>
    );
};

export default ResetPassword;
