import { Bell, Package, ShoppingCart, CreditCard, Boxes, Star, MessageSquare, Tag, Info } from 'lucide-react';

const TYPE_META = {
    new_order: { icon: ShoppingCart, color: 'text-emerald-400', label: 'New Order' },
    order_update: { icon: Package, color: 'text-blue-400', label: 'Order Update' },
    payment: { icon: CreditCard, color: 'text-cyan-400', label: 'Payment' },
    stock: { icon: Boxes, color: 'text-amber-400', label: 'Stock' },
    review: { icon: Star, color: 'text-yellow-400', label: 'Review' },
    message: { icon: MessageSquare, color: 'text-indigo-400', label: 'Message' },
    promotion: { icon: Tag, color: 'text-orange-400', label: 'Promotion' },
    system: { icon: Info, color: 'text-slate-300', label: 'System' },
};

export const getNotificationLabel = (type) => TYPE_META[type]?.label || 'Notification';

export const getNotificationIcon = (type) => TYPE_META[type] || { icon: Bell, color: 'text-slate-400' };

/** Admin route to open for a notification, or an absolute URL. */
export const getNotificationTarget = (notif) => {
    const orderId = notif.data?.order_id
        ?? notif.link?.match(/\/order-tracking\/(\d+)/)?.[1];
    if (orderId && ['new_order', 'order_update', 'payment'].includes(notif.type)) {
        return `/orders?search=${orderId}`;
    }
    if (notif.link) return notif.link;
    if (notif.type === 'promotion') return '/coupons';
    return null;
};

export const openNotificationTarget = (notif, navigate) => {
    const target = getNotificationTarget(notif);
    if (!target) return;
    if (/^https?:\/\//.test(target)) {
        window.open(target, '_blank', 'noopener');
    } else {
        navigate(target);
    }
};
