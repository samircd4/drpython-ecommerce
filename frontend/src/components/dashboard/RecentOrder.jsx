import { FaBoxOpen, FaTruck } from 'react-icons/fa';
import DownloadInvoice from './DownloadInvoice';
import { Link } from 'react-router-dom';

const RecentOrder = ({
    orders,
    ordersLoading,
    ordersError,
    formatDate,
    statusChipClass,
    paymentChipClass,
    getPaymentStatus,
    getTransactionId,
    getPaymentMethod,
    formatAddress,
    sortOrdersDesc,
}) => {
    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBoxOpen /> Recent Orders
                </h2>
            </div>
            {ordersLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
            )}
            {!ordersLoading && ordersError && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                    {ordersError}
                </div>
            )}
            {!ordersLoading && !ordersError && (() => {
                const lastOrder = orders.length ? sortOrdersDesc(orders)[0] : null;
                if (!lastOrder) {
                    return (
                        <div className="text-center py-8 text-gray-500">
                            No recent orders found.
                        </div>
                    );
                }
                return (
                    <div className="border rounded-lg p-4 bg-white border-gray-200">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                            <div className="space-y-1">
                                <div className="font-semibold text-gray-900 block">
                                    Order #{lastOrder.id}
                                </div>
                                <div className="text-sm text-gray-500">{formatDate(lastOrder.created_at)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusChipClass(lastOrder.status)}`}>
                                    {lastOrder.status || 'Pending'}
                                </span>
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                                    ৳ {lastOrder.total_amount ?? lastOrder.total}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                            <div className="text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${paymentChipClass(lastOrder)}`}>
                                    {getPaymentStatus(lastOrder)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-700">Transaction ID: {getTransactionId(lastOrder)}</div>
                            <div className="text-sm text-gray-700">Payment Method: {getPaymentMethod(lastOrder)}</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-600 border-b">
                                        <th className="py-2 pr-3">Item</th>
                                        <th className="py-2 pr-3">Qty</th>
                                        <th className="py-2">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(lastOrder.items || lastOrder.order_items || []).map((it) => (
                                        <tr key={it.id || `${lastOrder.id}-${it.product?.id || it.product_name}`} className="border-b last:border-0">
                                            <td className="py-2 pr-3 font-semibold">
                                                <Link to={`/products/${it.product?.slug || it.product_name}`}>{it.product?.name || it.product_name}
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        {it.variant?.color ? `${it.variant?.color}` : ''} {it.variant?.ram ? `${it.variant?.ram}GB` : ''}{it.variant?.storage ? `/${it.variant?.storage}GB` : ''}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-2 pr-3">{it.quantity}</td>
                                            <td className="py-2">৳ {it.unit_price ?? it.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-700">
                                <div className="font-medium">Shipping Address</div>
                                <div>{formatAddress(lastOrder.shipping_address)}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <Link
                                    to={`/order-tracking/${lastOrder.id}`}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FaTruck />
                                    Track Order
                                </Link>
                                <DownloadInvoice order={lastOrder} />
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div >
    );
};

export default RecentOrder;

