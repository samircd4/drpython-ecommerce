import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Eye, Pencil, X, Download, Loader2, Copy, Save, Check, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import useProductLink from '../../hooks/useProductLink';
import { useModals } from '../../Context/ModalContext';
import { useStoreConfig } from '../../hooks/useStoreConfig';

const StatusBadge = ({ status }) => {
    const map = {
        Pending: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
        Confirmed: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        Shipped: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
        Cancelled: 'bg-red-500/10 text-red-400 ring-red-500/20',
        Delivered: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        Returned: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${map[status] || 'bg-slate-600'}`}>{status}</span>;
};

const PaymentBadge = ({ ps }) => {
    const map = {
        Paid: 'bg-green-500 text-white',
        Pending: 'bg-yellow-500 text-black',
        Refunded: 'bg-purple-500 text-white',
        Unpaid: 'bg-red-500 text-white',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${map[ps] || 'bg-slate-600'}`}>{ps}</span>;
};

export const PaymentModal = ({ payment, isOpen, onClose, onUpdatePayment }) => {
    const [formData, setFormData] = useState({
        transaction_id: payment?.transaction_id || '',
        amount: payment?.amount || 0,
        is_paid: payment?.is_paid || false,
        payment_method: payment?.payment_method || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (payment) {
            setFormData({
                transaction_id: payment.transaction_id || '',
                amount: payment.amount || 0,
                is_paid: payment.is_paid || false,
                payment_method: payment.payment_method || ''
            });
        }
    }, [payment]);

    if (!isOpen || !payment) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0b1a2a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">Edit Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Transaction ID</label>
                        <input 
                            value={formData.transaction_id} 
                            onChange={e => setFormData({...formData, transaction_id: e.target.value})}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount Paid</label>
                        <input 
                            type="number"
                            value={formData.amount} 
                            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Method</label>
                        <select 
                            value={formData.payment_method} 
                            onChange={e => setFormData({...formData, payment_method: e.target.value})}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-sans"
                        >
                            <option value="">Select Method</option>
                            <option value="Bkash">Bkash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Cash on delivery">Cash on delivery</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                        <input 
                            type="checkbox" 
                            id="is_paid_modal_global" 
                            checked={formData.is_paid}
                            onChange={e => setFormData({...formData, is_paid: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_paid_modal_global" className="text-sm text-slate-300 font-medium cursor-pointer">Mark as Paid</label>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-800">
                    <button 
                        onClick={async () => { 
                            setIsSaving(true); 
                            await onUpdatePayment(payment.id, formData); 
                            setIsSaving(false); 
                        }}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Payment Changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const GlobalOrderModal = () => {
    const { orderModal, closeOrderModal, setOrderModalMode } = useModals();
    const { isOpen, order, mode } = orderModal;
    const { config } = useStoreConfig();
    const symbol = config?.currency_symbol || "৳";
    const [status, setStatus] = useState(order?.status || 'Pending');
    const [copied, setCopied] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { copyToClipboard } = useProductLink();

    useEffect(() => {
        if (order) setStatus(order.status);
    }, [order]);

    if (!isOpen || !order) return null;

    const isEdit = mode === 'edit';

    const handleCopyTransaction = () => {
        if (order.payment?.transaction_id) {
            navigator.clipboard.writeText(order.payment.transaction_id);
            setCopied(true);
            toast.success('Transaction ID copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            setIsSavingStatus(true);
            await api.patch(`/orders/${order.id}/`, { status: status });
            toast.success(`Order status updated to ${status}`);
            setIsSavingStatus(false);
            closeOrderModal();
            // Note: In a real app we'd refresh the parent data too
        } catch (error) {
            toast.error("Update failed.");
            setIsSavingStatus(false);
        }
    };

    const handleUpdatePayment = async (paymentId, paymentData) => {
        try {
            await api.patch(`/payments/${paymentId}/`, paymentData);
            toast.success("Payment updated");
            setIsPaymentModalOpen(false);
            closeOrderModal(); 
        } catch (error) {
            toast.error("Payment update failed.");
        }
    };

    return ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeOrderModal} />
                <div className="relative w-full max-w-4xl bg-[#071229] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-modal-content">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b1a2a]">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Order #{order.id}
                                </h2>
                                <StatusBadge status={order.status} />
                                {order.payment?.transaction_id && (
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded border border-slate-700 ml-2 group relative">
                                        <span className="text-[10px] font-mono text-slate-400 capitalize">TXID:</span>
                                        <span className="text-[10px] font-mono text-blue-400 font-bold">{order.payment.transaction_id}</span>
                                        <button 
                                            onClick={handleCopyTransaction}
                                            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                                            title="Copy Transaction ID"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-slate-400">Placed on {new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEdit && (
                                <button 
                                    onClick={handleUpdateStatus}
                                    disabled={isSavingStatus}
                                    title="Save Status"
                                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                                >
                                    {isSavingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                </button>
                            )}
                            <button onClick={closeOrderModal} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer group">
                               <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Customer Details</h3>
                                    <div className="bg-[#0b1a2a]/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Name</span>
                                            <span className="text-slate-200 font-semibold">{order.full_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Email</span>
                                            <span className="text-slate-200">{order.email}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Phone</span>
                                            <span className="text-slate-200">{order.phone}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Shipping Address</h3>
                                    <div className="bg-[#0b1a2a]/50 p-4 rounded-xl border border-slate-800/50 space-y-2">
                                        <p className="text-sm text-slate-200 font-medium">{order.shipping_address}</p>
                                        <p className="text-xs text-slate-400 capitalize">
                                            {[order.sub_district, order.district, order.division].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Order Management</h3>
                                    <div className="bg-[#0b1a2a]/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Change Status</label>
                                            <select 
                                                value={status} 
                                                onChange={(e) => setStatus(e.target.value)}
                                                disabled={!isEdit}
                                                className="w-full bg-[#071229] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 font-sans cursor-pointer"
                                            >
                                                {['Pending', 'Confirmed', 'Shipped', 'Cancelled', 'Delivered', 'Returned'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {isEdit && (
                                            <button 
                                                onClick={handleUpdateStatus}
                                                disabled={isSavingStatus}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                                            >
                                                {isSavingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                {isSavingStatus ? 'Updating...' : 'Update Status'}
                                            </button>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Payment Information</h3>
                                        {isEdit && order.payment && (
                                            <button 
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" 
                                                title="Edit Payment"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-[#0b1a2a]/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Method</span>
                                            <span className="text-slate-200 font-bold uppercase tracking-tight">{order.payment?.payment_method || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Payment Status</span>
                                            <PaymentBadge ps={order.payment?.is_paid ? 'Paid' : 'Unpaid'} />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase">Amount Paid</span>
                                            <span className="text-white font-black">{symbol}{Number(order.payment?.amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <section>
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Ordered Items</h3>
                            <div className="bg-[#0b1a2a]/50 rounded-xl border border-slate-800/50 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#071229] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {order.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.product?.image && <img src={item.product.image} className="w-8 h-8 rounded object-cover shadow-sm border border-slate-700" alt="" />}
                                                        <div>
                                                            <p 
                                                                onClick={() => copyToClipboard(item.product?.slug, item.product?.name)}
                                                                className="text-slate-200 font-medium leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                                                            >
                                                                {item.product?.name}
                                                            </p>
                                                            {item.variant && (
                                                                <p className="text-[10px] text-slate-500 mt-1">
                                                                    {typeof item.variant === 'object'
                                                                        ? [item.variant.color, item.variant.ram, item.variant.storage].filter(Boolean).join(' / ') || item.variant.sku || 'Variant'
                                                                        : item.variant
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-400 font-medium">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-slate-300">{symbol}{Number(item.price).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right text-white font-bold">{symbol}{Number(item.total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[#071229]/50 border-t border-slate-800 divide-y divide-slate-800/30">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Subtotal</td>
                                            <td className="px-4 py-2 text-right text-slate-300 font-medium">{symbol}{Number(order.subtotal).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Grand Total</td>
                                            <td className="px-4 py-2 text-right text-white font-black text-base">{symbol}{Number(order.grand_total).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>
                    </div>
                    
                    <div className="p-4 border-t border-slate-800 bg-[#0b1a2a] flex gap-3 justify-end">
                        <button 
                            onClick={closeOrderModal}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all uppercase tracking-widest cursor-pointer"
                        >
                            Close
                        </button>
                        {!isEdit && (
                            <button 
                                onClick={() => setOrderModalMode('edit')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest cursor-pointer flex items-center gap-2"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <PaymentModal 
                payment={order?.payment}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onUpdatePayment={handleUpdatePayment}
            />
        </>,
        document.body
    );
};

export default GlobalOrderModal;
