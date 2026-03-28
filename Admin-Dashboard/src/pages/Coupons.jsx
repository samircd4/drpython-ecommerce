import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket,
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    Calendar,
    Percent,
    DollarSign,
    CheckCircle2,
    XCircle,
    Copy,
    Check
} from "lucide-react";
import api from "../api/axiosConfig";
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

// ─── COUPON MODAL ───────────────────────────────────────
const CouponModal = ({ isOpen, onClose, coupon, mode, onSave }) => {
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
        e.preventDefault();
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

// ─── COUPONS PAGE ──────────────────────────────────────
const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit | view
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/coupons/");
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.results || [];
            setCoupons(data);
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCopy = async (code, id) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedId(id);
            toast.success(`Copied: ${code}`);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const isExpired = (validTo) => {
        return new Date(validTo) < new Date();
    };

    const filtered = coupons.filter((c) =>
        c.code?.toLowerCase().includes(search.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <Ticket className="w-7 h-7 text-yellow-400" />
                        Coupons
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage discount codes for your store
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedCoupon(null);
                        setModalMode("create");
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    New Coupon
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search coupons..."
                    className="w-full pl-10 pr-4 py-3 bg-[#0b1a2a] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                />
            </div>

            {/* Table / Cards */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Ticket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-bold text-lg mb-1">
                        No coupons found
                    </h3>
                    <p className="text-slate-500 text-sm">
                        Create your first coupon to get started.
                    </p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                    {filtered.map((coupon) => {
                        const expired = isExpired(coupon.valid_to);
                        const isActive = coupon.active && !expired;

                        return (
                            <motion.div
                                key={coupon.id}
                                variants={itemVariants}
                                className={`relative bg-[#0b1a2a] border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
                                    isActive
                                        ? "border-slate-700/50 hover:border-blue-600/30"
                                        : "border-slate-800 opacity-60"
                                }`}
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    {isActive ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                            <XCircle className="w-3 h-3" />
                                            {expired ? "Expired" : "Inactive"}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Code */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl font-black text-slate-100 font-mono tracking-widest">
                                            {coupon.code}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleCopy(coupon.code, coupon.id)
                                            }
                                            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
                                            title="Copy code"
                                        >
                                            {copiedId === coupon.id ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Discount Info */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            {coupon.discount_type === "percentage" ? (
                                                <Percent className="w-4 h-4 text-purple-400" />
                                            ) : (
                                                <DollarSign className="w-4 h-4 text-green-400" />
                                            )}
                                            <span className="text-lg font-bold text-slate-200">
                                                {coupon.discount_type === "percentage"
                                                    ? `${coupon.discount_value}%`
                                                    : `৳${coupon.discount_value}`}
                                            </span>
                                            <span className="text-xs text-slate-500">OFF</span>
                                        </div>
                                        {coupon.min_purchase > 0 && (
                                            <span className="text-xs text-slate-500">
                                                Min: ৳{coupon.min_purchase}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            {formatDate(coupon.valid_from)} — {formatDate(coupon.valid_to)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-slate-800">
                                        <button
                                            onClick={() => {
                                                setSelectedCoupon(coupon);
                                                setModalMode("view");
                                                setModalOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCoupon(coupon);
                                                setModalMode("edit");
                                                setModalOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            disabled
                                            title="Delete is currently disabled"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600/5 text-red-400/40 text-xs font-bold rounded-xl cursor-not-allowed opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Modal */}
            <CouponModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedCoupon(null);
                }}
                coupon={selectedCoupon}
                mode={modalMode}
                onSave={fetchCoupons}
            />
        </div>
    );
};

export default Coupons;
