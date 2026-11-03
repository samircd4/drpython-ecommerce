// Order statuses, mirroring backend/orders/models.py OrderStatus.CANONICAL.
// Keep codes, labels and order in sync with the backend.
export const ORDER_STATUSES = [
    { code: 'pending', label: 'Pending', badge: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20', color: '#eab308', bgClass: 'bg-yellow-500' },
    { code: 'confirmed', label: 'Confirmed', badge: 'bg-blue-500/10 text-blue-400 ring-blue-500/20', color: '#3b82f6', bgClass: 'bg-blue-500' },
    { code: 'processing', label: 'Processing', badge: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20', color: '#06b6d4', bgClass: 'bg-cyan-500' },
    { code: 'shipped', label: 'Shipped', badge: 'bg-purple-500/10 text-purple-400 ring-purple-500/20', color: '#a855f7', bgClass: 'bg-purple-500' },
    { code: 'delivered', label: 'Delivered', badge: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', color: '#10b981', bgClass: 'bg-emerald-500' },
    { code: 'cancelled', label: 'Cancelled', badge: 'bg-red-500/10 text-red-400 ring-red-500/20', color: '#ef4444', bgClass: 'bg-red-500' },
    { code: 'returned', label: 'Returned', badge: 'bg-orange-500/10 text-orange-400 ring-orange-500/20', color: '#f97316', bgClass: 'bg-orange-500' },
];

const UNKNOWN_STATUS = { badge: 'bg-slate-500/10 text-slate-400 ring-slate-500/20', color: '#94a3b8', bgClass: 'bg-slate-400' };

// Returns the status code for an order, falling back to its display name for older payloads.
export const getOrderStatusCode = (order) => {
    if (!order) return 'pending';
    if (order.status_code) return order.status_code;
    const byLabel = ORDER_STATUSES.find((s) => s.label.toLowerCase() === String(order.status || '').toLowerCase());
    return byLabel ? byLabel.code : 'pending';
};

// Accepts a status code or display name and returns its metadata.
export const getOrderStatusMeta = (value) => {
    const key = String(value || '').toLowerCase();
    const match = ORDER_STATUSES.find((s) => s.code === key || s.label.toLowerCase() === key);
    return match || { ...UNKNOWN_STATUS, code: key, label: value || 'Unknown' };
};
