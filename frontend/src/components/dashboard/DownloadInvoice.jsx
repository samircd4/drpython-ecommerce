import api from '../../api/client';
import { useState } from 'react';
import { FaFileDownload } from 'react-icons/fa';

export default function DownloadInvoice({ order }) {
    const [loading, setLoading] = useState(false);

    const downloadInvoice = async () => {
        if (!order?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/orders/${order.id}/invoice/`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${order.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Unable to download invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={downloadInvoice}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                }`}
        >
            {loading ? (
                <>
                    Downloading…
                    <svg
                        className="h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                    </svg>
                </>
            ) : (
                <>
                    <FaFileDownload />
                    Download Invoice
                </>
            )}
        </button>
    );
}
