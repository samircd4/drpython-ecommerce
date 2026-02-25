// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ResponsiveMenu from './ResponsiveMenu';
import { ToastContainer } from 'react-toastify';

const Layout = () => (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
        <Header />
        <main className="flex-grow sm:p-4 pb-20 md:pb-4 mt-20">
            <Outlet /> {/* This is where nested routes will render */}
        </main>
        <Footer />
        <ResponsiveMenu />
        {/* Global Toasts */}
        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
    </div>
);

export default Layout;