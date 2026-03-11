import {
    BarChart3,
    Calendar,
    ChevronDown,
    CreditCard,
    FileText,
    LayoutDashboard,
    MessageSquare,
    Package,
    User,
    Settings,
    ShoppingBag,
    Users,
    Circle,
    Activity,
    TrendingUp,
    Star,
} from "lucide-react";
import { useEffect, useState } from "react";

const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", active: true, badge: "New" },
    { id: "analytics", icon: BarChart3, label: "Analytics", submenu: [{ id: "overview", label: "Overview", icon: BarChart3 }, { id: "reports", label: "Reports", icon: FileText }, { id: "insights", label: "Insights", icon: TrendingUp }] },
    { id: "users", icon: Users, label: "Users", count: "2.4k", submenu: [{ id: "all-users", label: "All-Users", icon: Users }, { id: "roles", label: "Roles & Permissions", icon: Settings }, { id: "activity", label: "User Activity", icon: Activity }] },
    {
        id: "products",
        icon: Package,
        label: "Products",
        submenu: [
            { id: "all-products", label: "All Products", icon: Package },
            { id: "brands", label: "Brands", icon: Star },
            { id: "categories", label: "Categories", icon: Activity }
        ]
    },
    { id: "orders", icon: ShoppingBag, label: "Orders" },
    { id: "customers", icon: Users, label: "Customers" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "inventory", icon: Package, label: "Inventory", count: "847" },
    { id: "transactions", icon: CreditCard, label: "Transactions" },
    { id: "messages", icon: MessageSquare, label: "Messages", badge: "12" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "settings", icon: Settings, label: "Settings" },
];

const Sidebar = ({ collapsed, mobileOpen = false, onToggle, currentPage, onPageChange }) => {
    const [expandedItems, setExpandedItems] = useState(new Set(["analytics"]));
    const anyOpen = expandedItems && expandedItems.size > 0;
    const [hideScrollbar, setHideScrollbar] = useState(false);

    useEffect(() => {
        if (anyOpen) {
            setHideScrollbar(true);
            return;
        }
        const t = setTimeout(() => setHideScrollbar(false), 340);
        return () => clearTimeout(t);
    }, [anyOpen]);

    const toggleExpanded = (itemid) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemid)) newExpanded.delete(itemid);
        else newExpanded.add(itemid);
        setExpandedItems(newExpanded);
    };

    // On small screens the sidebar becomes a slide-over overlay (no page shift).
    // `mobileOpen` controls visibility on small screens; `collapsed` controls desktop width.
    const mobileTransform = mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0';
    // base width for mobile when visible, and sm: widths for desktop collapsed/expanded
    const baseWidth = 'w-72';
    const smWidth = collapsed ? 'sm:w-20' : 'sm:w-72';

    const showLabels = !collapsed || mobileOpen;

    return (
        <div
            className={`${mobileTransform} ${baseWidth} ${smWidth} fixed sm:relative left-0 top-12 sm:top-0 bottom-0 sm:inset-y-0 z-40 transform transition-all duration-500 ease-in-out backdrop-blur-xl flex flex-col`}
            style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}
        >
            {/* Navigation */}
            <nav className={`flex-1 px-4 py-2 space-y-1 overflow-y-auto ${hideScrollbar ? 'no-scrollbar' : ''}`}>
                {menuItems.map((item) => (
                    <div key={item.id}>
                        <button
                            onClick={() => {
                                if (item.submenu) toggleExpanded(item.id);
                                else onPageChange(item.id);
                                // keep mobile overlay open; closing is handled only by backdrop or menu button
                            }}
                            className={`w-full flex items-center cursor-pointer justify-between p-3 rounded-xl transition-all duration-200 ${currentPage === item.id || item.active ? 'text-slate-100 shadow-lg shadow-black/30' : 'text-slate-300 hover:bg-slate-800'}`}
                            style={currentPage === item.id || item.active ? { backgroundImage: 'linear-gradient(90deg,var(--accent-1),var(--accent-2))' } : undefined}
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon className="w-5 h-5 text-slate-300" />
                                {showLabels && (
                                    <>
                                        <span className="font-medium ml-2">{item.label}</span>
                                        {item.badge && <span className="px-2 py-1 text-xs bg-red-600 text-slate-100 rounded-full">{item.badge}</span>}
                                        {item.count && <span className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded-full">{item.count}</span>}
                                    </>
                                )}
                            </div>

                            {showLabels && item.submenu && (
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : 'rotate-0'}`} />
                            )}
                        </button>

                        {/* Sub Menus - animated via max-height + per-item transitions, no scrollbar inside */}
                        {showLabels && item.submenu && (
                            <div
                                className="ml-2 mt-2 space-y-1 overflow-hidden transition-all duration-300"
                                style={{ maxHeight: expandedItems.has(item.id) ? `${item.submenu.length * 44}px` : '0px' }}
                            >
                                {item.submenu.map((subitem, idx) => (
                                    <button
                                        key={subitem.id}
                                        className={`w-full cursor-pointer text-left p-2 text-sm text-slate-300 rounded-lg transition-all transform ${expandedItems.has(item.id) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} hover:bg-slate-800 flex items-center`}
                                        style={{ transitionDelay: expandedItems.has(item.id) ? `${idx * 30}ms` : '0ms' }}
                                        onClick={() => { onPageChange(subitem.id); /* keep overlay open */ }}
                                    >
                                        {subitem.icon ? (
                                            <subitem.icon className="w-4 h-4 text-slate-400 mr-3" />
                                        ) : (
                                            <Circle className="w-3 h-3 text-slate-400 mr-3" />
                                        )}
                                        <span>{subitem.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-transparent cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-[#184a6a] flex items-center justify-center text-slate-200">
                        <User className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-100 truncate">Sarker Shop</p>
                            <p className="text-xs text-slate-300">Administrator</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
