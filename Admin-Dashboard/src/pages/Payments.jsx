import { Eye, Pencil, Trash2, X, Loader2, Save, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Layout/Breadcrumb';
import TransactionTable from '../components/Transactions/TransactionTable';
import Pagination from '../components/Layout/Pagination';
import ConfirmModal from '../components/Layout/ConfirmModal';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const PaymentModal = ({ payment, isOpen, onClose, onUpdatePayment, readOnly = false }) => {
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
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                        {readOnly ? 'Payment Details' : 'Edit Payment'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Transaction ID</label>
                        <input 
                            value={formData.transaction_id} 
                            onChange={e => setFormData({...formData, transaction_id: e.target.value})}
                            disabled={readOnly}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount Paid (Tk)</label>
                        <input 
                            type="number"
                            value={formData.amount} 
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                            disabled={readOnly}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Method</label>
                        <select 
                            value={formData.payment_method} 
                            onChange={e => setFormData({...formData, payment_method: e.target.value})}
                            disabled={readOnly}
                            className="w-full bg-[#071229] text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none disabled:opacity-50"
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
                            disabled={readOnly}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="is_paid" className="text-sm text-slate-300 font-medium cursor-pointer">Mark as Paid</label>
                    </div>

                    {readOnly && (
                        <div className="pt-4 space-y-2 border-t border-slate-800">
                             <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold uppercase">Client</span>
                                <span className="text-slate-300">{payment.customer_name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold uppercase">Date</span>
                                <span className="text-slate-300 font-mono">{new Date(payment.payment_date).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
                {!readOnly && (
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
                )}
            </div>
        </div>
    );
};

const Payments = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showBy, setShowBy] = useState(12);
    const [sortColumn, setSortColumn] = useState('payment_date');
    const [sortDirection, setSortDirection] = useState('desc');

    // Modal State
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentIdToDelete, setPaymentIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments/', {
                params: {
                    page: page,
                    search: searchQuery,
                    // Add other filters if backend supports
                }
            });
            setTransactions(response.data.results || []);
            setTotalCount(response.data.count || 0);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, searchQuery]);

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
    };

    const handleUpdatePayment = async (id, data) => {
        try {
            await api.patch(`/payments/${id}/`, data);
            toast.success("Payment information updated successfully");
            setIsEditModalOpen(false);
            fetchPayments();
        } catch (error) {
            console.error("Failed to update payment:", error);
            toast.error("Failed to update payment.");
        }
    };

    const handleOpenEdit = (payment) => {
        setSelectedPayment(payment);
        setIsEditModalOpen(true);
    };

    const handleOpenView = (payment) => {
        setSelectedPayment(payment);
        setIsViewModalOpen(true);
    };

    const handleDeletePayment = (paymentId) => {
        setPaymentIdToDelete(paymentId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!paymentIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/payments/${paymentIdToDelete}/`);
            setTransactions(prev => prev.filter(t => t.id !== paymentIdToDelete));
            setTotalCount(prev => prev - 1);
            toast.success("Payment record deleted successfully");
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete payment:", error);
            toast.error("Failed to delete payment");
        } finally {
            setIsDeleting(false);
            setPaymentIdToDelete(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / showBy));
    const visibleTransactions = transactions; 

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumb title="Payments" paths={["Home", "Payments"]} />
                <button 
                    onClick={() => navigate('/payments/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Payment
                </button>
            </div>

            <div className="my-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="flex-1 w-full">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search by ID or client..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Payment">Payment</option>
                            <option value="Refund">Refund</option>
                        </select>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
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
            </div>

            <TransactionTable
                transactions={visibleTransactions}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleOpenEdit}
                onView={handleOpenView}
                onDelete={handleDeletePayment}
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleTransactions.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> transactions
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            {/* Modals */}
            <PaymentModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                payment={selectedPayment}
                onUpdatePayment={handleUpdatePayment}
            />

             <PaymentModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                payment={selectedPayment}
                readOnly={true}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this payment record?"
            />
        </div>
    );
};

export default Payments;
