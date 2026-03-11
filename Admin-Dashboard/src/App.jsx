import { useState } from "react"
import { useAuth } from "./Context/AuthContext"
import Header from "./Components/Layout/Header"
import Sidebar from "./Components/Layout/Sidebar"
import Dashboard from "./Pages/Dashboard"
import Analytics from "./Pages/Analytics"
import Overview from "./Pages/Overview"
import Insights from "./Pages/Insights"
import Users from "./Pages/Users"
import AllUsers from "./Pages/AllUsers"
import Roles from "./Pages/Roles"
import Activity from "./Pages/Activity"
import Products from "./Pages/Products"
import Orders from "./Pages/Orders"
import Customers from "./Pages/Customers"
import Inventory from "./Pages/Inventory"
import Transactions from "./Pages/Transactions"
import Messages from "./Pages/Messages"
import Calendar from "./Pages/Calendar"
import ReportsPage from "./Pages/Reports"
import Reviews from "./Pages/Reviews"
import Brands from "./Pages/Brands"
import Categories from "./Pages/Categories"
import Settings from "./Pages/Settings"
import Login from "./Pages/Auth/Login"
import Register from "./Pages/Auth/Register"
import ForgotPassword from "./Pages/Auth/ForgotPassword"

function App() {
    const { user, loading } = useAuth();
    const [sideBarCollapsed, setSideBarCollapsed] = useState(false)
    const [sideBarOpen, setSideBarOpen] = useState(false)
    const [currentpage, setCurrentPage] = useState("dashboard")
    const [authPage, setAuthPage] = useState('login'); // 'login', 'register', 'forgot'

    const handleToggleSidebar = () => {
        try {
            if (window.innerWidth < 640) {
                setSideBarOpen((v) => !v);
            } else {
                setSideBarCollapsed((v) => !v);
            }
        } catch (e) {
            setSideBarCollapsed((v) => !v);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#071229] flex items-center justify-center text-blue-500">Loading...</div>;
    }

    if (!user) {
        if (authPage === 'register') return <Register setAuthPage={setAuthPage} />;
        if (authPage === 'forgot') return <ForgotPassword setAuthPage={setAuthPage} />;
        return <Login setAuthPage={setAuthPage} />;
    }

    return (
        <div className="min-h-screen bg-[#071229] transition-all duration-500 text-slate-200">
            <div className="flex flex-col h-screen">
                <Header SidebarCollapsed={sideBarCollapsed} onToggleSidebar={handleToggleSidebar} />

                <div className="flex flex-1 overflow-hidden">
                    <div
                        className={`fixed inset-0 bg-black/50 z-30 sm:hidden ${sideBarOpen ? 'block' : 'hidden'}`}
                        onClick={() => setSideBarOpen(false)}
                    />

                    <Sidebar
                        collapsed={sideBarCollapsed}
                        mobileOpen={sideBarOpen}
                        onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
                        currentPage={currentpage}
                        onPageChange={(id) => { setCurrentPage(id); }}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden border-l border-slate-800">
                        <div className="flex-1 overflow-auto">
                            {(() => {
                                const pages = {
                                    dashboard: Dashboard,
                                    analytics: Analytics,
                                    overview: Overview,
                                    insights: Insights,
                                    users: Users,
                                    "all-users": AllUsers,
                                    roles: Roles,
                                    activity: Activity,
                                    products: Products,
                                    "all-products": Products,
                                    brands: Brands,
                                    categories: Categories,
                                    orders: Orders,
                                    customers: Customers,
                                    inventory: Inventory,
                                    transactions: Transactions,
                                    messages: Messages,
                                    calendar: Calendar,
                                    reports: ReportsPage,
                                    reviews: Reviews,
                                    settings: Settings,
                                };

                                const Page = pages[currentpage] || (() => <div className="p-6 text-slate-300">Page: {currentpage}</div>);
                                return <Page />;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App
