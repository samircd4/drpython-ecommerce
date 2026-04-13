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
import ReportsPage from "./pages/Reports"
import Reviews from "./pages/Reviews"
import Notifications from "./pages/Notifications"
import Brands from "./pages/Brands"
import Categories from "./pages/Categories"
import Settings from "./pages/Settings"
import WebConfiguration from "./pages/WebConfiguration"
import Coupons from "./pages/Coupons"
import DataManagement from "./pages/DataManagement"

// Customers & Users Detailed Pages
import CustomerView from "./pages/CustomerView"
import CustomerEdit from "./pages/CustomerEdit"
import CustomerAddresses from "./pages/CustomerAddresses"
import UserView from "./pages/UserView"
import UserEdit from "./pages/UserEdit"
import UserAdd from "./pages/UserAdd"
import CustomerAdd from "./pages/CustomerAdd"
import PaymentAdd from "./pages/PaymentAdd"
import AddOrder from "./pages/AddOrder"

import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import ForgotPassword from "./pages/Auth/ForgotPassword"
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./components/Auth/ProtectedRoute"

// Global Modals
import BrandModal from "./components/Product/BrandModal"
import BrandViewModal from "./components/Product/BrandViewModal"
import CategoryModal from "./components/Product/CategoryModal"
import CategoryViewModal from "./components/Product/CategoryViewModal"
import CouponModal from "./components/Coupon/CouponModal"
import GlobalOrderModal from "./components/Layout/GlobalOrderModal"
import AddressModal from "./components/Customers/AddressModal"
import MobileFAB from "./components/Layout/MobileFAB"

const GlobalModals = () => {
    const { modals, closeModal, addressModal, closeAddressModal } = useModals();

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
            <CouponModal
                isOpen={modals.coupon.isOpen}
                onClose={() => closeModal('coupon')}
                coupon={modals.coupon.data?.coupon}
                mode={modals.coupon.data?.mode || 'create'}
                onSave={handleSave}
            />
            <AddressModal
                isOpen={addressModal.isOpen}
                onClose={closeAddressModal}
                address={addressModal.address}
                mode={addressModal.mode}
                onSave={handleSave}
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
                                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                <Route path="/analytics" element={<ProtectedRoute requiredPermission="orders.view_order"><Analytics /></ProtectedRoute>} />
                                <Route path="/overview" element={<ProtectedRoute requiredPermission="orders.view_order"><Overview /></ProtectedRoute>} />
                                <Route path="/insights" element={<ProtectedRoute requiredPermission="orders.view_order"><Insights /></ProtectedRoute>} />
                                
                                <Route path="/users" element={<ProtectedRoute requiredPermission="auth.view_user"><Users /></ProtectedRoute>} />
                                <Route path="/roles" element={<ProtectedRoute requiredPermission="auth.view_user"><Roles /></ProtectedRoute>} />
                                <Route path="/activity" element={<ProtectedRoute requiredPermission="auth.view_user"><Activity /></ProtectedRoute>} />
                                
                                <Route path="/products" element={<ProtectedRoute requiredPermission="products.view_product"><Products /></ProtectedRoute>} />
                                <Route path="/products/new" element={<ProtectedRoute requiredPermission="products.add_product"><AddProduct /></ProtectedRoute>} />
                                <Route path="/products/edit/:id" element={<ProtectedRoute requiredPermission="products.change_product"><AddProduct /></ProtectedRoute>} />
                                <Route path="/products/view/:id" element={<ProtectedRoute requiredPermission="products.view_product"><AddProduct /></ProtectedRoute>} />
                                
                                <Route path="/brands" element={<ProtectedRoute requiredPermission="products.view_brand"><Brands /></ProtectedRoute>} />
                                <Route path="/categories" element={<ProtectedRoute requiredPermission="products.view_category"><Categories /></ProtectedRoute>} />
                                
                                <Route path="/orders" element={<ProtectedRoute requiredPermission="orders.view_order"><Orders /></ProtectedRoute>} />
                                <Route path="/orders/add" element={<ProtectedRoute requiredPermission="orders.add_order"><AddOrder /></ProtectedRoute>} />
                                <Route path="/customers" element={<ProtectedRoute requiredPermission="accounts.view_customer"><Customers /></ProtectedRoute>} />
                                <Route path="/addresses" element={<ProtectedRoute requiredPermission="accounts.view_customer"><CustomerAddresses /></ProtectedRoute>} />
                                <Route path="/customers/new" element={<ProtectedRoute requiredPermission="accounts.add_customer"><CustomerAdd /></ProtectedRoute>} />
                                <Route path="/inventory" element={<ProtectedRoute requiredPermission="products.change_product"><Inventory /></ProtectedRoute>} />
                                <Route path="/payments" element={<ProtectedRoute requiredPermission="orders.view_payment"><Payments /></ProtectedRoute>} />
                                <Route path="/payments/new" element={<ProtectedRoute requiredPermission="orders.add_payment"><PaymentAdd /></ProtectedRoute>} />
                                
                                <Route path="/messages" element={<Navigate to="/chats" replace />} />
                                <Route path="/chats" element={<ProtectedRoute requiredPermission="accounts.view_customer"><Messages /></ProtectedRoute>} />
                                <Route path="/product-qna" element={<ProtectedRoute requiredPermission="accounts.view_customer"><ProductQnA /></ProtectedRoute>} />
                                <Route path="/contact-messages" element={<ProtectedRoute requiredPermission="accounts.view_customer"><ContactMessages /></ProtectedRoute>} />
                                
                                <Route path="/reports" element={<ProtectedRoute requiredPermission="orders.view_order"><ReportsPage /></ProtectedRoute>} />
                                <Route path="/reviews" element={<ProtectedRoute requiredPermission="reviews.view_review"><Reviews /></ProtectedRoute>} />
                                <Route path="/coupons" element={<ProtectedRoute requiredPermission="orders.view_coupon"><Coupons /></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                <Route path="/web-config" element={<ProtectedRoute requiredPermission="web.view_storeconfiguration"><WebConfiguration /></ProtectedRoute>} />
                                <Route path="/notifications" element={<ProtectedRoute requiredPermission="auth.view_user"><Notifications /></ProtectedRoute>} />

                                {/* Customer Detailed Views */}
                                <Route path="/customers/view/:id" element={<ProtectedRoute requiredPermission="accounts.view_customer"><CustomerView /></ProtectedRoute>} />
                                <Route path="/customers/edit/:id" element={<ProtectedRoute requiredPermission="accounts.change_customer"><CustomerEdit /></ProtectedRoute>} />

                                {/* User Detailed Views */}
                                <Route path="/users/view/:id" element={<ProtectedRoute requiredPermission="auth.view_user"><UserView /></ProtectedRoute>} />
                                <Route path="/users/edit/:id" element={<ProtectedRoute requiredPermission="auth.view_user"><UserEdit /></ProtectedRoute>} />
                                <Route path="/users/add" element={<ProtectedRoute requiredPermission="auth.view_user"><UserAdd /></ProtectedRoute>} />
                                <Route path="*" element={<div className="p-6 text-slate-300">Page Not Found</div>} />
                                <Route path="/export-import" element={<ProtectedRoute requiredPermission="products.export_import"><DataManagement /></ProtectedRoute>} />
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
import { StatsProvider } from "./Context/StatsContext"
import { NotificationProvider } from "./Context/NotificationContext"

function App() {
    return (
        <ModalProvider>
            <ChatProvider>
                <NotificationProvider>
                    <StatsProvider>
                        <AppContent />
                    </StatsProvider>
                </NotificationProvider>
            </ChatProvider>
        </ModalProvider>
    )
}

export default App;
