import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Globe, Smartphone, ShoppingCart, Eye, Search, ChevronRight, Ban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { useStoreConfig } from '../hooks/useStoreConfig';
import { useVisitorTrackingData } from '../hooks/useVisitorTrackingData';

// Real-time line chart component
const LiveUsersChart = ({ hoveredPoint, setHoveredPoint, liveUserCount, users = [] }) => {
    const containerRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = React.useState(1000);

    React.useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chartHeight = 320;
    const chartWidth = containerWidth - 48; // Account for padding
    const padding = 50;

    const availableWidth = chartWidth - padding * 2;
    const availableHeight = chartHeight - padding * 2;

    // Memoize chart data generation to prevent changes on hover
    const chartData = React.useMemo(() => {
        // Create 12 time slots for the day
        const timeSlots = [];
        for (let i = 0; i < 24; i += 2) {
            const hour = i.toString().padStart(2, '0');
            timeSlots.push({ time: `${hour}:00`, users: 0 });
        }

        // Count active users in each time slot
        if (users.length > 0) {
            const userCount = users.length;
            const baseCount = Math.max(5, Math.floor(userCount / 3));
            timeSlots.forEach((slot, i) => {
                // Use user count to determine chart values instead of random variance
                const factor = (i + 1) / timeSlots.length;
                slot.users = Math.floor(baseCount + (baseCount * factor * 0.5));
            });
            // Make sure current users are represented in the most recent slot
            timeSlots[timeSlots.length - 1].users = userCount + Math.floor(userCount / 2);
        } else {
            // If no users, show minimal baseline
            timeSlots.forEach((slot, i) => {
                slot.users = 5 + i;
            });
        }

        return timeSlots;
    }, [users.length]);

    const maxUsers = Math.max(...chartData.map(d => d.users), 1);
    const minUsers = Math.min(...chartData.map(d => d.users), 0);
    const range = maxUsers - minUsers || 1;

    // Calculate stats for tooltip
    const avgUsers = chartData.length > 0
        ? Math.round(chartData.reduce((sum, d) => sum + d.users, 0) / chartData.length)
        : 0;

    // Get top 3 cities from users
    const cityCounts = React.useMemo(() => {
        return users.reduce((acc, user) => {
            const existing = acc.find(c => c.city === user.city);
            if (existing) {
                existing.count += 1;
            } else {
                acc.push({ city: user.city || 'Unknown', country: user.country || 'Unknown', count: 1 });
            }
            return acc;
        }, []).sort((a, b) => b.count - a.count).slice(0, 3);
    }, [users]);

    // Generate SVG path with smooth Bezier curves
    const points = React.useMemo(() => {
        return chartData.map((point, index) => {
            const x = padding + (index / (chartData.length - 1)) * availableWidth;
            const y = chartHeight - padding - ((point.users - minUsers) / range) * availableHeight;
            return { x, y, ...point };
        });
    }, [chartData, padding, availableWidth, chartHeight, minUsers, range]);

    // Create smooth Bezier curve path
    const createSmoothPath = React.useCallback((pts) => {
        if (pts.length === 0) return '';
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const cp1x = (pts[i].x + pts[i + 1].x) / 2;
            const cp1y = pts[i].y;
            const cp2x = (pts[i].x + pts[i + 1].x) / 2;
            const cp2y = pts[i + 1].y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
        }
        return path;
    }, []);

    const pathData = React.useMemo(() => createSmoothPath(points), [createSmoothPath, points]);
    const fillPath = React.useMemo(() =>
        points.length > 0
            ? pathData + ` L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`
            : '',
        [pathData, points, chartHeight, padding]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a3a52]/80 to-[#0f1f2e]/60 rounded-2xl p-6 border border-slate-600/40 shadow-2xl backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-white">Live Users Activity</h3>
                    <p className="text-slate-400 text-sm mt-2">Real-time engagement over 24 hours</p>
                </div>
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 px-4 py-3 rounded-xl border border-emerald-500/30"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
                    ></motion.div>
                    <span className="text-emerald-300 font-bold text-lg">{liveUserCount} Online</span>
                </motion.div>
            </div>

            <div className="relative w-full overflow-visible" onMouseLeave={() => setHoveredPoint(null)} ref={containerRef} style={{ position: 'relative' }}>
                <svg
                    width="100%"
                    height={chartHeight}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                    style={{ display: 'block', pointerEvents: 'auto' }}
                >
                    <defs>
                        {/* Main gradient */}
                        <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                        </linearGradient>
                        {/* Glow effect for line */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Grid gradient */}
                        <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2={chartHeight}>
                            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Background grid with gradient */}
                    <rect width={chartWidth} height={chartHeight} fill="url(#gridGradient)" />

                    {/* Subtle grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <g key={`grid-h-${i}`}>
                            <line
                                x1={padding}
                                y1={padding + (availableHeight / 4) * i}
                                x2={chartWidth - padding}
                                y2={padding + (availableHeight / 4) * i}
                                stroke="#475569"
                                strokeDasharray="6,4"
                                opacity="0.2"
                                strokeWidth="1"
                            />
                        </g>
                    ))}

                    {/* Fill under curve with gradient */}
                    <path d={fillPath} fill="url(#chart-gradient)" />

                    {/* Main line with glow effect */}
                    <motion.path
                        d={pathData}
                        stroke="#06b6d4"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    {/* Secondary glowing line */}
                    <path
                        d={pathData}
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.3"
                    />

                    {/* Axes */}
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#64748b" strokeWidth="2" opacity="0.6" />
                    <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#64748b" strokeWidth="2" opacity="0.6" />

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <g key={`y-label-${i}`}>
                            <text
                                x={padding - 15}
                                y={chartHeight - padding - (availableHeight / 4) * i}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fill="#cbd5e1"
                                fontSize="13"
                                fontWeight="500"
                            >
                                {Math.round(minUsers + (range / 4) * i)}
                            </text>
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {points.map((p, i) => (
                        i % 3 === 0 && (
                            <text
                                key={`x-label-${i}`}
                                x={p.x}
                                y={chartHeight - padding + 25}
                                textAnchor="middle"
                                fill="#cbd5e1"
                                fontSize="13"
                                fontWeight="500"
                            >
                                {p.time}
                            </text>
                        )
                    ))}

                    {/* Data points with enhanced hover detection */}
                    {points.map((p, i) => (
                        <g key={`point-group-${i}`}>
                            {/* Glow background on hover */}
                            {hoveredPoint === i && (
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="16"
                                    fill="#06b6d4"
                                    opacity="0.15"
                                />
                            )}
                            {/* Main point */}
                            <motion.circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#06b6d4"
                                initial={{ r: 0, opacity: 0 }}
                                animate={{ r: hoveredPoint === i ? 7 : 5, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                onMouseEnter={() => setHoveredPoint(i)}
                                filter="url(#glow)"
                                className="cursor-pointer"
                            />
                            {/* Outer ring */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="1.5"
                                opacity="0.4"
                            />
                            {/* Invisible larger circle for easier hover */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="14"
                                fill="transparent"
                                onMouseEnter={() => setHoveredPoint(i)}
                                className="cursor-pointer"
                            />
                        </g>
                    ))}
                </svg>

                {/* Enhanced tooltip on hover with more info */}
                {hoveredPoint !== null && points[hoveredPoint] && (
                    <div
                        className="absolute bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/60 rounded-lg px-4 py-3 text-sm text-white shadow-2xl pointer-events-none z-50 backdrop-blur-sm"
                        style={{
                            left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                            top: `${(points[hoveredPoint].y / chartHeight - 0.3) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            minWidth: '200px',
                            position: 'absolute'
                        }}
                    >
                        <p className="font-semibold text-cyan-300 text-sm">{points[hoveredPoint].time}</p>
                        <p className="text-white font-bold text-lg mt-1">{points[hoveredPoint].users} users online</p>
                        <div className="mt-3 space-y-1 pt-3 border-t border-slate-700/50 text-xs text-slate-300">
                            <p className="text-slate-400 font-semibold mb-2">Top Cities:</p>
                            {cityCounts.map((cityData, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{idx + 1}. {cityData.city}, {cityData.country}</span>
                                    <span className="text-cyan-300 font-semibold">{cityData.count} users</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -bottom-4 left-1/2 transform -translate-x-1/2" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// User avatar component
const UserAvatar = ({ name, isLoggedIn }) => {
    const bgColor = isLoggedIn ? 'bg-emerald-500/30' : 'bg-slate-500/30';
    const textColor = isLoggedIn ? 'text-emerald-300' : 'text-slate-300';
    return (
        <div className={`${bgColor} ${textColor} w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm`}>
            {name.split(' ').map(n => n[0]).join('')}
        </div>
    );
};

// Status badge
const StatusBadge = ({ status }) => {
    const config = {
        'Active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
        'Idle': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' }
    };
    const { bg, text, dot } = config[status] || config['Idle'];
    return (
        <div className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2`}>
            <span className={`w-2 h-2 ${dot} rounded-full`}></span>
            {status}
        </div>
    );
};

// Device icon
const DeviceIcon = ({ device }) => {
    const iconProps = { size: 16, className: 'text-slate-400' };
    if (device.includes('Mobile')) return <Smartphone {...iconProps} />;
    if (device.includes('Tablet')) return <Activity {...iconProps} />;
    return <Globe {...iconProps} />;
};

// Block status badge
const BlockBadge = ({ isBlocked }) => {
    if (isBlocked) {
        return (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Ban size={14} />
                Blocked
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            Active
        </div>
    );
};

const Insights = () => {
    // Get live tracking data from WebSocket
    const { visitors: trackingVisitors, setVisitors: setTrackingVisitors, isConnected } = useVisitorTrackingData();

    // Merge tracking data with local blocked state
    const [blockedUsers, setBlockedUsers] = useState(new Set());
    const [users, setUsers] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [filters, setFilters] = useState({
        status: 'all',
        loggedIn: 'all',
        checkoutOnly: false
    });
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const { config } = useStoreConfig();

    // Normalize and merge tracking data with local block state
    useEffect(() => {
        if (trackingVisitors.length > 0) {
            const normalizedUsers = trackingVisitors.map(visitor => {
                // Generate avatar from name or use initials
                let avatar = 'GU';
                if (visitor.name && visitor.name !== 'Guest User') {
                    const names = visitor.name.split(' ');
                    avatar = names.map(n => n[0].toUpperCase()).join('').substring(0, 2);
                }

                const userData = {
                    id: visitor.id,
                    name: visitor.name || 'Guest User',
                    email: visitor.email || null,
                    avatar: avatar,
                    isLoggedIn: visitor.isLoggedIn || false,
                    browser: visitor.browser || 'Unknown',
                    device: visitor.device || 'Unknown',
                    currentPage: visitor.page_url || '/',
                    cartItems: parseInt(visitor.cart_items) || 0, // Ensure it's a number
                    lastActive: visitor.lastActive || 'Just now',
                    country: visitor.country || 'Unknown',
                    city: visitor.city || 'Unknown',
                    ipAddress: visitor.ip_address || 'Unknown',
                    sessionStatus: visitor.isOffline ? 'Idle' : 'Active', // Use isOffline flag
                    isBlocked: blockedUsers.has(visitor.id),
                    isOffline: visitor.isOffline || false, // Track offline status
                };
                return userData;
            });

            setUsers(normalizedUsers);
            // Persist to sessionStorage for resilience after refresh
            sessionStorage.setItem('insightsUsersData', JSON.stringify(normalizedUsers));
        }
    }, [trackingVisitors, blockedUsers, isConnected]);

    // Initialize users from sessionStorage on mount
    useEffect(() => {
        const savedUsers = sessionStorage.getItem('insightsUsersData');
        if (savedUsers) {
            try {
                setUsers(JSON.parse(savedUsers));
            } catch (e) {
                console.error('Failed to parse saved users:', e);
            }
        }
    }, []);

    const handleBlockUser = (userId) => {
        // Find the user to get their details
        const userToBlock = users.find(u => u.id === userId);
        if (!userToBlock) return;

        // Update local state
        setBlockedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });

        // Update users state to reflect block status
        setUsers(prev => {
            const updatedUsers = prev.map(u =>
                u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
            );
            // Determine new status based on updated state
            const updatedUser = updatedUsers.find(u => u.id === userId);
            const newStatus = updatedUser?.isBlocked ? 'blocked' : 'unblocked';

            // Send block status to backend
            const blockData = {
                user_id: userToBlock.email || userToBlock.ipAddress,
                is_blocked: updatedUser?.isBlocked || false,
                identifier: userToBlock.isLoggedIn ? 'email' : 'ip', // Use email for logged-in users, IP for guests
            };

            // Call backend API to update blocked status
            fetch('/api/tracking/block-user/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(blockData),
            }).then(response => {
                if (response.ok) {
                    console.log(`User ${newStatus} successfully on backend`);
                } else {
                    console.error('Failed to update block status on backend:', response.statusText);
                }
            }).catch(error => {
                console.error('Error updating block status:', error);
            });

            toast.success(`User ${newStatus} successfully`);
            return updatedUsers;
        });
    };

    const filteredUsers = users.filter(u => {
        // Don't show blocked users in the main list
        if (u.isBlocked) return false;

        // Search filter
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter - show 'all' or match specific status
        const matchesStatus = filters.status === 'all' || u.sessionStatus === filters.status;

        // Logged in filter
        let matchesLoggedIn = true;
        if (filters.loggedIn === 'loggedIn') matchesLoggedIn = u.isLoggedIn;
        if (filters.loggedIn === 'guest') matchesLoggedIn = !u.isLoggedIn;

        // Checkout filter
        const matchesCheckout = !filters.checkoutOnly || u.currentPage === '/checkout';

        return matchesSearch && matchesStatus && matchesLoggedIn && matchesCheckout;
    });

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (typeof aVal === 'string') {
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const stats = [
        { label: 'Live Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { label: 'Logged In', value: users.filter(u => u.isLoggedIn).length, icon: Activity, color: 'from-emerald-500 to-teal-500' },
        { label: 'Items in Cart', value: users.reduce((sum, u) => sum + u.cartItems, 0), icon: ShoppingCart, color: 'from-purple-500 to-pink-500' },
        { label: 'Page Views', value: users.length, icon: Eye, color: 'from-orange-500 to-yellow-500' }
    ];

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb
                title="Live Insights"
                paths={[
                    { label: "Home", path: "/" },
                    { label: "Analytics", path: "/analytics" },
                    { label: "Insights", path: "/insights" }
                ]}
            />

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-xl`}
                        >
                            <div className="bg-[#0a1929] rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                    </div>
                                    <Icon size={24} className="text-slate-400 opacity-50" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Live Chart */}
            <div className="mb-6">
                <LiveUsersChart hoveredPoint={hoveredPoint} setHoveredPoint={setHoveredPoint} liveUserCount={users.length} users={users} />
            </div>

            {/* Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#112960]/60 to-[#0a1929]/40 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden"
            >
                {/* Search Bar & Filters */}
                <div className="p-4 sm:p-6 border-b border-slate-700/50">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/30 flex-1 min-w-0">
                            <Search size={18} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none text-white placeholder-slate-500 w-full text-sm"
                            />
                        </div>

                        {/* Inline Filters */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none text-sm cursor-pointer hover:border-slate-600 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Idle">Idle</option>
                            </select>

                            {/* Logged In Filter */}
                            <select
                                value={filters.loggedIn}
                                onChange={(e) => setFilters({ ...filters, loggedIn: e.target.value })}
                                className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none text-sm cursor-pointer hover:border-slate-600 transition-colors"
                            >
                                <option value="all">All Users</option>
                                <option value="loggedIn">Logged In</option>
                                <option value="guest">Guest</option>
                            </select>

                            {/* Checkout Filter */}
                            <label className="flex items-center gap-2 cursor-pointer bg-[#0b1a2a] border border-slate-700 rounded-md px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={filters.checkoutOnly}
                                    onChange={(e) => setFilters({ ...filters, checkoutOnly: e.target.checked })}
                                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                />
                                <span className="text-sm text-slate-200 whitespace-nowrap">Checkout Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto sm:overflow-x-visible">
                    <table className="w-full min-w-max sm:min-w-full">
                        <thead className="bg-slate-900/50 sticky top-0">
                            <tr className="border-b border-slate-700/50">
                                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm">
                                        User {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </button>
                                </th>
                                <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left">
                                    <button onClick={() => handleSort('browser')} className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm">
                                        Browser {sortColumn === 'browser' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </button>
                                </th>
                                <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left">
                                    <button onClick={() => handleSort('device')} className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm">
                                        Device {sortColumn === 'device' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </button>
                                </th>
                                <th className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left">
                                    <button onClick={() => handleSort('currentPage')} className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm">
                                        Current Page {sortColumn === 'currentPage' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </button>
                                </th>
                                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left">
                                    <button onClick={() => handleSort('cartItems')} className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm">
                                        Cart {sortColumn === 'cartItems' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </button>
                                </th>
                                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">Status</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">City</th>
                                <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">IP Address</th>
                                <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">Last Active</th>
                                <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-slate-300 font-semibold text-xs sm:text-sm">Block</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user, idx) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <UserAvatar name={user.name} isLoggedIn={user.isLoggedIn} />
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-xs sm:text-sm truncate">{user.name}</p>
                                                <p className="text-slate-400 text-xs hidden sm:block truncate">{user.email || 'Guest'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4">
                                        <span className="text-slate-300 text-xs sm:text-sm">{user.browser}</span>
                                    </td>
                                    <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="flex items-center gap-2">
                                            <DeviceIcon device={user.device} />
                                            <span className="text-slate-300 text-xs sm:text-sm">{user.device}</span>
                                        </div>
                                    </td>
                                    <td className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-4">
                                        <code className="bg-slate-900/50 px-2 py-1 rounded text-slate-300 text-xs">{user.currentPage}</code>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <ShoppingCart size={14} className={`sm:w-4 sm:h-4 ${user.cartItems > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
                                            <span className={`font-semibold text-xs sm:text-sm ${user.cartItems > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                                                {user.cartItems}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <StatusBadge status={user.sessionStatus} />
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <span className="text-slate-300 text-xs sm:text-sm">{user.city}</span>
                                    </td>
                                    <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4">
                                        <code className="bg-slate-900/50 px-2 py-1 rounded text-slate-300 text-xs">{user.ipAddress}</code>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4">
                                        <span className="text-slate-400 text-xs sm:text-sm">{user.lastActive}</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleBlockUser(user.id)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${user.isBlocked
                                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                                }`}
                                        >
                                            {user.isBlocked ? (
                                                <>
                                                    <Ban size={14} />
                                                    Unblock
                                                </>
                                            ) : (
                                                <>
                                                    <Ban size={14} />
                                                    Block
                                                </>
                                            )}
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 text-slate-400 text-sm">
                    Showing {sortedUsers.length} of {users.length} users
                </div>
            </motion.div>
        </div>
    );
};

export default Insights;