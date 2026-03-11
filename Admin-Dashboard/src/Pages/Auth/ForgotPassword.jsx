import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react';

const ForgotPassword = ({ setAuthPage }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await resetPassword(email);
            setIsSent(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#071229] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-top-4 transition-all duration-500">
                <div className="bg-[#0b1a2a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <button
                        onClick={() => setAuthPage('login')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to login
                    </button>

                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl mb-6">
                            {isSent ? <CheckCircle2 className="w-8 h-8" /> : <Send className="w-8 h-8" />}
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            {isSent ? 'Mail Sent!' : 'Recover Password'}
                        </h1>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                            {isSent ? `Code sent to ${email}` : "We'll email you a recovery link"}
                        </p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full bg-[#071229] border border-slate-700 text-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Send Recovery Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <p className="text-sm text-emerald-500 text-center font-medium">
                                    Please check your inbox. We've sent instructions to reset your password.
                                </p>
                            </div>
                            <button
                                onClick={() => setAuthPage('login')}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95 text-xs"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
