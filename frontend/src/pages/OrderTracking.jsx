import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Search, 
    Package, 
    Truck, 
    CheckCircle2, 
    MapPin, 
    Clock, 
    Bell, 
    ChevronRight, 
    ArrowLeft,
    Box,
    ShoppingCart,
    ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../api/client';
import TakaIcon from '../components/TakaIcon';
import useWebSocket from '../hooks/useWebSocket';

// --- Components ---

const AuroraBackground = () => (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-200/40 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-200/30 blur-[100px] animate-bounce duration-[10s]" />
    </div>
);

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
        <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 uppercase tracking-wider">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Review unlocks in {timeLeft.hours}h {timeLeft.minutes}m</span>
        </div>
    );
};

// --- Progress Step Component ---
const ProgressStep = ({ step, index, total, statusJustUpdated, isNewlyCompleted }) => {
    const Icon = step.icon;
    
    return (
        <div className="flex flex-col items-center relative flex-1">
            {/* Connection Line */}
            {index < total - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-200 -z-0">
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: step.completed ? 1 : 0 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 origin-left"
                        transition={{ duration: 1, delay: index * 0.2 }}
                    />
                </div>
            )}
            
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    step.completed 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-500 border-transparent shadow-lg shadow-purple-200 text-white' 
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
            >
                <Icon size={18} className={isNewlyCompleted ? "animate-bounce" : ""} />
                
                {step.completed && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5"
                    >
                        <CheckCircle2 size={10} strokeWidth={4} />
                    </motion.div>
                )}
            </motion.div>
            
            <div className="mt-4 text-center">
                <p className={`text-xs font-bold transition-colors duration-300 ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">
                    {step.date}
                </p>
            </div>
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
    const [statusJustUpdated, setStatusJustUpdated] = useState(false);
    const [newStatus, setNewStatus] = useState(null);
    const [prevStepCount, setPrevStepCount] = useState(0);
    const updateTimerRef = useRef(null);

    const fetchTracking = useCallback(async (searchId) => {
        const targetId = searchId || orderId;
        if (!targetId || !targetId.toString().trim()) {
            setError('Please enter a valid Order ID.');
            return;
        }

        setIsLoading(true);
        setError(null);

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
                { title: 'Confirmed', date: formatDate(createdDate), completed: true, icon: Package },
                { title: 'Processing', date: 'In Progress', completed: false, icon: Box },
                { title: 'On the Way', date: 'Pending', completed: false, icon: Truck },
                { title: 'Delivered', date: 'Estimated', completed: false, icon: MapPin },
            ];

            if (status.includes('confirmed') || status.includes('processing') || status.includes('shipped') || status.includes('delivered') || status.includes('out')) {
                steps[1].completed = true;
                steps[1].date = 'Completed';
            }
            if (status.includes('shipped') || status.includes('delivered') || status.includes('out')) {
                steps[2].completed = true;
                steps[2].date = 'Tracking Live';
            }
            if (status.includes('delivered')) {
                steps[3].completed = true;
                steps[3].date = 'Arrival Success';
            }

            if (status.includes('cancelled')) {
                setError('This order was cancelled by the store administrator.');
                setIsLoading(false);
                return;
            }

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
            console.error("Tracking Error:", err);
            if (err.response?.status === 404) setError('Order not found. Please verify the ID.');
            else setError('Failed to retrieve order state. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    const { data: wsData } = useWebSocket(id ? `/ws/order/${id}/` : null);

    useEffect(() => {
        if (wsData) {
            if (trackingResult) {
                setPrevStepCount(trackingResult.steps.filter(s => s.completed).length);
            }
            setNewStatus(wsData.status);
            setStatusJustUpdated(true);
            fetchTracking(id);
            if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
            updateTimerRef.current = setTimeout(() => { setStatusJustUpdated(false); setNewStatus(null); }, 6000);
        }
        return () => updateTimerRef.current && clearTimeout(updateTimerRef.current);
    }, [wsData, id, fetchTracking]);

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
        <div className="min-h-screen bg-gray-50/50 pb-12 pt-0 sm:px-6 lg:px-8 relative font-sans">
            <AuroraBackground />
            
            <div className="max-w-4xl mx-auto space-y-16 pt-12">
                {/* Header/Search Hero */}
                {!trackingResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center pb-20 pt-6 space-y-6"
                    >
                        <div className="mx-auto w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-purple-200 flex items-center justify-center text-purple-600 mb-8 border border-white">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                            Where's my <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Order?</span>
                        </h1>
                        <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                            Keep an eye on your latest purchase. Enter your order ID below to get real-time tracking updates.
                        </p>
                        
                        <form onSubmit={handleTrack} className="max-w-md mx-auto mt-10 space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="Order ID (e.g. 1024)"
                                    className="w-full px-8 py-5 bg-white border-2 border-transparent rounded-[2rem] shadow-2xl focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-800 text-lg group-hover:shadow-purple-100"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-purple-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                                    <span>Track</span>
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-sm font-medium animate-bounce">{error}</p>}
                        </form>
                    </motion.div>
                )}

                {/* Tracking View */}
                <AnimatePresence>
                    {trackingResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Top Stats Bar */}
                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-purple-600 cursor-pointer"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-600">
                                    Track ID # {trackingResult.id}
                                </div>
                            </div>

                            {/* Main Tracking Card */}
                            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                                {/* Header Section */}
                                <div className="p-8 md:p-12 bg-gradient-to-br from-white/40 to-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Status</h2>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black uppercase rounded-full border border-purple-200">
                                                {trackingResult.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Updated just now via system synchronization</p>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Estimated Arrival</p>
                                        <p className="text-2xl font-black text-purple-600">{trackingResult.estimatedDelivery}</p>
                                    </div>
                                </div>

                                {/* Progress Visualizer (Desktop Horizontal) */}
                                <div className="px-8 pb-12 pt-4 hidden md:flex items-start justify-between relative">
                                    {trackingResult.steps.map((step, idx) => (
                                        <ProgressStep 
                                            key={idx} 
                                            step={step} 
                                            index={idx} 
                                            total={trackingResult.steps.length}
                                            statusJustUpdated={statusJustUpdated}
                                            isNewlyCompleted={statusJustUpdated && step.completed && idx >= prevStepCount}
                                        />
                                    ))}
                                </div>

                                {/* Mobile Progress (Vertical) */}
                                <div className="md:hidden px-8 pb-12 space-y-8 relative before:absolute before:left-12 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                    {trackingResult.steps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-6 relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                step.completed ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-200'
                                            }`}>
                                                <step.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-bold text-sm ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">{step.date}</p>
                                            </div>
                                            {step.completed && <CheckCircle2 size={16} className="text-purple-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Order Details Card */}
                                <div className="md:col-span-2 bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                            <Package className="text-purple-600" size={20} />
                                            Package Items
                                        </h3>
                                        <span className="text-xs font-bold text-gray-400">{trackingResult.items.length} Units</span>
                                    </div>

                                    <div className="space-y-6">
                                        {trackingResult.items.map((item, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                key={idx} 
                                                className="flex items-center gap-6 group p-4 hover:bg-white rounded-3xl transition-all"
                                            >
                                                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-2 shrink-0 group-hover:scale-105 transition-transform">
                                                    <img 
                                                        src={item.product?.image || '/placeholder.png'} 
                                                        alt={item.product?.name} 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{item.product?.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-black">QTY: {item.quantity}</span>
                                                        {item.variant && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Variant: {item.variant.name || 'Standard'}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center justify-end font-black text-purple-600">
                                                        <TakaIcon size={14} />
                                                        <span className="text-lg">{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                    
                                                    {trackingResult.status.toLowerCase().includes('delivered') && (
                                                        <div className="mt-2">
                                                            {trackingResult.canReview ? (
                                                                <button 
                                                                    onClick={() => navigate(`/product/${item.product.slug}`)}
                                                                    className="text-[10px] font-black underline text-purple-600 hover:text-pink-500 cursor-pointer"
                                                                >
                                                                    WRITE REVIEW
                                                                </button>
                                                            ) : (
                                                                <CountdownTimer 
                                                                    targetDate={trackingResult.unlockTime} 
                                                                    onComplete={() => setRefreshTrigger(t => t + 1)}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary Vertical */}
                                <div className="bg-gradient-to-br from-purple-700 to-pink-600 rounded-[2.5rem] shadow-xl p-8 text-white flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 opacity-80">
                                            <Bell size={20} />
                                            <span className="text-xs font-black uppercase tracking-widest">Pricing Overview</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center opacity-70">
                                                <span className="text-xs font-bold uppercase">Subtotal</span>
                                                <div className="flex items-center gap-1 font-bold">
                                                    <TakaIcon className="text-xs" />
                                                    <span>{parseFloat(trackingResult.totalAmount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center opacity-70">
                                                <span className="text-xs font-bold uppercase">Shipping</span>
                                                <div className="flex items-center gap-1 font-bold">
                                                    <TakaIcon className="text-xs" />
                                                    <span>0</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-white/20 pt-4 mt-4 flex justify-between items-end">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Bill</div>
                                                    <div className="text-4xl font-black mt-2 flex items-center gap-2">
                                                        <TakaIcon className="text-5xl translate-y-[2px]" />
                                                        <span>{parseFloat(trackingResult.totalAmount).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Banner */}
                                    <div className="mt-12 p-4 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/20 text-center">
                                        <div className="text-[10px] font-black tracking-widest uppercase mb-1">Support Available</div>
                                        <button 
                                            onClick={() => navigate('/contact')} 
                                            className="text-white flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform cursor-pointer"
                                        >
                                            <span className="font-black text-sm">NEED HELP?</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Notification Toast (Realtime Status) */}
            <AnimatePresence>
                {statusJustUpdated && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-[100] bg-white rounded-3xl shadow-2xl p-6 border border-purple-100 flex items-center gap-6 max-w-sm"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-200">
                            <Bell className="animate-swing" size={32} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Status Upgrade!</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Your order <span className="text-purple-600 font-black">#{trackingResult?.id}</span> is now <span className="font-black underline">{newStatus || trackingResult?.status}</span>.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Custom Styles for animations */}
            <style jsx>{`
                @keyframes swing {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-12deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-8deg); }
                    50% { transform: rotate(6deg); }
                    60% { transform: rotate(-4deg); }
                    70% { transform: rotate(2deg); }
                    80% { transform: rotate(-1deg); }
                    100% { transform: rotate(0); }
                }
                .animate-swing {
                    animation: swing 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
