import React from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Breadcrumb from "../Components/Layout/Breadcrumb";
import reportData from "../data/reports.json";

const Reports = () => {
    const { monthlyStats, categories } = reportData;

    // Simple SVG Charts implementation
    const maxSales = Math.max(...monthlyStats.map(s => s.sales));
    const maxProfit = Math.max(...monthlyStats.map(s => s.profit));

    const stats = [
        { label: "Total Revenue", value: "$42,500", trend: "+12.5%", isUp: true, icon: DollarSign, color: "blue" },
        { label: "Total Orders", value: "842", trend: "+5.1%", isUp: true, icon: ShoppingBag, color: "emerald" },
        { label: "New Customers", value: "128", trend: "-2.4%", isUp: false, icon: Users, color: "purple" },
        { label: "Avg. ROI", value: "24.2%", trend: "+8.3%", isUp: true, icon: TrendingUp, color: "orange" },
    ];

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <Breadcrumb title="Reports" paths={["Home", "Reports"]} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-600/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-${stat.color}-600/20 transition-all`} />

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded ${stat.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                    {stat.trend}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">vs last month</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Sales Performance Chart (SVG) */}
                <div className="lg:col-span-2 bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Sales Performance</h3>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Monthly revenue visualization</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 bg-[#0b1a2a] border border-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:border-blue-500 transition-all">
                                <Download className="w-3.5 h-3.5" /> Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="relative h-64 w-full group">
                        {/* Custom SVG Area Chart Layout */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                            {/* Grid Lines */}
                            {[0, 50, 100, 150].map(y => (
                                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                            ))}

                            {/* Area Fill */}
                            <path
                                d={`M0,200 ${monthlyStats.map((s, i) => `L${i * (600 / (monthlyStats.length - 1))},${200 - (s.sales / maxSales * 150)}`).join(' ')} L600,200 Z`}
                                fill="url(#gradient-blue)"
                                fillOpacity="0.2"
                            />

                            {/* Line */}
                            <path
                                d={monthlyStats.map((s, i) => `${i === 0 ? 'M' : 'L'}${i * (600 / (monthlyStats.length - 1))},${200 - (s.sales / maxSales * 150)}`).join(' ')}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            />

                            {/* Data Points */}
                            {monthlyStats.map((s, i) => (
                                <circle
                                    key={i}
                                    cx={i * (600 / (monthlyStats.length - 1))}
                                    cy={200 - (s.sales / maxSales * 150)}
                                    r="4"
                                    fill="#3b82f6"
                                    className="cursor-pointer hover:r-6 hover:fill-white transition-all duration-300"
                                />
                            ))}

                            {/* Labels */}
                            {monthlyStats.map((s, i) => (
                                <text
                                    key={i}
                                    x={i * (600 / (monthlyStats.length - 1))}
                                    y="220"
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize="10"
                                    className="font-bold uppercase tracking-tighter"
                                >
                                    {s.month}
                                </text>
                            ))}

                            <defs>
                                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Sales by Category (Progress Bars) */}
                <div className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-6">Market Share</h3>
                    <div className="space-y-6">
                        {categories.map((cat, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-tighter">{cat.name}</span>
                                    <span className="text-sm font-black text-white">{cat.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${i === 0 ? 'from-blue-600 to-blue-400' :
                                            i === 1 ? 'from-emerald-600 to-emerald-400' :
                                                i === 2 ? 'from-purple-600 to-purple-400' :
                                                    'from-orange-600 to-orange-400'
                                            }`}
                                        style={{ width: `${cat.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-[#0b1a2a] rounded-xl border border-dashed border-slate-700">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Growth Forecast</span>
                                <span className="text-sm font-black text-emerald-500 uppercase">+18.4% YoY</span>
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
