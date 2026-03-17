import React from 'react';
import { FaStar } from "react-icons/fa";
import { BASE_URL } from "../../api/client";

const ReviewItem = ({ review }) => {
    const { customer_name: user, customer_avatar, rating, created_at, comment } = review;
    const mediaBase = BASE_URL.replace('/api', '');
    
    const date = new Date(created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Helper to resolve image URLs
    const getImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${mediaBase}${url}`;
    };

    const getFileName = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0];
    };

    const avatarUrl = getImageUrl(customer_avatar);

    // Helper to render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? "text-purple-600" : "text-gray-200"}
                size={14}
            />
        ));
    };

    return (
        <div className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 border border-gray-100/60">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {avatarUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-50 ring-offset-1">
                            <img src={avatarUrl} alt={user} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                            {user?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-gray-900 leading-tight">{user}</h4>
                            <div className="flex items-center mt-1 gap-2">
                                <div className="flex items-center">
                                    {renderStars(rating)}
                                </div>
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100">
                                    Verified Purchase
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{date}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 mt-2">
                        {comment}
                    </p>

                    {/* Image Gallery */}
                    {(review.image || (review.images && review.images.length > 0)) && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {/* Legacy Single Image fallback if not already in the images gallery */}
                            {review.image && (!review.images || !review.images.some(img => getFileName(img.image) === getFileName(review.image))) && (
                                <div className="relative group/img overflow-hidden rounded-xl border border-gray-100 shadow-sm aspect-square bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                                    <img
                                        src={getImageUrl(review.image)}
                                        alt="Review attachment"
                                        className="w-full h-full object-cover cursor-zoom-in"
                                        onClick={() => window.open(getImageUrl(review.image), '_blank')}
                                    />
                                </div>
                            )}
                            
                            {/* New Multiple Images Gallery */}
                            {review.images?.map((imgObj, idx) => (
                                <div key={imgObj.id || idx} className="relative group/img overflow-hidden rounded-xl border border-gray-100 shadow-sm aspect-square bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                                    <img
                                        src={getImageUrl(imgObj.image)}
                                        alt={`Review attachment ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-zoom-in"
                                        onClick={() => window.open(getImageUrl(imgObj.image), '_blank')}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewItem;
