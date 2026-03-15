import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Pencil, Trash2, Download, Loader2, Copy, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import api from '../api/axiosConfig';
import useProductLink from '../hooks/useProductLink';


const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

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

const PaymentModal = ({ payment, isOpen, onClose, onUpdatePayment }) => {
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-modal-backdrop" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0b1a2a] border border-slate-700 rounded-2xl shadow-2xl animate-modal-content">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">Edit Payment</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer"><Trash2 className="w-5 h-5 rotate-45" /></button>
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
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Method</label>
                        <select 
                            value={formData.payment_method} 
                            onChange={e => setFormData({...formData, payment_method: e.target.value})}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
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
                            id="is_paid" 
                            checked={formData.is_paid}
                            onChange={e => setFormData({...formData, is_paid: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_paid" className="text-sm text-slate-300 font-medium cursor-pointer">Mark as Paid</label>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-800">
                    <button 
                        onClick={async () => { setIsSaving(true); await onUpdatePayment(payment.id, formData); setIsSaving(false); }}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Payment Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderModal = ({ order, isOpen, onClose, onUpdateStatus, onEditPayment, isEdit = false }) => {
    const [status, setStatus] = useState(order?.status || 'Pending');
    const [copied, setCopied] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const { copyToClipboard } = useProductLink();


    useEffect(() => {
        if (order) setStatus(order.status);
    }, [order]);

    if (!isOpen || !order) return null;

    const handleCopyTransaction = () => {
        if (order.payment?.transaction_id) {
            navigator.clipboard.writeText(order.payment.transaction_id);
            setCopied(true);
            toast.success('Transaction ID copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-backdrop" onClick={onClose} />
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
                                onClick={async () => { setIsSavingStatus(true); await onUpdateStatus(order.id, status); setIsSavingStatus(false); }}
                                disabled={isSavingStatus}
                                title="Save Status"
                                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                            >
                                {isSavingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer">
                            <Trash2 className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Customer & Shipping Info */}
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

                        {/* Order Status & Payment */}
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
                                            className="w-full bg-[#071229] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                        >
                                            {['Pending', 'Confirmed', 'Shipped', 'Cancelled', 'Delivered', 'Returned'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {isEdit && (
                                        <button 
                                            onClick={async () => { setIsSavingStatus(true); await onUpdateStatus(order.id, status); setIsSavingStatus(false); }}
                                            disabled={isSavingStatus}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        >
                                            {isSavingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {isSavingStatus ? 'Updating...' : 'Update Order Status'}
                                        </button>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Payment Information</h3>
                                    {isEdit && order.payment && (
                                        <button 
                                            onClick={onEditPayment}
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
                                        <span className="text-white font-black">৳{order.payment?.amount || 0}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Order Items */}
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
                                                    {item.product.image && <img src={item.product.image} className="w-8 h-8 rounded object-cover shadow-sm border border-slate-700" />}
                                                    <div>
                                                        <p 
                                                            onClick={() => copyToClipboard(item.product.slug, item.product.name)}
                                                            className="text-slate-200 font-medium leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                                                            title="Click to copy product link"
                                                        >
                                                            {item.product.name}
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
                                            <td className="px-4 py-3 text-right text-slate-300">৳{item.price}</td>
                                            <td className="px-4 py-3 text-right text-white font-bold">৳{item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-[#071229]/50 border-t border-slate-800 divide-y divide-slate-800/30">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Subtotal</td>
                                        <td className="px-4 py-2 text-right text-slate-300 font-medium">৳{order.subtotal}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Delivery Charge</td>
                                        <td className="px-4 py-2 text-right text-slate-300 font-medium">৳{order.delivery_charge || 0}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tax</td>
                                        <td className="px-4 py-2 text-right text-slate-300 font-medium">৳{order.tax || 0}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Discount</td>
                                        <td className="px-4 py-2 text-right text-red-400 font-medium">-৳{order.discount || 0}</td>
                                    </tr>
                                    <tr className="bg-slate-800/30">
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Paid Amount</td>
                                        <td className="px-4 py-2 text-right text-green-400 font-medium">৳{order.payment?.amount || 0}</td>
                                    </tr>
                                    <tr className="bg-slate-800/30">
                                        <td colSpan="3" className="px-4 py-2 text-right text-slate-500 text-[10px] font-bold uppercase tracking-widest">Due Amount</td>
                                        <td className="px-4 py-2 text-right text-orange-400 font-bold">৳{Math.max(0, order.grand_total - (order.payment?.amount || 0))}</td>
                                    </tr>
                                    <tr className="bg-blue-500/5">
                                        <td colSpan="3" className="px-4 py-3 text-right text-blue-400 font-black uppercase tracking-widest text-xs">Grand Total</td>
                                        <td className="px-4 py-3 text-right text-white text-lg font-black tracking-tight">৳{order.grand_total}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [showBy, setShowBy] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const { copyToClipboard } = useProductLink();


    const [paymentFilter, setPaymentFilter] = useState('Payment');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('Payment Status');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [downloadingOrderId, setDownloadingOrderId] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handleDownloadInvoice = async (orderId) => {
        try {
            setDownloadingOrderId(orderId);
            const response = await api.get(`/orders/${orderId}/invoice/`, {
                responseType: 'blob', // Important: expect binary data
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_Order_${orderId}.pdf`); // Define fallback filename
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    link.setAttribute('download', fileNameMatch[1]);
                }
            }
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download invoice:", error);
            toast.error("Failed to download the invoice. Please try again.");
        } finally {
            setDownloadingOrderId(null);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/`, {
                params: { page: page }
            });
            if (response.data && response.data.results) {
                setOrders(response.data.results);
                setTotalCount(response.data.count);
                // Also update selectedOrder if it's currently open
                if (selectedOrder) {
                    const updatedOrder = response.data.results.find(o => o.id === selectedOrder.id);
                    if (updatedOrder) setSelectedOrder(updatedOrder);
                }
            } else {
                setOrders(Array.isArray(response.data) ? response.data : []);
                setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Failed to update status.");
        }
    };

    const handleUpdatePayment = async (paymentId, paymentData) => {
        try {
            await api.patch(`/payments/${paymentId}/`, paymentData);
            toast.success("Payment information updated successfully");
            setIsPaymentModalOpen(false);
            fetchOrders(); // Refresh to see changes in OrderModal
        } catch (error) {
            console.error("Failed to update payment:", error);
            toast.error("Failed to update payment.");
        }
    };

    const handleOpenModal = (order, mode) => {
        setSelectedOrder(order);
        setModalMode(mode);
        setIsModalOpen(true);
    };


    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...orders].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            if (column === 'amount') {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setOrders(sorted);
    };

    const filtered = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = String(o.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            const pMethod = o.payment?.payment_method || 'Unknown';
            const matchesPayment = paymentFilter === 'Payment' || pMethod === paymentFilter;
            
            const pStatus = o.payment?.is_paid ? 'Paid' : 'Unpaid';
            const matchesPaymentStatus = paymentStatusFilter === 'Payment Status' || pStatus === paymentStatusFilter;
            
            const matchesStatus = statusFilter === 'Status' || o.status === statusFilter;

            return matchesSearch && matchesPayment && matchesPaymentStatus && matchesStatus;
        });
    }, [orders, searchQuery, paymentFilter, paymentStatusFilter, statusFilter]);

    // Note: If backend does full pagination, `filtered` might just be current page. 
    // We calculate totalPages using API target count if available, overriding local math
    const totalPages = Math.max(1, Math.ceil(totalCount > 0 ? totalCount / showBy : filtered.length / showBy));
    
    // We already fetch page by page if backend is paginated. If backend returns everything, we slice here.
    const isPaginatedByBackend = totalCount > orders.length;
    const visible = isPaginatedByBackend ? filtered : filtered.slice((page - 1) * showBy, page * showBy);

    // Dynamic unique lists for filters based on current loaded orders
    const paymentMethods = [...new Set(orders.map(o => o.payment?.payment_method).filter(Boolean))];
    const pStatuses = ['Paid', 'Unpaid'];
    const orderStatuses = [...new Set(orders.map(o => o.status).filter(Boolean))];

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <Breadcrumb title="Orders" paths={["Home", "Dashboard", "Orders"]} />

            <div className="my-6">
                <div className="flex flex-wrap gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm items-center">
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[120px]">
                        <option>Payment</option>
                        {['Bkash', 'Nagad', 'Rocket', 'Cash on delivery'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[140px]">
                        <option>Payment Status</option>
                        {pStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[120px]">
                        <option>Status</option>
                        {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="flex-1 min-w-[200px]">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search orders..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-sm ml-auto">
                        <span>Show:</span>
                        <select
                            value={showBy}
                            onChange={(e) => { setShowBy(Number(e.target.value)); setPage(1); }}
                            className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                            {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="text-white bg-[#0b3a61]">
                        <tr>
                            {[
                                { id: 'id', label: 'UID' },
                                { id: 'client', label: 'Client' },
                                { id: 'product', label: 'Product' },
                                { id: 'amount', label: 'Amount' },
                                { id: 'payment', label: 'Payment' },
                                { id: 'paymentStatus', label: 'Payment Status' },
                                { id: 'status', label: 'Status' },
                                { id: 'date', label: 'Date Time' }
                            ].map(col => (
                                <th key={col.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort(col.id)}>
                                    <div className="flex items-center whitespace-nowrap">{col.label} <SortArrow column={col.id} sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Invoices</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-8 text-slate-400">Loading orders...</td></tr>
                        ) : visible.map(o => (
                            <tr key={o.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium text-sm">{o.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium text-sm">{o.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm max-w-[200px] truncate">
                                    {o.items?.map((i, idx) => (
                                        <span 
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(i.product.slug, i.product.name); }}
                                            className="cursor-pointer hover:text-blue-400 transition-colors"
                                            title="Click to copy product link"
                                        >
                                            {i.product.name}{idx < o.items.length - 1 ? ', ' : ''}
                                        </span>
                                    )) || 'No Items'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-bold text-sm">${o.grand_total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 uppercase text-[10px] font-bold">
                                    {o.payment?.payment_method || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <PaymentBadge ps={o.payment?.is_paid ? 'Paid' : 'Unpaid'} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={o.status || 'Pending'} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-mono">
                                    {new Date(o.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => handleDownloadInvoice(o.id)}
                                        disabled={downloadingOrderId === o.id}
                                        title="Download Invoice" 
                                        className={`inline-block p-1.5 rounded-lg transition-all shadow-sm ${downloadingOrderId === o.id ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer'}`}
                                    >
                                        {downloadingOrderId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleOpenModal(o, 'view')}
                                            title="View Details" 
                                            className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal(o, 'edit')}
                                            title="Edit Order" 
                                            className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button title="Delete Order" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{totalCount || filtered.length}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <OrderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                order={selectedOrder} 
                isEdit={modalMode === 'edit'}
                onUpdateStatus={handleUpdateStatus}
                onEditPayment={() => setIsPaymentModalOpen(true)}
            />

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                payment={selectedOrder?.payment}
                onUpdatePayment={handleUpdatePayment}
            />
        </div>
    );
};

export default Orders;
