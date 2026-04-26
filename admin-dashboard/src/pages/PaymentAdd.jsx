import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    CreditCard, 
    DollarSign, 
    Save, 
    ArrowLeft, 
    Hash, 
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const PaymentAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        transaction_id: "",
        amount: "",
        payment_method: "bkash",
        is_paid: true,
        paid_from: "",
        payment_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await api.post('/payments/', formData);
            toast.success("Payment transaction logged successfully!");
            navigate('/payments');
        } catch (err) {
            console.error("Failed to create payment:", err);
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach(key => {
                    const message = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    toast.error(`${key}: ${message}`);
                });
            } else {
                toast.error("Transaction logging failed. Check system logs.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="Payment Portal" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Payments", path: "/payments" },
                                { label: "Log Payment", path: "/payments/new" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Manual Transaction Receipt</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/payments')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Ledger
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-emerald-600/10 via-transparent to-transparent flex items-center gap-4">
                        <div className="p-3 bg-emerald-600/20 rounded-2xl">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100 italic">Financial Enrollment</h2>
                            <p className="text-sm text-slate-500 font-medium">Recording a manual credit entry into the system ledger.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12 transition-all">
                        {/* Transaction Detail */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Identification</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction ID / Reference</label>
                                    <div className="relative group">
                                        <Hash className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            required
                                            type="text"
                                            name="transaction_id"
                                            value={formData.transaction_id}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-mono border-l-4 border-l-transparent focus:border-l-emerald-500 uppercase"
                                            placeholder="TRX999888"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credit Amount (BDT)</label>
                                    <div className="relative group">
                                        <DollarSign className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            required
                                            type="number"
                                            step="0.01"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-bold tracking-tight border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="1500.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Origin & Date */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-blue-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin & Timestamp</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Paid From (Account/Name)</label>
                                    <div className="relative group">
                                        <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            type="text"
                                            name="paid_from"
                                            value={formData.paid_from}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-blue-500"
                                            placeholder="018xxxxxxxx or Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Receipt Date</label>
                                    <div className="relative group">
                                        <Calendar className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            type="date"
                                            name="payment_date"
                                            value={formData.payment_date}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all border-l-4 border-l-transparent focus:border-l-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Status & Method */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status & Protocol</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Hub</label>
                                    <select 
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-bold border-l-4 border-l-transparent focus:border-l-purple-500 appearance-none"
                                    >
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="stripe">Stripe / Card</option>
                                        <option value="cod">Cash on Delivery</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmation State</label>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, is_paid: !p.is_paid }))}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                            formData.is_paid 
                                                ? 'bg-emerald-600/10 border-emerald-500/40' 
                                                : 'bg-red-600/10 border-red-500/40'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${formData.is_paid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {formData.is_paid ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-black uppercase ${formData.is_paid ? 'text-emerald-300' : 'text-red-300'}`}>
                                                {formData.is_paid ? 'Confirmed Paid' : 'Awaiting Settlement'}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-medium italic">Status indicates credit arrival.</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-[2rem] flex items-start gap-4">
                            <Info className="w-6 h-6 text-blue-400 shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                <strong className="text-blue-300">Notice:</strong> Manual payments recorded here will be added to the financial ledger but won't be linked to an order automatically unless the Transaction ID matches a pending order's payment reference.
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => navigate('/payments')}
                                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-300 transition-colors"
                            >
                                Discard Receipt
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Finalize Credit Entry
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentAdd;
