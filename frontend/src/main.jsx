// import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import './styles/toastify-overrides.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Root = () => {
    const content = (
        <UserProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </UserProvider>
    );

    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {content}
            </GoogleOAuthProvider>
        );
    }

    return content;
};

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
    <HelmetProvider>
        <Root />
    </HelmetProvider>
);
