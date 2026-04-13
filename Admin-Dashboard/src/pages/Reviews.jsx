import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Eye, CheckCircle, XCircle, Star, MessageSquare, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import FilterBar from '../components/FilterBar/FilterBar';
import ConfirmModal from '../components/Layout/ConfirmModal';
import api from '../api/axiosConfig';
import useProductLink from '../hooks/useProductLink';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


const StatusBadge = ({ status }) => {
    const map = {
        Published: 'bg-green-500/10 text-green-400 ring-green-500/20',
        Pending: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
        Hidden: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ring-1 ${map[status] || 'bg-slate-600'}`}>{status}</span>;
};

const Reviews = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [showBy, setShowBy] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewIdToDelete, setReviewIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { copyToClipboard } = useProductLink();


    React.useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/reviews/`, {
                    params: { page: page }
                });
                
                if (response.data && response.data.results) {
                    setReviews(response.data.results);
                    setTotalCount(response.data.count);
                } else {
                    setReviews(Array.isArray(response.data) ? response.data : []);
                    setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [page]);

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...reviews].sort((a, b) => {
            const valA = a[column];
            const valB = b[column];
            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setReviews(sorted);
    };

    const handleApproveReview = async (reviewId, action) => {
        const label = action === 'approve' ? 'approved' : 'rejected';
        try {
            await api.patch(`/reviews/${reviewId}/`, { status: action === 'approve' ? 'Published' : 'Hidden' });
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: action === 'approve' ? 'Published' : 'Hidden' } : r));
            toast.success(`Review ${label} successfully`);
        } catch (error) {
            console.error(`Failed to ${action} review:`, error);
            toast.error(`Failed to ${label} review`);
        }
    };

    const handleDeleteReview = (reviewId) => {
        setReviewIdToDelete(reviewId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/reviews/${reviewIdToDelete}/`);
            setReviews(prev => prev.filter(r => r.id !== reviewIdToDelete));
            setTotalCount(prev => prev - 1);
            toast.success("Review deleted successfully");
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error("Failed to delete review");
        } finally {
            setIsDeleting(false);
            setReviewIdToDelete(null);
        }
    };

    const filtered = useMemo(() => {
        return reviews.filter(r =>
            (r.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r.product_name || r.product || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reviews, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(totalCount > 0 ? totalCount / showBy : filtered.length / showBy));
    
    const isPaginatedByBackend = totalCount > reviews.length;
    const visible = isPaginatedByBackend ? filtered : filtered.slice((page - 1) * showBy, page * showBy);

    const SortArrow = ({ column }) => {
        if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
        return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb title="Reviews" paths={["Home", "Dashboard", "Reviews"]} />

            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={(n) => { setShowBy(n); setPage(1); }}
                    searchQuery={searchQuery}
                    setSearchQuery={(v) => { setSearchQuery(v); setPage(1); }}
                    showOptions={[12, 24, 48]}
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="text-white bg-[#0b3a61]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                                <div className="flex items-center whitespace-nowrap">ID <SortArrow column="id" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('product')}>
                                <div className="flex items-center whitespace-nowrap">Product <SortArrow column="product" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('rating')}>
                                <div className="flex items-center whitespace-nowrap">Rating <SortArrow column="rating" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Comment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                <div className="flex items-center whitespace-nowrap">Status <SortArrow column="status" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>
                                <div className="flex items-center whitespace-nowrap">Date <SortArrow column="created_at" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-8 text-slate-400">Loading reviews...</td></tr>
                        ) : visible.map(r => (
                            <tr 
                                key={r.id} 
                                onClick={() => navigate(`/products/view/${r.product_id || r.product}`)}
                                className="hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">{r.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer_name || 'U')}&background=random`} alt={r.customer_name} className="w-8 h-8 rounded-lg" />
                                        <span className="text-slate-100 font-medium text-sm">{r.customer_name || 'Anonymous'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(r.product_slug || r.product?.slug, r.product_name || r.product?.name); }}
                                        className="cursor-pointer hover:text-blue-400 transition-colors"
                                        title="Click to copy product link"
                                    >
                                        {r.product_name || `Product ID: ${r.product}`}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-xs font-bold">{r.rating}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <p className="text-slate-400 text-sm truncate" title={r.comment}>{r.comment}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={'Published'} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                                    {new Date(r.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-2">
                                        {hasPermission('reviews.view_review') && (
                                            <button 
                                                onClick={() => navigate(`/products/view/${r.product_id || r.product}`)}
                                                title="View" 
                                                className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                        {hasPermission('reviews.change_review') && (
                                            <>
                                                <button title="Approve" onClick={() => handleApproveReview(r.id, 'approve')} className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all cursor-pointer"><CheckCircle className="h-4 w-4" /></button>
                                                <button title="Reject" onClick={() => handleApproveReview(r.id, 'reject')} className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-white transition-all cursor-pointer"><XCircle className="h-4 w-4" /></button>
                                            </>
                                        )}
                                        {hasPermission('reviews.delete_review') && (
                                            <button title="Delete" onClick={() => handleDeleteReview(r.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{totalCount || filtered.length}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this review?"
            />
        </div>
    );
};

export default Reviews;
