import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, fixImage } from '../context/CartContext.jsx'
import { Link } from 'react-router-dom'
import EmptyCart from './cart/EmptyCart'
import TakaIcon from './TakaIcon'
import { FaTrash } from "react-icons/fa";

const CartPanel = ({ open, onClose }) => {
    const { cartItem, updateQuantity, deleteItem } = useCart()
    const navigate = useNavigate()
    const [showPanel, setShowPanel] = useState(false)
    const [animationClass, setAnimationClass] = useState('')

    useEffect(() => {
        if (open) {
            setShowPanel(true)
            setAnimationClass('animate-slide-in-right')
            // Lock global scrolling
            document.documentElement.style.overflow = 'hidden'
        } else {
            setAnimationClass('animate-slide-out-right')
            const t = setTimeout(() => setShowPanel(false), 300)
            // Unlock global scrolling
            document.documentElement.style.overflow = 'unset'
            return () => clearTimeout(t)
        }
    }, [open])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.documentElement.style.overflow = 'unset'
        }
    }, [])

    const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

    if (!showPanel) return null

    return (
        <div className="fixed inset-0 z-[70]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
            <div className={`absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl border-l border-gray-200 overflow-hidden flex flex-col ${animationClass}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
                    <h2 className="text-lg font-semibold">Your Cart</h2>
                    <button onClick={onClose} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer">Close</button>
                </div>
                <div className="flex flex-col flex-1 overflow-hidden bg-neutral-50/30">
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                        {cartItem.length === 0 && (
                            <div className="py-10">
                                <EmptyCart
                                    compact={true}
                                    buttonText="GO TO SHOP"
                                    description="Your cart is waiting for some amazing products!"
                                    onClick={onClose}
                                />
                            </div>
                        )}
                        {cartItem.map((item) => (
                            <div
                                key={`${item.id}:${item.variant?.id ?? "base"}`}
                                className="flex gap-4 border border-purple-100 bg-purple-50/40 rounded-xl p-4 hover:shadow-md hover:border-purple-200 transition-all duration-200"
                            >
                                {/* Product Image */}
                                <img
                                    src={fixImage(item.image)}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg border border-purple-100"
                                />

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">

                                    {/* Top Row */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 leading-snug">
                                                <Link
                                                    to={`/products/${item.slug}`}
                                                    className="hover:text-purple-600 transition-colors"
                                                >
                                                    {item.name}
                                                </Link>
                                            </h4>

                                            {item.variant && (
                                                <p className="text-xs text-purple-600/70 mt-1">
                                                    {item.variant?.color ?? ""}
                                                    {item.variant?.ram ? ` • ${item.variant.ram}GB` : ""}
                                                    {item.variant?.storage ? ` / ${item.variant.storage}GB` : ""}
                                                </p>
                                            )}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteItem(item.id, item.variant?.id ?? null)}
                                            className="p-2 rounded-full text-purple-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                            aria-label="Remove item"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="flex items-center justify-between mt-3">

                                        {/* Price */}
                                        <span className="flex items-baseline gap-1 text-lg font-extrabold text-purple-700 whitespace-nowrap">
                                            <TakaIcon size={14} />
                                            {item.price}
                                        </span>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-purple-200 rounded-lg overflow-hidden bg-white">
                                            <button
                                                aria-label="Decrease quantity"
                                                className="px-3 py-1 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                                                onClick={() =>
                                                    updateQuantity(item.id, "decrease", undefined, item.variant?.id ?? null)
                                                }
                                            >
                                                −
                                            </button>

                                            <span className="px-3 text-sm font-semibold text-gray-800">
                                                {item.quantity}
                                            </span>

                                            <button
                                                aria-label="Increase quantity"
                                                className="px-3 py-1 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                                                onClick={() =>
                                                    updateQuantity(item.id, "increase", undefined, item.variant?.id ?? null)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {cartItem.length > 0 && (
                        <div className="border-t p-4 sticky bottom-0 bg-white shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-700 font-medium">
                                    Subtotal
                                </span>

                                <span className="flex items-baseline gap-1 whitespace-nowrap text-gray-900 font-semibold">
                                    <TakaIcon size={14} />
                                    {subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-2 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer text-xs sm:text-sm font-semibold whitespace-nowrap"
                                    onClick={() => { onClose(); navigate('/cart'); }}
                                >
                                    View Cart
                                </button>
                                <button
                                    className="flex-1 px-2 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer text-xs sm:text-sm font-semibold whitespace-nowrap"
                                    onClick={() => { onClose(); navigate('/checkout'); }}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CartPanel
