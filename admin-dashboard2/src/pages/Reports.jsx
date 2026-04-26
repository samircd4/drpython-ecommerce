import React, { useState, useEffect } from "react";
import { 
    TrendingUp, DollarSign, ShoppingBag, 
    Users, Download, ArrowUpRight, ArrowDownRight,
    Search, Filter, Calendar
} from "lucide-react";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import Loader from "../components/Layout/Loader";
import { useStoreConfig } from "../hooks/useStoreConfig";

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);
    const { config } = useStoreConfig();
    const symbol = config?.currency_symbol || "৳";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    api.get('/dashboard/stats/'),
                    api.get('/dashboard/analytics/')
                ]);
                setStats(statsRes.data);
                setAnalytics(analyticsRes.data);
            } catch (error) {
                console.error("Error fetching reports data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader />;
    if (!stats || !analytics) return <div className="p-6 text-white text-center">Failed to load reports.</div>;

    const { summary } = stats;
    const { monthly_stats, categories } = analytics;

    // Derived stats for the summary cards
    const reportStats = [
        { 
            label: "Total Revenue", 
            value: `${symbol}${summary[0]?.value.toLocaleString()}`, 
            trend: summary[0]?.change, 
            isUp: summary[0]?.change.startsWith('+'), 
            icon: DollarSign, 
            color: "blue" 
        },
        { 
            label: "Total Orders", 
            value: summary[1]?.value.toLocaleString(), 
            trend: summary[1]?.change, 
            isUp: summary[1]?.change.startsWith('+'), 
            icon: ShoppingBag, 
            color: "emerald" 
        },
        { 
            label: "Total Customers", 
            value: summary[2]?.value.toLocaleString(), 
            trend: summary[2]?.change, 
            isUp: summary[2]?.change.startsWith('+'), 
            icon: Users, 
            color: "purple" 
        },
        { 
            label: "Total Products", 
            value: summary[4]?.value.toLocaleString(), 
            trend: summary[4]?.change, 
            isUp: summary[4]?.change.startsWith('+'), 
            icon: Briefcase, 
            color: "orange" 
        },
    ];

    const maxSales = Math.max(...monthly_stats.map(s => s.sales), 1);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Breadcrumb title="Reports" paths={[{label: "Home", path: "/"}, {label: "Reports", path: "/reports"}]} />
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-[#0b1a2a] border border-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl hover:border-blue-500 transition-all cursor-pointer">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {reportStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-600/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-${stat.color}-600/20 transition-all`} />

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-xl bg-slate-800 text-${stat.color}-500 border border-slate-700 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-xl font-black text-white">{stat.value}</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-12">
                {/* Sales Performance Chart (SVG) */}
                <div className="lg:col-span-2 bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Financial Trajectory</h3>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Monthly revenue visualization</p>
                        </div>
                        <div className="flex gap-2">
                             <button className="flex items-center gap-2 bg-blue-600 border border-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                                <Download className="w-3.5 h-3.5" /> Export PDF
                            </button>
                        </div>
                    </div>
                    <div className="relative h-72 w-full group">
                        {/* Custom SVG Area Chart Layout */}
                        <svg 
                            className="w-full h-full overflow-visible" 
                            viewBox="0 0 600 200"
                            onMouseLeave={() => setHoveredData(null)}
                        >
                            {/* Grid Lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                            ))}

                            {/* Area Fill */}
                            {monthly_stats.length > 1 && (
                                <path
                                    d={`M0,200 ${monthly_stats.map((s, i) => `L${i * (600 / (monthly_stats.length - 1))},${200 - (s.sales / maxSales * 180)}`).join(' ')} L600,200 Z`}
                                    fill="url(#grad-blue-rep)"
                                    fillOpacity="0.2"
                                />
                            )}

                            {/* Line */}
                            {monthly_stats.length > 1 && (
                                <path
                                    d={monthly_stats.map((s, i) => `${i === 0 ? 'M' : 'L'}${i * (600 / (monthly_stats.length - 1))},${200 - (s.sales / maxSales * 180)}`).join(' ')}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                />
                            )}

                            {/* Focus Line */}
                            {hoveredData && (
                                <line 
                                    x1={hoveredData.x} 
                                    y1="0" 
                                    x2={hoveredData.x} 
                                    y2="200" 
                                    stroke="#3b82f6" 
                                    strokeWidth="1" 
                                    strokeDasharray="4 4"
                                    className="opacity-50 animate-pulse"
                                />
                            )}

                            {/* Data Points & Hover Targets */}
                            {monthly_stats.map((s, i) => {
                                const x = i * (600 / (monthly_stats.length - 1));
                                const y = 200 - (s.sales / maxSales * 180);
                                const isHovered = hoveredData?.index === i;

                                return (
                                    <g key={i} className="group/dot">
                                        {/* Larger invisible hit area */}
                                        <rect
                                            x={x - 25}
                                            y="0"
                                            width="50"
                                            height="200"
                                            fill="transparent"
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHoveredData({ ...s, x, y, index: i })}
                                        />
                                        
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={isHovered ? "8" : "5"}
                                            fill={isHovered ? "#60a5fa" : "#3b82f6"}
                                            className="transition-all duration-300 pointer-events-none"
                                            stroke={isHovered ? "white" : "none"}
                                            strokeWidth="2"
                                        />
                                        
                                        {isHovered && (
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="15"
                                                fill="#3b82f6"
                                                fillOpacity="0.1"
                                                className="animate-ping pointer-events-none"
                                            />
                                        )}
                                    </g>
                                );
                            })}

                            {/* Labels */}
                            {monthly_stats.map((s, i) => (
                                <text
                                    key={i}
                                    x={i * (600 / (monthly_stats.length - 1))}
                                    y="225"
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize="10"
                                    className="font-black uppercase tracking-tighter"
                                >
                                    {s.month}
                                </text>
                            ))}

                            <defs>
                                <linearGradient id="grad-blue-rep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Tooltip Overlay */}
                        {hoveredData && (
                            <div 
                                className="absolute z-50 pointer-events-none transition-all duration-200"
                                style={{ 
                                    left: `${(hoveredData.x / 600) * 100}%`, 
                                    top: `${(hoveredData.y / 200) * 100}%`,
                                }}
                            >
                                <div 
                                    className="bg-[#0b1a2a]/95 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 shadow-2xl min-w-[180px] relative"
                                    style={{
                                        transform: hoveredData.index === 0 
                                            ? 'translate(0%, -110%)' 
                                            : hoveredData.index === monthly_stats.length - 1 
                                                ? 'translate(-100%, -110%)' 
                                                : 'translate(-50%, -110%)'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{hoveredData.month}</span>
                                        <TrendingUp className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Revenue</span>
                                            <span className="text-white font-black font-mono">{symbol}{hoveredData.sales.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Orders</span>
                                            <span className="text-blue-400 font-black">{hoveredData.orders}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Profit (Est)</span>
                                            <span className="text-emerald-400 font-black font-mono">{symbol}{hoveredData.profit.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Arrow */}
                                    <div 
                                        className="absolute -bottom-1 w-2 h-2 bg-[#0b1a2a] rotate-45 border-r border-b border-blue-500/30" 
                                        style={{
                                            left: hoveredData.index === 0 
                                                ? '20px' 
                                                : hoveredData.index === monthly_stats.length - 1 
                                                    ? 'calc(100% - 20px)' 
                                                    : '50%',
                                            transform: 'translateX(-50%) rotate(45deg)'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sales by Category (Vertical bars/list) */}
                <div className="bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Segment Dominance</h3>
                    <div className="space-y-6">
                        {categories.map((cat, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white">{cat.value}%</span>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{cat.count} units</p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${
                                            i === 0 ? 'from-blue-600 to-blue-400' :
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

                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-[#0b1a2a] rounded-2xl border border-dashed border-slate-700">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Annual Yield</span>
                                <span className="text-md font-black text-emerald-500 uppercase">+{symbol}{((summary[0]?.value || 0) * 1.2).toLocaleString()} EST.</span>
                            </div>
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon replacement for Briefcase
const Briefcase = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);

export default Reports;
