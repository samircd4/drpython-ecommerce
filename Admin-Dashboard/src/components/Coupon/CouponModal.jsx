import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket,
    X,
    Calendar,
    Percent,
    DollarSign,
    CheckCircle2,
} from "lucide-react";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";

const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toISOString().slice(0, 16); // for datetime-local input
};

const CouponModal = ({ isOpen, onClose, coupon, mode = "create", onSave }) => {
    const isView = mode === "view";
    const isEdit = mode === "edit";

    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState("fixed");
    const [discountValue, setDiscountValue] = useState("");
    const [minPurchase, setMinPurchase] = useState("0");
    const [validFrom, setValidFrom] = useState("");
    const [validTo, setValidTo] = useState("");
    const [active, setActive] = useState(true);
    const [usageLimit, setUsageLimit] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon && (isEdit || isView)) {
            setCode(coupon.code || "");
            setDiscountType(coupon.discount_type || "fixed");
            setDiscountValue(coupon.discount_value || "");
            setMinPurchase(coupon.min_purchase || "0");
            setValidFrom(formatDateTime(coupon.valid_from));
            setValidTo(formatDateTime(coupon.valid_to));
            setActive(coupon.active ?? true);
            setUsageLimit(coupon.usage_limit || "");
        } else {
            setCode("");
            setDiscountType("fixed");
            setDiscountValue("");
            setMinPurchase("0");
            setValidFrom("");
            setValidTo("");
            setActive(true);
            setUsageLimit("");
        }
    }, [coupon, isEdit, isView, isOpen]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!code || !discountValue || !validFrom || !validTo) {
            toast.error("Please fill in all required fields");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                code: code.toUpperCase(),
                discount_type: discountType,
                discount_value: discountValue,
                min_purchase: minPurchase || "0",
                valid_from: new Date(validFrom).toISOString(),
                valid_to: new Date(validTo).toISOString(),
                active,
                usage_limit: usageLimit || null,
            };

            if (isEdit && coupon?.id) {
                await api.put(`/coupons/${coupon.id}/`, payload);
                toast.success("Coupon updated successfully");
            } else {
                await api.post("/coupons/", payload);
                toast.success("Coupon created successfully");
            }
            onSave?.();
            onClose();
        } catch (err) {
            const msg =
                err.response?.data?.detail ||
                err.response?.data?.code?.[0] ||
                JSON.stringify(err.response?.data) ||
                "Failed to save coupon";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    >
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-yellow-400" />
                                    {isView ? "Coupon Details" : isEdit ? "Edit Coupon" : "New Coupon"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                {/* Code */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        disabled={isView}
                                        placeholder="e.g. SAVE500"
                                        className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed font-mono text-lg tracking-widest"
                                    />
                                </div>

                                {/* Discount Type + Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Type *
                                        </label>
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                            disabled={isView}
                                            className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <option value="fixed">Fixed Amount (৳)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Value *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            disabled={isView}
                                            placeholder="500"
                                            className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Min Purchase */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Minimum Purchase (৳)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={minPurchase}
                                        onChange={(e) => setMinPurchase(e.target.value)}
                                        disabled={isView}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Validity Period */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Valid From *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={validFrom}
                                            onChange={(e) => setValidFrom(e.target.value)}
                                            disabled={isView}
                                            className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Valid To *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={validTo}
                                            onChange={(e) => setValidTo(e.target.value)}
                                            disabled={isView}
                                            className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Usage Limit + Active */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={usageLimit}
                                            onChange={(e) => setUsageLimit(e.target.value)}
                                            disabled={isView}
                                            placeholder="Unlimited"
                                            className="w-full px-4 py-3 bg-[#071229] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={active}
                                                    onChange={(e) => setActive(e.target.checked)}
                                                    disabled={isView}
                                                    className="sr-only"
                                                />
                                                <div className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">
                                                {active ? "Active" : "Inactive"}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* View Mode Extra Info */}
                                {isView && coupon && (
                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Times Used</span>
                                            <span className="text-slate-200 font-bold">{coupon.times_used || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Created</span>
                                            <span className="text-slate-200 font-bold">{formatDate(coupon.created_at)}</span>
                                        </div>
                                    </div>
                                )}
                            </form>

                            {/* Footer */}
                            {!isView && (
                                <div className="p-6 border-t border-slate-800 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                {isEdit ? "Update" : "Create"} Coupon
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CouponModal;
