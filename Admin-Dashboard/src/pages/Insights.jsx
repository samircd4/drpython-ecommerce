import React from "react";

const Insights = () => {
    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="rounded-xl bg-[#071229] p-8 shadow-md max-w-4xl mx-auto border border-slate-800 text-center">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/20 text-blue-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100">Insights & Analytics</h2>
                    <p className="mt-4 text-slate-400 text-lg">Your data-driven growth strategies and performance metrics will appear here.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                    <div className="p-4 rounded-lg bg-slate-800/20 border border-slate-700/50">
                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Coming Soon</p>
                        <p className="text-slate-200 font-medium">Predictive Sales</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/20 border border-slate-700/50">
                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Coming Soon</p>
                        <p className="text-slate-200 font-medium">Customer Retention</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/20 border border-slate-700/50">
                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Coming Soon</p>
                        <p className="text-slate-200 font-medium">Inventory Health</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;