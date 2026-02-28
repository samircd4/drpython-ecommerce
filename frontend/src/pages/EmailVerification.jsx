import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { BASE_URL } from '../api/client';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            if (!uid || !token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                await api.post(`/auth/verify-email/`, {
                    uidb64: uid,
                    token: token
                });
                setStatus('success');
                setMessage('Email verified successfully!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || "Verification failed or link expired.");
            }
        };

        verifyEmail();
    }, [uid, token]);

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

            <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-12 relative z-10 border border-white text-center">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="mb-6"
                        >
                            <Loader className="w-16 h-16 text-purple-600" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                        <p className="text-gray-500 mb-8">{message}</p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/account')}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2"
                        >
                            Continue to Login
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">{message}</p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/account')}
                            className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                        >
                            Go to Login
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;
