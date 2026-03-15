import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState({
        brand: { isOpen: false, data: null },
        category: { isOpen: false, data: null },
        product: { isOpen: false, data: null }, // Product is usually a page, but adding for completeness
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

    return (
        <ModalContext.Provider value={{ modals, openModal, closeModal }}>
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
