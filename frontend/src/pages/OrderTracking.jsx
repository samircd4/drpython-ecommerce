import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaBoxOpen, FaTruck, FaCheckCircle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../api/client';
import TakaIcon from '../components/TakaIcon';

const CountdownTimer = ({ targetDate, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) return null;

        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (!left) {
                clearInterval(timer);
                onComplete?.();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
            <FaClock className="animate-pulse" />
            <span>Review unlocks in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
        </div>
    );
};

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trackingResult, setTrackingResult] = useState(null);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchTracking = useCallback(async (searchId) => {
        const targetId = searchId || orderId;
        if (!targetId || !targetId.toString().trim()) {
            setError('Please enter a valid Order ID.');
            return;
        }

        setIsLoading(true);
        setError(null);
        // Don't clear trackingResult here to avoid flickering when refreshing for countdown

        try {
            const response = await api.get(`/orders/${targetId}/`);
            const order = response.data;

            const createdDate = new Date(order.created_at || order.created || Date.now());
            const deliveryDate = new Date(createdDate);
            deliveryDate.setDate(createdDate.getDate() + 3);

            const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
            const formatEstDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const status = (order.status || '').toLowerCase();
            const steps = [
                { title: 'Order Placed', date: formatDate(createdDate), completed: true, icon: FaBoxOpen },
                { title: 'Processing', date: 'In Progress', completed: false, icon: FaCheckCircle },
                { title: 'Shipped', date: 'Pending', completed: false, icon: FaTruck },
                { title: 'Delivered', date: 'Estimated', completed: false, icon: FaMapMarkerAlt },
            ];

            if (status.includes('confirmed') || status.includes('processing') || status.includes('shipped') || status.includes('delivered') || status.includes('out')) {
                steps[1].completed = true;
                steps[1].date = 'Completed';
            }
            if (status.includes('shipped') || status.includes('delivered') || status.includes('out')) {
                steps[2].completed = true;
                steps[2].date = 'Shipped';
            }
            if (status.includes('delivered')) {
                steps[3].completed = true;
                steps[3].date = 'Delivered';
            }

            if (status.includes('cancelled')) {
                setError('This order has been cancelled.');
                setIsLoading(false);
                return;
            }

            // Calculate review unlock time: updated_at + 24 hours
            const updatedTime = new Date(order.updated_at || order.created_at);
            const unlockTime = new Date(updatedTime.getTime() + 24 * 60 * 60 * 1000);
            const now = new Date();
            const canReview = status.includes('delivered') && now >= unlockTime;

            setTrackingResult({
                id: order.id,
                status: order.status,
                estimatedDelivery: formatEstDate(deliveryDate),
                steps: steps,
                items: order.items || order.order_items || [],
                totalAmount: order.total_amount || order.total,
                updatedAt: updatedTime,
                unlockTime: unlockTime,
                canReview: canReview
            });

        } catch (err) {
            console.error("Order tracking error:", err);
            if (err.response && err.response.status === 404) {
                setError('Order not found. Please check the ID.');
            } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Access denied. You may need to log in to track this order.');
            } else {
                setError('Failed to track order. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (id) {
            setOrderId(id);
            fetchTracking(id);
        }
    }, [id, fetchTracking, refreshTrigger]);

    const handleTrack = (e) => {
        e.preventDefault();
        fetchTracking();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/50"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Track Your Order
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Enter your order ID to see the current status.
                        </p>
                    </div>

                    <form onSubmit={handleTrack} className="space-y-6 relative">
                        <div className="relative group">
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Order ID (e.g. 45)"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:bg-white group-hover:shadow-md"
                            />
                            <div className="absolute inset-y-0 right-0 p-4 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Track Order"
                            )}
                        </motion.button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-500 text-center mt-4 text-sm bg-red-50 py-2 rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {trackingResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-md mt-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6"
                    >
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Order {trackingResult.id}</h3>
                                <p className="text-purple-600 font-medium text-sm">{trackingResult.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Est. Delivery</p>
                                <p className="text-sm font-bold text-gray-700">{trackingResult.estimatedDelivery}</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {trackingResult.steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 z-10 transition-colors duration-300 ${step.completed ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200' : 'bg-white border-gray-300'}`}>
                                            <Icon className={`w-4 h-4 ${step.completed ? 'text-white' : 'text-gray-300'}`} />
                                        </div>
                                        <div className="ml-6 w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] md:ml-0 md:px-6">
                                            <div className="flex flex-col">
                                                <h4 className={`font-bold text-sm ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</h4>
                                                <span className="text-xs text-gray-400">{step.date}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Order Items & Total */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-10 pt-6 border-t border-gray-100"
                        >
                            <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Order Items</h4>
                            <div className="space-y-6">
                                {trackingResult.items && trackingResult.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                                {item.product.image ? (
                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <FaBoxOpen />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                                                <div className="flex text-xs text-gray-500 mt-0.5 space-x-2 font-sans font-medium">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.color && <span>• {item.color}</span>}
                                                    {item.storage && <span>• {item.storage}GB</span>}
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1 whitespace-nowrap">
                                                <TakaIcon size={14} />
                                                {parseFloat(item.price || 0).toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Per-item Review Logic */}
                                        {trackingResult.status.toLowerCase().includes('delivered') && (
                                            <div className="flex justify-end pt-1">
                                                {trackingResult.canReview ? (
                                                    <button
                                                        onClick={() => navigate(`/products/${item.product.slug || item.product}/?tab=reviews`)}
                                                        className="w-full sm:w-auto text-xs font-bold bg-white text-purple-600 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all shadow-sm cursor-pointer hover:shadow-md transform active:scale-95"
                                                    >
                                                        Review Product
                                                    </button>
                                                ) : (
                                                    <CountdownTimer
                                                        targetDate={trackingResult.unlockTime}
                                                        onComplete={() => setRefreshTrigger(prev => prev + 1)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="font-medium text-gray-600">Total Amount</span>

                                <div className="flex items-center gap-1 text-xl font-bold text-purple-600 whitespace-nowrap">
                                    <TakaIcon size={20} />
                                    {parseFloat(trackingResult.totalAmount).toFixed(2)}
                                </div>
                            </div>

                            <div className="mt-8">
                                {!trackingResult.canReview ? (
                                    <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm border border-blue-100 text-center font-medium">
                                        <p>You can provide a review 24 hours after delivery.</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-xs text-gray-400 font-medium">
                                        <p>Order ID: {trackingResult.id}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderTracking;
