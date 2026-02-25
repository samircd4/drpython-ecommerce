import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import {
    User, Mail, Phone, Lock,
    Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';
import api from '../api/client';
import { useGoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Internal component to safely use the useGoogleLogin hook
const GoogleLoginSection = ({ API_URL, syncLocalCartToServer, refreshUser, setLoading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/dashboard';

    let googleLogin;
    try {
        googleLogin = useGoogleLogin({
            onSuccess: async (tokenResponse) => {
                setLoading(true);
                try {
                    const res = await axios.post(`${API_URL}/auth/google/`, {
                        access_token: tokenResponse.access_token
                    });
                    localStorage.setItem('access_token', res.data.access_token || res.data.access);
                    localStorage.setItem('refresh_token', res.data.refresh_token || res.data.refresh);
                    await syncLocalCartToServer();
                    await refreshUser();
                    toast.success("Welcome back! Logged in with Google.");
                    navigate(from);
                } catch (err) {
                    toast.error("Google login failed. Please try again.");
                } finally {
                    setLoading(false);
                }
            },
            onError: () => toast.error("Google login failed"),
        });
    } catch (e) {
        // Fallback if GoogleOAuthProvider is missing
        return (
            <div className="google-login-container opacity-50 cursor-not-allowed">
                <button
                    disabled
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400"
                >
                    <FaGoogle className="text-gray-300" />
                    Google (Disabled)
                </button>
            </div>
        );
    }

    return (
        <div className="google-login-container">
            <motion.button
                whileHover={{ y: -2 }}
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group cursor-pointer"
            >
                <FaGoogle className="text-red-500 transition-transform group-hover:scale-110" />
                Google
            </motion.button>
        </div>
    );
};

const Account = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { syncLocalCartToServer } = useCart();
    const { user, refreshUser } = useUser();

    const from = location.state?.from || '/dashboard';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate(from);
        }
    }, [user, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                await syncLocalCartToServer();
                await refreshUser();
                toast.success("Welcome back to Sarker Shop!");
                navigate(from);
            } else {
                await axios.post(`${API_URL}/auth/register/`, {
                    full_name: name,
                    email,
                    phone_number: phone,
                    password
                });
                toast.success("Account created successfully! Let's sign you in.");
                setIsLogin(true);
            }
        } catch (error) {
            const msg = error.response?.data?.detail || "Authentication failed. check your credentials.";
            toast.error(msg);
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

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white">

                {/* Left Side: Branding/Visual */}
                <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl font-black tracking-tight mb-4 leading-tight">
                                Join the Elite <br /> Tech Hub.
                            </h1>
                            <p className="text-purple-100 text-lg leading-relaxed max-w-sm">
                                Experience premium gadgets, exclusive deals, and lightning-fast support. Your digital evolution starts here.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6 pt-10">
                            {[
                                { label: 'Active Users', val: '50k+' },
                                { label: 'Products', val: '2000+' },
                                { label: 'Fast Delivery', val: '24h' },
                                { label: 'Trust Score', val: '4.9/5' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    <p className="text-2xl font-black">{stat.val}</p>
                                    <p className="text-xs text-purple-200 uppercase tracking-widest font-bold">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative Gradients for Left Side */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                </div>

                {/* Right Side: Auth Form */}
                <div className="p-8 sm:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center lg:text-left mb-10">
                            <motion.h2
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl font-extrabold text-gray-900 tracking-tight"
                            >
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </motion.h2>
                            <p className="mt-4 text-gray-500 font-medium">
                                {isLogin ? "Don't have an account?" : 'Already a member?'}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-2 text-purple-600 font-bold hover:underline cursor-pointer"
                                >
                                    {isLogin ? 'Sign up for free' : 'Sign in'}
                                </button>
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={isLogin ? 'form-login' : 'form-register'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                                placeholder="Phone Number"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="Email Address"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {isLogin && (
                                    <div className="flex justify-end">
                                        <div onClick={() => navigate('/forgot-password')} className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors cursor-pointer">Forgot password?</div>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-900/10 hover:shadow-purple-900/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 cursor-pointer"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Join Now'}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>

                        <div className="mt-10">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute inset-0 flex items-center px-4">
                                    <span className="w-full border-t border-gray-100" />
                                </span>
                                <span className="relative px-4 bg-white text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Or Access With</span>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {/* --- GOOGLE SECTION START --- */}
                                <GoogleLoginSection
                                    API_URL={API_URL}
                                    syncLocalCartToServer={syncLocalCartToServer}
                                    refreshUser={refreshUser}
                                    setLoading={setLoading}
                                />
                                {/* --- GOOGLE SECTION END --- */}

                                {/* --- FACEBOOK SECTION START --- */}
                                <div>
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group cursor-pointer"
                                    > <FaFacebook color="#222dc3" />
                                        Facebook <span className="text-xs text-gray-400">beta</span>
                                    </motion.button>
                                </div>
                                {/* --- FACEBOOK SECTION END --- */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Flair: Floating shapes */}
            <div className="absolute top-[20%] right-[-5%] w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 animate-bounce" />
            <div className="absolute bottom-[20%] left-[-5%] w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        </div>
    );
};

export default Account;
