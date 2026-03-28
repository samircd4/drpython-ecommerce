import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Github, Chrome } from 'lucide-react';

const Login = ({ setAuthPage }) => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(identifier, password);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#071229] relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
                <div className="bg-[#0b1a2a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl mb-6 shadow-lg shadow-blue-600/10 active:scale-95 transition-transform">
                            <LogIn className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Superuser Login</h1>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Admin Dashboard Restricted</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email or Username</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter email or username"
                                    className="w-full bg-[#071229] border border-slate-700 text-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setAuthPage('forgot')}
                                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#071229] border border-slate-700 text-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="w-full border-t border-slate-800" />
                            <span className="absolute px-4 bg-[#0b1a2a] text-[10px] font-black text-slate-600 uppercase tracking-widest">Or continue with</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="flex items-center justify-center gap-3 bg-[#071229] border border-slate-800 py-3 rounded-2xl hover:bg-blue-600 hover:border-blue-600 transition-all text-sm font-bold group"
                            >
                                <Chrome className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                <span className="text-slate-400 group-hover:text-white">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-[#071229] border border-slate-800 py-3 rounded-2xl hover:bg-slate-700 hover:border-slate-700 transition-all text-sm font-bold group">
                                <Github className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                <span className="text-slate-400 group-hover:text-white">Github</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <button
                                onClick={() => setAuthPage('register')}
                                className="text-blue-500 font-bold hover:underline"
                            >
                                Register Now
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
