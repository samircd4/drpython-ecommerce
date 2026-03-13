import React, { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import api from '../api/axiosConfig';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const StatusBadge = ({ status }) => {
    const map = {
        Pending: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
        Shipped: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        Cancelled: 'bg-red-500/10 text-red-400 ring-red-500/20',
        Received: 'bg-green-500/10 text-green-400 ring-green-500/20',
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

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [showBy, setShowBy] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    const [paymentFilter, setPaymentFilter] = useState('Payment');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('Payment Status');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [downloadingOrderId, setDownloadingOrderId] = useState(null);

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
            alert("Failed to download the invoice. Please try again.");
        } finally {
            setDownloadingOrderId(null);
        }
    };

    React.useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Determine page size and current page, and optionally pass search params if backed supports it
                const response = await api.get(`/orders/`, {
                    params: {
                        page: page,
                        // Could add other filters if backend supports it:
                        // search: searchQuery, 
                        // status: statusFilter !== 'Status' ? statusFilter : undefined
                    }
                });
                
                // DRF typically returns { count, next, previous, results }
                if (response.data && response.data.results) {
                    setOrders(response.data.results);
                    setTotalCount(response.data.count);
                } else {
                    // Fallback if not paginated
                    setOrders(Array.isArray(response.data) ? response.data : []);
                    setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page]); // Re-fetch when page changes


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
                                    {o.items?.map(i => i.product.name).join(', ') || 'No Items'}
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
                                        <button title="View Details" className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all"><Eye className="h-4 w-4" /></button>
                                        <button title="Edit Order" className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"><Pencil className="h-4 w-4" /></button>
                                        <button title="Delete Order" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
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
        </div>
    );
};

export default Orders;
