import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState({
        brand: { isOpen: false, data: null },
        category: { isOpen: false, data: null },
        product: { isOpen: false, data: null },
        coupon: { isOpen: false, data: null },
    });

    const [orderModal, setOrderModal] = useState({
        isOpen: false,
        order: null,
        mode: 'view'
    });

    const [addressModal, setAddressModal] = useState({
        isOpen: false,
        address: null,
        mode: 'view'
    });

    const openModal = (type, data = null) => {
        setModals(prev => ({
            ...prev,
            [type]: { isOpen: true, data }
        }));
    };

    const closeModal = (type) => {
        setModals(prev => ({
            ...prev,
            [type]: { isOpen: false, data: null }
        }));
    };

    const openOrderModal = (order, mode = 'view') => {
        setOrderModal({ isOpen: true, order, mode });
    };

    const closeOrderModal = () => {
        setOrderModal(prev => ({ ...prev, isOpen: false }));
    };

    const openAddressModal = (address, mode = 'view') => {
        setAddressModal({ isOpen: true, address, mode });
    };

    const closeAddressModal = () => {
        setAddressModal(prev => ({ ...prev, isOpen: false }));
    };

    const setOrderModalMode = (mode) => {
        setOrderModal(prev => ({ ...prev, mode }));
    };

    return (
        <ModalContext.Provider value={{ 
            modals, 
            openModal, 
            closeModal, 
            orderModal, 
            openOrderModal, 
            closeOrderModal,
            addressModal,
            openAddressModal,
            closeAddressModal,
            setOrderModalMode
        }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModals = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModals must be used within a ModalProvider');
    }
    return context;
};
