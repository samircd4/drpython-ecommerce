import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Pencil, Trash2, Download, Loader2, Copy, Check, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import ConfirmModal from '../components/Layout/ConfirmModal';
import api from '../api/axiosConfig';
import { useModals } from '../Context/ModalContext';
import useProductLink from '../hooks/useProductLink';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { useAuth } from '../Context/AuthContext';
import { useStoreConfig } from '../hooks/useStoreConfig';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><ChevronUp className="w-2.5 h-2.5" /><ChevronDown className="w-2.5 h-2.5 -mt-1" /></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400">
        {sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
    </span>;
};

const StatusBadge = ({ status }) => {
    const map = {
        'Delivered': 'bg-green-500/10 text-green-400 ring-green-500/20',
        'Pending': 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
        'Processing': 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        'Cancelled': 'bg-red-500/10 text-red-400 ring-red-500/20',
        'Shipped': 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
        'Returned': 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
        'Failed': 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${map[status] || 'bg-slate-500/10 text-slate-400 ring-slate-500/20'}`}>
            {status}
        </span>
    );
};

const PaymentBadge = ({ ps }) => {
    const isPaid = ps === 'Paid';
    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${isPaid ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'}`}>
            {ps}
        </span>
    );
};

const Orders = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [totalCount, setTotalCount] = React.useState(0);
    const [showBy, setShowBy] = React.useState(12);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(1);

    const [sortColumn, setSortColumn] = React.useState('created_at');
    const [sortDirection, setSortDirection] = React.useState('desc');
    const navigate = useNavigate();
    const { copyToClipboard } = useProductLink();
    const [searchParams, setSearchParams] = useSearchParams();

    const [paymentFilter, setPaymentFilter] = React.useState('Payment');
    const [paymentStatusFilter, setPaymentStatusFilter] = React.useState('Payment Status');
    const [statusFilter, setStatusFilter] = React.useState('Status');
    const [downloadingOrderId, setDownloadingOrderId] = React.useState(null);

    const [orderIdToDelete, setOrderIdToDelete] = React.useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    
    const { openOrderModal } = useModals();
    const { user } = useAuth();
    const { config } = useStoreConfig();
    const symbol = config?.currency_symbol || "৳";
    
    // Real-Time Table Refresh
    const accessToken = localStorage.getItem('access_token');
    useNotificationSocket(accessToken, user?.id, (data) => {
        if (data.type === 'new_order') {
            toast.loading("Refreshening orders...", { id: 'order-refresh', duration: 1000 });
            // Optimistically refresh after a short delay to allow backend to finish
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        }
    });

    React.useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setSearchQuery(query);
            setPage(1);
        }
    }, [searchParams]);

    // Auto-open modal when searching for a specific ID
    React.useEffect(() => {
        const query = searchParams.get('search');
        if (query && orders.length === 1 && String(orders[0].id) === query) {
            openOrderModal(orders[0], 'view');
        }
    }, [orders, searchParams, openOrderModal]);

    const handleDownloadInvoice = async (orderId) => {
        try {
            setDownloadingOrderId(orderId);
            const response = await api.get(`/orders/${orderId}/invoice/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_Order_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to download the invoice.");
        } finally {
            setDownloadingOrderId(null);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/`, { params: { page: page } });
            const orderData = Array.isArray(response.data.results) ? response.data.results : [];
            setOrders(orderData);
            setTotalCount(response.data.count || orderData.length);
        } catch (error) {
            // Error logged silently
            console.log(error);
            
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleOpenModal = (order, mode) => {
        openOrderModal(order, mode);
    };

    const handleDeleteOrder = (orderId) => {
        setOrderIdToDelete(orderId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!orderIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/orders/${orderIdToDelete}/`);
            setOrders(prev => prev.filter(o => o.id !== orderIdToDelete));
            toast.success("Order deleted");
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
            setOrderIdToDelete(null);
        }
    };

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
        const sorted = [...orders].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            if (column === 'amount') { valA = parseFloat(valA); valB = parseFloat(valB); }
            return direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
        setOrders(sorted);
    };

    const filtered = React.useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = String(o.id).includes(searchQuery) || (o.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const pMethod = o.payment?.payment_method || 'Unknown';
            const matchesPayment = paymentFilter === 'Payment' || pMethod === paymentFilter;
            const pStatus = o.payment?.is_paid ? 'Paid' : 'Unpaid';
            const matchesPaymentStatus = paymentStatusFilter === 'Payment Status' || pStatus === paymentStatusFilter;
            const matchesStatus = statusFilter === 'Status' || o.status === statusFilter;
            return matchesSearch && matchesPayment && matchesPaymentStatus && matchesStatus;
        });
    }, [orders, searchQuery, paymentFilter, paymentStatusFilter, statusFilter]);

    const totalPages = Math.ceil(totalCount / showBy) || 1;
    const visible = filtered;

    const orderStatuses = [...new Set(orders.map(o => o.status).filter(Boolean))];

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Breadcrumb title="Orders" paths={["Home", "Dashboard", "Orders"]} />
                <button onClick={() => navigate('/orders/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-sm font-semibold">
                    <Plus className="w-4 h-4" />
                    <span>Add Order</span>
                </button>
            </div>

            <div className="my-6">
                <div className="flex flex-wrap gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm items-center">
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[120px] cursor-pointer font-sans">
                        <option>Payment</option>
                        {['Bkash', 'Nagad', 'Rocket', 'Cash on delivery'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[140px] cursor-pointer font-sans">
                        <option>Payment Status</option>
                        {['Paid', 'Unpaid'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none min-w-[120px] cursor-pointer font-sans">
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
                            <tr><td colSpan="10" className="text-center py-8 text-slate-400">Loading orders...</td></tr>
                        ) : visible.map(o => (
                            <tr 
                                key={o.id} 
                                onClick={() => handleOpenModal(o, 'view')}
                                className="hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium text-sm">{o.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium text-sm">{o.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm max-w-[200px] truncate">
                                    {o.items?.map((i, idx) => (
                                        <span 
                                            key={idx} 
                                            className="hover:text-blue-400 transition-colors cursor-pointer" 
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(i.product?.slug, i.product?.name); }}
                                        >
                                            {i.product?.name}{idx < o.items.length - 1 ? ', ' : ''}
                                        </span>
                                    )) || 'No Items'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-bold text-sm">{symbol}{Number(o.grand_total).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 uppercase text-[10px] font-bold">{o.payment?.payment_method || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><PaymentBadge ps={o.payment?.is_paid ? 'Paid' : 'Unpaid'} /></td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={o.status || 'Pending'} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-mono">{new Date(o.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleDownloadInvoice(o.id)} disabled={downloadingOrderId === o.id} className={`inline-block p-1.5 rounded-lg transition-all ${downloadingOrderId === o.id ? 'bg-slate-700 text-slate-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer'}`}>
                                        {downloadingOrderId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleOpenModal(o, 'view')} className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all cursor-pointer"><Eye className="h-4 w-4" /></button>
                                        <button onClick={() => handleOpenModal(o, 'edit')} className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all cursor-pointer"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => handleDeleteOrder(o.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <ConfirmModal isOpen={isDeleteModalOpen} isLoading={isDeleting} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Are You Sure!" message="Want to delete this order?" />
        </div>
    );
};

export default Orders;
