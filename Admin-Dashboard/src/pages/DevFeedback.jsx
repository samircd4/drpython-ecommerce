import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bug, AlertTriangle, Zap, Shield, Lightbulb, MessageSquare,
    Search, Filter, ChevronDown, ChevronUp, RefreshCw,
    Trash2, Eye, X, ExternalLink, User, Clock,
    CheckCircle, Circle, AlertCircle, XCircle, Loader2,
    MoreVertical, SlidersHorizontal, ImageIcon, ArrowUpDown, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getFeedbacks, getFeedback, updateFeedback, deleteFeedback } from '../api/devFeedback';
import api from '../api/axiosConfig';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
    feedback: { label: 'Feedback', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    bug: { label: 'Bug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    ui: { label: 'UI', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    performance: { label: 'Performance', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    security: { label: 'Security', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
};

const PRIORITY_CONFIG = {
    low: { label: 'Low', dot: 'bg-slate-400', text: 'text-slate-400', badge: 'bg-slate-400/10 text-slate-400 border-slate-400/20' },
    medium: { label: 'Medium', dot: 'bg-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    high: { label: 'High', dot: 'bg-orange-400', text: 'text-orange-400', badge: 'bg-orange-400/10 text-orange-400 border-orange-400/20' },
    critical: { label: 'Critical', dot: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const STATUS_CONFIG = {
    new: { label: 'New', icon: Circle, color: 'text-yellow-400', badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    in_progress: { label: 'In Progress', icon: Loader2, color: 'text-blue-400', badge: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
    resolved: { label: 'Resolved', icon: CheckCircle, color: 'text-green-400', badge: 'bg-green-400/10 text-green-400 border-green-400/20' },
    closed: { label: 'Closed', icon: XCircle, color: 'text-slate-400', badge: 'bg-slate-400/10 text-slate-400 border-slate-400/20' },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const PriorityBadge = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

const TypeBadge = ({ type }) => {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.bug;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const FeedbackModal = ({ feedbackId, onClose, onUpdate, staff }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [form, setForm] = useState({ status: '', priority: '', assigned_to_id: '' });

    useEffect(() => {
        if (!feedbackId) return;
        setLoading(true);
        getFeedback(feedbackId)
            .then(data => {
                setFeedback(data);
                setForm({
                    status: data.status,
                    priority: data.priority,
                    assigned_to_id: data.assigned_to?.id ?? '',
                });
            })
            .catch(() => toast.error('Failed to load feedback details'))
            .finally(() => setLoading(false));
    }, [feedbackId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                status: form.status,
                priority: form.priority,
                assigned_to_id: form.assigned_to_id || null,
            };
            const updated = await updateFeedback(feedbackId, payload);
            setFeedback(prev => ({ ...prev, ...updated }));
            toast.success('Feedback updated');
            onUpdate();
        } catch {
            toast.error('Failed to update feedback');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteFeedback(feedbackId);
            toast.success('Feedback deleted');
            onUpdate();
            onClose();
        } catch {
            toast.error('Failed to delete feedback');
        }
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 300ms ease-in-out' }}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                {/* Modal */}
                <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-[#0b1829] border border-slate-700/50 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-[#071229]/80 backdrop-blur-sm shrink-0">
                        <h2 className="text-lg font-semibold text-slate-100">Feedback Details</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors text-slate-400 hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : !feedback ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">Not found</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            {/* Meta strip */}
                            <div className="px-6 py-4 border-b border-slate-700/30 flex flex-wrap gap-2">
                                <TypeBadge type={feedback.type} />
                                <PriorityBadge priority={feedback.priority} />
                                <StatusBadge status={feedback.status} />
                                {feedback.status === 'new' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 animate-pulse">
                                        ● NEW
                                    </span>
                                )}
                            </div>

                            <div className="px-6 py-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-snug">{feedback.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatDate(feedback.created_at)}
                                    </p>
                                </div>

                                {/* Message */}
                                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
                                </div>

                                {/* Page URL */}
                                {feedback.page_url && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Page URL</p>
                                        <a
                                            href={feedback.page_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm truncate max-w-full transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                            {feedback.page_url}
                                        </a>
                                    </div>
                                )}

                                {/* Screenshot */}
                                {feedback.screenshot_url && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Screenshot</p>
                                        <a href={feedback.screenshot_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={feedback.screenshot_url}
                                                alt="Screenshot"
                                                className="rounded-xl border border-slate-700/50 max-h-72 object-contain bg-slate-900 w-full hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                    </div>
                                )}

                                {/* Submitter Information */}
                                <div className="bg-slate-900/40 rounded-xl border border-slate-700/30 p-4 space-y-3">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitter Information</p>
                                    <div className="space-y-3">
                                        {feedback.name && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/20">
                                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Name</p>
                                                    <p className="text-sm text-slate-200 font-medium">{feedback.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {feedback.email && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/20">
                                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Email</p>
                                                    <p className="text-sm text-slate-200 font-medium font-mono">{feedback.email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reporter */}
                                {feedback.created_by && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                        <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Submitted by (System)</p>
                                            <p className="text-sm font-medium text-slate-200">
                                                {feedback.created_by.full_name || feedback.created_by.username}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                {(feedback.ip_address || feedback.user_agent) && (
                                    <div className="bg-slate-900/60 rounded-xl border border-slate-700/30 p-4 space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metadata</p>
                                        {feedback.ip_address && (
                                            <p className="text-xs text-slate-400">IP: <span className="text-slate-300 font-mono">{feedback.ip_address}</span></p>
                                        )}
                                        {feedback.user_agent && (
                                            <p className="text-xs text-slate-400 leading-relaxed">UA: <span className="text-slate-300">{feedback.user_agent}</span></p>
                                        )}
                                    </div>
                                )}

                                {/* ── Admin Actions ── */}
                                <div className="space-y-4 border-t border-slate-700/40 pt-6">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Actions</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Status */}
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
                                            <select
                                                value={form.status}
                                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                                className="w-full bg-[#071229] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                                    <option key={val} value={val}>{cfg.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Priority */}
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Priority</label>
                                            <select
                                                value={form.priority}
                                                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                                className="w-full bg-[#071229] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                                            >
                                                {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                                                    <option key={val} value={val}>{cfg.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Assign To */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Assign To</label>
                                        <select
                                            value={form.assigned_to_id}
                                            onChange={e => setForm(p => ({ ...p, assigned_to_id: e.target.value }))}
                                            className="w-full bg-[#071229] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                                        >
                                            <option value="">— Unassigned —</option>
                                            {staff.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Save Changes
                                        </button>

                                        {!confirmDelete ? (
                                            <button
                                                onClick={() => setConfirmDelete(true)}
                                                className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleDelete} className="px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
                                                    Confirm
                                                </button>
                                                <button onClick={() => setConfirmDelete(false)} className="px-3 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm cursor-pointer">
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DevFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [selectedId, setSelectedId] = useState(null);
    const [staff, setStaff] = useState([]);

    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [ordering, setOrdering] = useState('-created_at');

    const searchTimer = useRef(null);

    // Load staff users for assignment dropdown
    useEffect(() => {
        api.get('/users/', { params: { page_size: 100 } })
            .then(r => setStaff(r.data?.results || r.data || []))
            .catch(() => { });
    }, []);

    const loadFeedbacks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                page_size: pageSize,
                ordering,
            };
            if (search) params.search = search;
            if (filterType) params.type = filterType;
            if (filterPriority) params.priority = filterPriority;
            if (filterStatus) params.status = filterStatus;

            const data = await getFeedbacks(params);
            setFeedbacks(data.results ?? data);
            setTotalCount(data.count ?? (data.results ?? data).length);
        } catch {
            toast.error('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, filterType, filterPriority, filterStatus, ordering]);

    useEffect(() => { loadFeedbacks(); }, [loadFeedbacks]);

    const handleSearch = (val) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 400);
    };

    const toggleOrder = (field) => {
        setOrdering(prev => prev === field ? `-${field}` : field);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    // Stat counts
    const newCount = feedbacks.filter(f => f.status === 'new').length;
    const criticalCount = feedbacks.filter(f => f.priority === 'critical').length;
    const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;

    return (
        <div className="min-h-full bg-[#071229] text-slate-200">
            {/* ── Page Header ── */}
            <div className="px-6 py-5 border-b border-slate-800/60">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Bug className="w-6 h-6 text-red-400" />
                            Developer Feedback
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5">Manage bug reports, UI issues, and feature suggestions</p>
                    </div>
                    <button
                        onClick={loadFeedbacks}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-xl text-sm text-slate-300 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    {[
                        { label: 'Total', value: totalCount, color: 'text-blue-400', icon: SlidersHorizontal },
                        { label: 'New', value: newCount, color: 'text-yellow-400', icon: AlertCircle },
                        { label: 'Critical', value: criticalCount, color: 'text-red-400', icon: AlertTriangle },
                        { label: 'Resolved', value: resolvedCount, color: 'text-green-400', icon: CheckCircle },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${s.color}`} />
                                <div>
                                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-slate-500">{s.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Filters Bar ── */}
            <div className="px-6 py-4 border-b border-slate-800/40 flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search title or message…"
                        onChange={e => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/40 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>

                {/* Type filter */}
                <select
                    value={filterType}
                    onChange={e => { setFilterType(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 bg-[#071229] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                >
                    <option value="">All Types</option>
                    {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                    ))}
                </select>

                {/* Priority filter */}
                <select
                    value={filterPriority}
                    onChange={e => { setFilterPriority(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 bg-[#071229] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                >
                    <option value="">All Priorities</option>
                    {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                    ))}
                </select>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 bg-[#071229] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none hover:border-slate-600 transition-colors cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                    ))}
                </select>

                {/* Clear filters */}
                {(filterType || filterPriority || filterStatus || search) && (
                    <button
                        onClick={() => { setFilterType(''); setFilterPriority(''); setFilterStatus(''); setSearch(''); setPage(1); }}
                        className="px-3 py-2 bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 rounded-xl text-xs text-slate-400 transition-colors cursor-pointer flex items-center gap-1"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="px-6 py-4">
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700/40 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-3 text-left font-semibold w-10">#</th>
                                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name / Email</th>
                                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        <button
                                            onClick={() => toggleOrder('priority')}
                                            className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            Priority <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Assigned To</th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        <button
                                            onClick={() => toggleOrder('created_at')}
                                            className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            Created <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/20">
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {Array.from({ length: 9 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 bg-slate-700/40 rounded w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                                            <Bug className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No feedback found</p>
                                        </td>
                                    </tr>
                                ) : feedbacks.map((f, idx) => (
                                    <tr
                                        key={f.id}
                                        className={`group hover:bg-slate-700/20 transition-colors ${f.status === 'new' ? 'border-l-2 border-l-yellow-400/60' : ''}`}
                                    >
                                        <td className="px-4 py-3 text-slate-500 text-xs">{(page - 1) * pageSize + idx + 1}</td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <div className="flex items-start gap-2">
                                                {f.screenshot_url && (
                                                    <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" title="Has screenshot" />
                                                )}
                                                <span className="text-slate-200 font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
                                                    {f.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs space-y-1">
                                                {f.name && (
                                                    <p className="text-slate-300 font-medium">{f.name}</p>
                                                )}
                                                {f.email && (
                                                    <p className="text-slate-500 font-mono">{f.email}</p>
                                                )}
                                                {!f.name && !f.email && (
                                                    <p className="text-slate-600">—</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><TypeBadge type={f.type} /></td>
                                        <td className="px-4 py-3"><PriorityBadge priority={f.priority} /></td>
                                        <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                                        <td className="px-4 py-3">
                                            {f.assigned_to ? (
                                                <span className="text-slate-300 text-xs">
                                                    {f.assigned_to.full_name || f.assigned_to.username}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                            {formatDate(f.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setSelectedId(f.id)}
                                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/30 text-sm text-slate-400">
                            <span>{totalCount} total feedbacks</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-lg text-xs disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    Prev
                                </button>
                                <span className="text-xs px-2">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-lg text-xs disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedId && (
                <FeedbackModal
                    feedbackId={selectedId}
                    onClose={() => setSelectedId(null)}
                    onUpdate={loadFeedbacks}
                    staff={staff}
                />
            )}
        </div>
    );
}
