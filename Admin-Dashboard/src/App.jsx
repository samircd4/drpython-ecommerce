import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./Context/AuthContext"
import { ModalProvider, useModals } from "./Context/ModalContext"
import Header from "./components/Layout/Header"
import Sidebar from "./components/Layout/Sidebar"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import Overview from "./pages/Overview"
import Insights from "./pages/Insights"
import Users from "./pages/Users"
import AllUsers from "./pages/AllUsers"
import Roles from "./pages/Roles"
import Activity from "./pages/Activity"
import Products from "./pages/Products"
import AddProduct from "./pages/AddProduct"
import Orders from "./pages/Orders"
import Customers from "./pages/Customers"
import Inventory from "./pages/Inventory"
import Payments from "./pages/Payments"
import Messages from "./pages/Messages"
import ProductQnA from "./pages/ProductQnA"
import ContactMessages from "./pages/ContactMessages"
import Calendar from "./pages/Calendar"
import ReportsPage from "./pages/Reports"
import Reviews from "./pages/Reviews"
import Brands from "./pages/Brands"
import Categories from "./pages/Categories"
import Settings from "./pages/Settings"
import Coupons from "./pages/Coupons"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import ForgotPassword from "./pages/Auth/ForgotPassword"
import { Toaster } from 'react-hot-toast';

// Global Modals
import BrandModal from "./components/Product/BrandModal"
import BrandViewModal from "./components/Product/BrandViewModal"
import CategoryModal from "./components/Product/CategoryModal"
import CategoryViewModal from "./components/Product/CategoryViewModal"
import GlobalOrderModal from "./components/Layout/GlobalOrderModal"
import MobileFAB from "./components/Layout/MobileFAB"

const GlobalModals = () => {
    const { modals, closeModal } = useModals();

    const handleSave = () => {
        // Dispatch a global event to refresh data on the current page
        window.dispatchEvent(new CustomEvent('refreshData'));
    };

    return (
        <>
            <BrandModal 
                isOpen={modals.brand.isOpen} 
                onClose={() => closeModal('brand')} 
                brand={modals.brand.data} 
                onSave={handleSave}
            />
            {/* View modal doesn't need data refresh usually */}
            <BrandViewModal 
                isOpen={modals.brandView?.isOpen} 
                onClose={() => closeModal('brandView')} 
                brand={modals.brandView?.data} 
            />
            <CategoryModal 
                isOpen={modals.category.isOpen} 
                onClose={() => closeModal('category')} 
                category={modals.category.data} 
                onSave={handleSave}
            />
            <CategoryViewModal 
                isOpen={modals.categoryView?.isOpen} 
                onClose={() => closeModal('categoryView')} 
                category={modals.categoryView?.data} 
            />
            <GlobalOrderModal />
        </>
    );
};

function AppContent() {
    const { user, loading } = useAuth();
    const [sideBarCollapsed, setSideBarCollapsed] = useState(false)
    const [sideBarOpen, setSideBarOpen] = useState(false)
    const [authPage, setAuthPage] = useState('login'); 
    const [hideLayout, setHideLayout] = useState(false);
    const location = useLocation();

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

    useEffect(() => {
        const root = document.documentElement;
        if (sideBarCollapsed) {
            root.style.setProperty('--sidebar-width', '5rem');
        } else {
            root.style.setProperty('--sidebar-width', '18rem');
        }
    }, [sideBarCollapsed]);

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
                                <Route path="/coupons" element={<Coupons />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<div className="p-6 text-slate-300">Page Not Found</div>} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
            <GlobalModals />
            <MobileFAB />
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

import { ChatProvider } from "./Context/ChatContext"

function App() {
    return (
        <ModalProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </ModalProvider>
    )
}

export default App;
