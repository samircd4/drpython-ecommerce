import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { FaStar, FaLock } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

const ProductReviews = ({ productId, productReviews = [] }) => {
    const { user } = useUser();
    const isLoggedIn = !!user;
    const location = useLocation();

    // Mock initial data if none provided, or use props
    const [reviews, setReviews] = useState(productReviews);

    useEffect(() => {
        setReviews(productReviews);
    }, [productReviews]);

    const handleAddReview = (newReview) => {
        setReviews([newReview, ...reviews]);
    };

    // Calculate stats details...
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
    });

    const LoginToReview = () => (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Want to review this product?</h3>
            <p className="text-gray-500 text-sm mb-6">You need to be logged in to share your experience with other customers.</p>
            <Link
                to="/account"
                state={{ from: location.pathname }}
                className="inline-block px-8 py-3 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
                Login Now
            </Link>
        </div>
    );

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Form */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                        <div className="text-center mb-4">
                            <div className="text-5xl font-black text-gray-900 mb-2">{averageRating}</div>
                            <div className="flex justify-center mb-2 text-purple-600">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.round(averageRating) ? "text-purple-600" : "text-gray-300"} size={18} />
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 font-medium font-sans">Based on {totalReviews} reviews</div>
                        </div>

                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center text-sm gap-2">
                                    <span className="w-3 font-bold text-gray-700 font-sans">{star}</span>
                                    <FaStar className="text-purple-600 text-xs" />
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-purple-600 rounded-full"
                                            style={{ width: `${totalReviews ? (ratingCounts[star] / totalReviews) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-gray-500 font-medium font-sans">{ratingCounts[star]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Form / Login (Desktop) */}
                    <div className="hidden lg:block">
                        {isLoggedIn ? (
                            <ReviewForm productId={productId} onSubmit={handleAddReview} />
                        ) : (
                            <LoginToReview />
                        )}
                    </div>
                </div>

                {/* Right Column: Review List */}
                <div className="lg:col-span-2">
                    {/* Review Form / Login (Mobile) */}
                    <div className="lg:hidden mb-8">
                        {isLoggedIn ? (
                            <ReviewForm productId={productId} onSubmit={handleAddReview} />
                        ) : (
                            <LoginToReview />
                        )}
                    </div>

                    <div className="space-y-5">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <ReviewItem key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-lg">No reviews yet. Be the first to review this product!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
