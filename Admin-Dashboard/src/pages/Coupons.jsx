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
import CouponModal from "../components/Coupon/CouponModal";
import ConfirmModal from "../components/Layout/ConfirmModal";

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


// ─── COUPONS PAGE ──────────────────────────────────────
const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit | view
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [couponIdToDelete, setCouponIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDelete = (id) => {
        setCouponIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!couponIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/coupons/${couponIdToDelete}/`);
            toast.success("Coupon deleted successfully");
            fetchCoupons();
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Failed to delete coupon:", err);
            toast.error("Failed to delete coupon");
        } finally {
            setIsDeleting(false);
            setCouponIdToDelete(null);
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
                                            onClick={() => handleDelete(coupon.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCouponIdToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this coupon code? This action cannot be undone."
            />
        </div>
    );
};

export default Coupons;
