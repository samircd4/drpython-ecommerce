import React, { useState, useEffect } from "react";
import { 
    TrendingUp, ArrowUpRight, ArrowDownRight, 
    Calendar, Filter, Download, Briefcase, 
    Target, Zap, ShoppingBag
} from "lucide-react";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import Loader from "../components/Layout/Loader";

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/analytics/');
                setData(res.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader />;
    if (!data) return <div className="p-6 text-white text-center">Failed to load analytics.</div>;

    const { monthly_stats, categories, daily_trends, top_products } = data;

    // Helper for SVG chart
    const maxDailySales = Math.max(...daily_trends.map(d => d.value), 1);
    const maxMonthlySales = Math.max(...monthly_stats.map(m => m.sales), 1);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Breadcrumb title="Analytics" paths={[{label: "Home", path: "/"}, {label: "Analytics", path: "/analytics"}]} />
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-[#0b1a2a] border border-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:border-blue-500 transition-all cursor-pointer">
                        <Calendar className="w-3.5 h-3.5" /> This Year
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 border border-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all cursor-pointer">
                        <Download className="w-3.5 h-3.5" /> Export Report
                    </button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-blue-600/10 transition-all" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Revenue Trends</h3>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Daily performance last 30 days</p>
                        </div>
                        <div className="text-right">
                             <p className="text-2xl font-black text-white">৳{daily_trends.reduce((a,b) => a + b.value, 0).toLocaleString()}</p>
                             <p className="text-[10px] text-emerald-400 font-bold uppercase">Total period revenue</p>
                        </div>
                    </div>

                    <div className="relative h-64 w-full group mt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                            {/* Grid Lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                            ))}

                            {/* Area Fill */}
                            {daily_trends.length > 1 && (
                                <path
                                    d={`M0,200 ${daily_trends.map((d, i) => `L${i * (800 / (daily_trends.length - 1))},${200 - (d.value / maxDailySales * 180)}`).join(' ')} L800,200 Z`}
                                    fill="url(#grad)"
                                    fillOpacity="0.15"
                                />
                            )}

                            {/* Line */}
                            {daily_trends.length > 1 && (
                                <path
                                    d={daily_trends.map((d, i) => `${i === 0 ? 'M' : 'L'}${i * (800 / (daily_trends.length - 1))},${200 - (d.value / maxDailySales * 180)}`).join(' ')}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                                />
                            )}

                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* Dates Row */}
                        <div className="flex justify-between mt-4">
                            {daily_trends.filter((_, i) => i % 5 === 0 || i === daily_trends.length - 1).map((d, i) => (
                                <span key={i} className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{d.date}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Mix */}
                <div className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Niche Influence</h3>
                    <div className="space-y-6 flex-1">
                        {categories.map((cat, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{cat.name}</span>
                                    <span className="text-sm font-black text-white">{cat.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${
                                            i === 0 ? 'from-blue-600 to-cyan-400' :
                                            i === 1 ? 'from-emerald-600 to-teal-400' :
                                            i === 2 ? 'from-purple-600 to-indigo-400' :
                                            'from-orange-600 to-yellow-400'
                                        } shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000`}
                                        style={{ width: `${cat.value}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">{cat.count} items sold</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-4 bg-blue-600/5 rounded-xl border border-blue-500/10">
                            <Zap className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Growth Forecast</p>
                                <p className="text-white text-sm font-bold">Projected +24% growth next month</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Top Products & Monthly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Products */}
                <div className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Prime Assets</h3>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded uppercase tracking-widest">Top 5 by Revenue</span>
                    </div>
                    
                    <div className="space-y-4">
                        {top_products.map((product, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-[#0b1a2a] rounded-xl border border-slate-800 group hover:border-blue-500/50 transition-all">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 relative">
                                    <img src={product.image || "/placeholder.png"} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Inventory Level: Healthy</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-400 tracking-tight">৳{product.revenue.toLocaleString()}</p>
                                    <div className="flex items-center justify-end text-[10px] text-emerald-400 font-bold">
                                        <ArrowUpRight className="w-3 h-3" />
                                        <span>+12.5%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Performance Stats */}
                <div className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Monthly Pulse</h3>
                    
                    <div className="space-y-3 flex-1">
                        {monthly_stats.map((month, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 text-xs font-black text-slate-500 uppercase">{month.month}</div>
                                <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden relative">
                                    <div 
                                        className="h-full bg-blue-600/20 border-r border-blue-500/50 transition-all duration-1000"
                                        style={{ width: `${(month.sales / maxMonthlySales) * 100}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-between px-3">
                                        <span className="text-[10px] text-white font-bold uppercase">{month.orders} Orders</span>
                                        <span className="text-xs font-black text-white">৳{month.sales.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Avg. Cart Value</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-white">৳4,250</span>
                                <span className="text-[10px] text-emerald-500 font-bold">+8%</span>
                            </div>
                        </div>
                        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                            <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-1">Conversion Rate</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-white">3.8%</span>
                                <span className="text-[10px] text-purple-500 font-bold">-2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
