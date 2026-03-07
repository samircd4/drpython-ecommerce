// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Account from './pages/Account';
import OrderSuccess from './pages/OrderSuccess';
import CategoryPage from './pages/CategoryPage';
import Dashboard from './pages/Dashboard';
import Terms from './pages/Terms';
import OrderTracking from './pages/OrderTracking';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Team from './pages/Team';
import TeamMemberDetails from './pages/TeamMemberDetails';



const App = () => (
    <Router>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="team" element={<Team />} />
                <Route path="team/:id" element={<TeamMemberDetails />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="brand/:slug" element={<CategoryPage />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="contact" element={<Contact />} />
                <Route path="account" element={<Account />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="password-reset-confirm" element={<ResetPassword />} />
                <Route path="verify-email" element={<EmailVerification />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="order-success" element={<OrderSuccess />} />
                <Route path="order-tracking/:id?" element={<OrderTracking />} />
                <Route path="terms" element={<Terms />} />
            </Route>

        </Routes>
    </Router>
);

export default App;
