import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FeedbackWidget from '../components/FeedbackWidget';
import { Bug } from 'lucide-react';

const DevFeedback = () => {
    const [searchParams] = useSearchParams();
    const fromPage = searchParams.get('from') || searchParams.get('ref') || 'Direct Link';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#071229] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <Bug className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight sm:text-5xl">
                    Internal <span className="text-red-500">Feedback</span> System
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                    Found a bug or have an idea? Your feedback helps us build a better platform. All submissions are carefully reviewed by our team.
                </p>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-[#0d1b2e]/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    {fromPage !== 'Direct Link' && (
                        <div className="px-6 pt-6 pb-3 border-b border-slate-700/30">
                            <div className="px-4 py-2.5 bg-slate-800/40 border border-slate-700/30 rounded-lg inline-block">
                                <span className="text-slate-500 text-xs font-medium">Referrer: </span>
                                <span className="text-blue-400 text-xs font-mono font-semibold">{fromPage}</span>
                            </div>
                        </div>
                    )}
                    <FeedbackWidget inline={true} referrer={fromPage} />
                </div>
            </div>

            <div className="relative z-10 mt-16 text-center text-slate-500 text-xs font-medium space-y-2">
                <div>© 2026 Sarker Shop • Developer Relations</div>
                <div className="text-slate-600">Have technical questions? <a href="mailto:dev@sarker.shop" className="text-blue-400 hover:text-blue-300">Contact us</a></div>
            </div>
        </div>
    );
};

export default DevFeedback;
