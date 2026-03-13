import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
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
import AddProduct from "./Pages/AddProduct"
import Orders from "./Pages/Orders"
import Customers from "./Pages/Customers"
import Inventory from "./Pages/Inventory"
import Payments from "./Pages/Payments"
import Messages from "./Pages/Messages"
import ProductQnA from "./Pages/ProductQnA"
import ContactMessages from "./Pages/ContactMessages"
import Calendar from "./Pages/Calendar"
import ReportsPage from "./Pages/Reports"
import Reviews from "./Pages/Reviews"
import Brands from "./Pages/Brands"
import Categories from "./Pages/Categories"
import Settings from "./Pages/Settings"
import Login from "./Pages/Auth/Login"
import Register from "./Pages/Auth/Register"
import ForgotPassword from "./Pages/Auth/ForgotPassword"
import { Toaster } from 'react-hot-toast';

function App() {
    const { user, loading } = useAuth();
    const [sideBarCollapsed, setSideBarCollapsed] = useState(false)
    const [sideBarOpen, setSideBarOpen] = useState(false)
    const [authPage, setAuthPage] = useState('login'); // 'login', 'register', 'forgot'
    const [hideLayout, setHideLayout] = useState(false);
    const location = useLocation();

    // The old string-based currentpage logic is now derived from the location pathname
    const currentpage = location.pathname.split('/')[1] || "dashboard";

    useEffect(() => {
        const handleToggleLayout = (e) => {
            setHideLayout(!!e.detail);
        };
        window.addEventListener('toggleLayout', handleToggleLayout);
        return () => window.removeEventListener('toggleLayout', handleToggleLayout);
    }, []);

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

    // Update global CSS variable for sidebar width to sync other fixed elements
    useEffect(() => {
        const root = document.documentElement;
        if (sideBarCollapsed) {
            root.style.setProperty('--sidebar-width', '5rem'); // sm:w-20
        } else {
            root.style.setProperty('--sidebar-width', '18rem'); // sm:w-72
        }
    }, [sideBarCollapsed]);

    // Custom event handlers for page change can be replaced/removed later, but keeping for backward compatibility
    useEffect(() => {
        const handlePageChange = (e) => {
            if (e.detail) {
                // Not the best practice, but if other components rely on this event to navigate, 
                // we'd need useHistory. For now, it's better to update those components to use useNavigate.
                // We'll leave the event listener empty or handle via window.location if necessary.
                window.location.hash = e.detail; // Fallback, better to refactor sender
            }
        };
        window.addEventListener('changePage', handlePageChange);
        return () => window.removeEventListener('changePage', handlePageChange);
    }, []);

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
                {!hideLayout && (
                    <Header SidebarCollapsed={sideBarCollapsed} onToggleSidebar={handleToggleSidebar} />
                )}

                <div className={`flex flex-1 overflow-hidden ${hideLayout ? 'h-full' : ''}`}>
                    {!hideLayout && (
                        <>
                            <div
                                className={`fixed inset-0 bg-black/50 z-30 sm:hidden ${sideBarOpen ? 'block' : 'hidden'}`}
                                onClick={() => setSideBarOpen(false)}
                            />

                            <Sidebar
                                collapsed={sideBarCollapsed}
                                mobileOpen={sideBarOpen}
                                onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
                                currentPage={currentpage}
                            />
                        </>
                    )}
                    <div className="flex-1 flex flex-col overflow-hidden border-l border-slate-800">
                        <div className="flex-1 overflow-auto">
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/overview" element={<Overview />} />
                                <Route path="/insights" element={<Insights />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/all-users" element={<AllUsers />} />
                                <Route path="/roles" element={<Roles />} />
                                <Route path="/activity" element={<Activity />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/new" element={<AddProduct />} />
                                <Route path="/products/edit/:id" element={<AddProduct />} />
                                <Route path="/products/view/:id" element={<AddProduct />} />
                                <Route path="/all-products" element={<Products />} />
                                <Route path="/brands" element={<Brands />} />
                                <Route path="/categories" element={<Categories />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/payments" element={<Payments />} />
                                <Route path="/messages" element={<Navigate to="/chats" replace />} />
                                <Route path="/chats" element={<Messages />} />
                                <Route path="/product-qna" element={<ProductQnA />} />
                                <Route path="/contact-messages" element={<ContactMessages />} />
                                <Route path="/calendar" element={<Calendar />} />
                                <Route path="/reports" element={<ReportsPage />} />
                                <Route path="/reviews" element={<Reviews />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<div className="p-6 text-slate-300">Page Not Found</div>} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster 
                position="bottom-right"
                toastOptions={{
                    className: 'toast-premium',
                    duration: 3000,
                    style: {
                        background: '#0b1a2a',
                        color: '#f8fafc',
                        border: '1px solid #1e293b',
                    },
                }}
            />
        </div>
    );
}

export default App
