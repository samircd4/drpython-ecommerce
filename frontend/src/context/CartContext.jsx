import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { BASE_URL } from "../api/client";
import React from 'react'

export const CartContext = createContext(null)

// BASE_URL is e.g. "http://localhost:8000/api" – media files live one level up
const MEDIA_BASE = BASE_URL.replace(/\/api\/?$/, '');

export const fixImage = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    // img is a relative path like /media/products/foo.jpg
    return `${MEDIA_BASE}${img}`;
}

export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage
    const [cartItem, setCartItem] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cartItems");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            return [];
        }
    });

    // Fetch cart from API on mount if logged in
    const refreshCart = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const response = await api.get('/cart/');
            if (response.data && response.data.items) {
                const mappedItems = response.data.items.map(item => ({
                    ...item.product,
                    variant: item.variant ? { ...item.variant } : undefined,
                    cart_item_id: item.id,
                    quantity: item.quantity,
                    image: fixImage(item.product.image)
                }));
                setCartItem(mappedItems);
                localStorage.setItem("cartItems", JSON.stringify(mappedItems));
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    // Save to localStorage whenever cartItem changes
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItem));
    }, [cartItem]);

    const addToCart = async (product) => {
        const token = localStorage.getItem("access_token");

        // Optimistic update
        let updatedCart;
        const itemInCart = cartItem.find((item) => {
            const a = item.id === product.id;
            const b = (item.variant?.id ?? null) === (product.variant?.id ?? null);
            return a && b;
        });

        if (itemInCart) {
            updatedCart = cartItem.map((item) => {
                const same = item.id === product.id && (item.variant?.id ?? null) === (product.variant?.id ?? null);
                return same ? { ...item, quantity: item.quantity + 1 } : item;
            });
            toast.success("Product quantity increased!")
        } else {
            updatedCart = [...cartItem, { ...product, quantity: 1, image: fixImage(product.image) }];
            toast.success("Product is added to cart!")
        }
        setCartItem(updatedCart);

        // Sync with API if logged in
        if (token) {
            try {
                const response = await api.post('/cart-items/', {
                    product_id: product.id,
                    variant_id: product.variant?.id,
                    quantity: 1
                });

                // If new item, update with cart_item_id
                if (!itemInCart && response.data) {
                    const cartItemId = response.data.id;
                    setCartItem(prev => prev.map(item =>
                        (item.id === product.id && (item.variant?.id ?? null) === (product.variant?.id ?? null))
                            ? { ...item, cart_item_id: cartItemId }
                            : item
                    ));
                }
            } catch (error) {
                console.error("Error adding to cart:", error);
                // Optionally revert changes or show error toast
            }
        }
    }

    const updateQuantity = async (productId, action, value, variantId = null) => {
        const token = localStorage.getItem("access_token");

        // Find item to check current quantity and cart_item_id
        const item = cartItem.find(i => i.id === productId && (i.variant?.id ?? null) === (variantId ?? null));
        if (!item) return;

        let newQuantity = item.quantity;
        if (action === "increase") {
            newQuantity = newQuantity + 1;
            toast.success("Quantity increased!");
        } else if (action === "decrease") {
            newQuantity = newQuantity - 1;
            if (newQuantity < 1) {
                toast.error('Minimum Quantity is 1')

                return;
            }
            toast.success("Quantity decreased!");
        } else if (action === "set") {
            const q = Number(value) || 1;
            newQuantity = q < 1 ? 1 : q;
        }



        // Optimistic update
        setCartItem(prev => prev.map(i => {
            const same = i.id === productId && (i.variant?.id ?? null) === (variantId ?? null);
            return same ? { ...i, quantity: newQuantity } : i;
        }));

        // API sync
        if (token && item.cart_item_id) {
            try {
                await api.put(`/cart-items/${item.cart_item_id}/`, {
                    product_id: item.id,
                    variant_id: item.variant?.id,
                    quantity: newQuantity
                });
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        }
    }

    const deleteItem = async (productId, variantId = null) => {
        const token = localStorage.getItem("access_token");
        const item = cartItem.find(i => i.id === productId && (i.variant?.id ?? null) === (variantId ?? null));

        // Optimistic update
        setCartItem(prev => prev.filter(i => !(i.id === productId && (i.variant?.id ?? null) === (variantId ?? null))));
        toast.success("Product removed from cart!");

        // API sync
        if (token && item?.cart_item_id) {
            try {
                await api.delete(`/cart-items/${item.cart_item_id}/`);
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    }

    const syncLocalCartToServer = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const server = await api.get('/cart/');
            const serverItems = Array.isArray(server.data?.items) ? server.data.items : [];
            const serverMap = {};
            serverItems.forEach(si => {
                const pid = si.product?.id;
                const vid = si.variant?.id ?? null;
                if (pid != null) {
                    serverMap[`${pid}:${vid}`] = { cart_item_id: si.id, quantity: si.quantity };
                }
            });
            for (const li of cartItem) {
                const pid = li.id;
                const vid = li.variant?.id ?? null;
                const qty = li.quantity || 1;
                if (serverMap[`${pid}:${vid}`]) {
                    const current = serverMap[`${pid}:${vid}`];
                    if (current.quantity !== qty) {
                        await api.put(`/cart-items/${current.cart_item_id}/`, {
                            product_id: pid,
                            variant_id: vid || undefined,
                            quantity: qty
                        });
                    }
                } else {
                    await api.post('/cart-items/', {
                        product_id: pid,
                        variant_id: vid || undefined,
                        quantity: qty
                    });
                }
            }
            await refreshCart();
        } catch (err) {
            console.error("Error syncing local cart to server:", err);
        }
    };

    const clearCart = async () => {
        setCartItem([]);
        localStorage.removeItem("cartItems");
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                // Assuming we don't have a direct clear endpoint, 
                // we can just refresh the cart from server which will be empty if we handled it there
                // or just leave it for now since most users will place order and backend handles it.
                // But if backend doesn't handle items_input by clearing cart, we might need a clear endpoint.
                // For now, let's just clear locally as requested.
            } catch (err) {
                console.error("Error clearing cart:", err);
            }
        }
    };

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return <CartContext.Provider value={{
        cartItem,
        setCartItem,
        addToCart,
        updateQuantity,
        deleteItem,
        refreshCart,
        clearCart,
        syncLocalCartToServer,
        isCartOpen,
        setIsCartOpen,
        isFilterOpen,
        setIsFilterOpen,
        isCategoryOpen,
        setIsCategoryOpen,
        isDrawerOpen,
        setIsDrawerOpen
    }}>
        {children}
    </CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
