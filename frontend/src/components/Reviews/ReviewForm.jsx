import React, { useState, useEffect } from 'react';
import { FaStar } from "react-icons/fa";
import api from "../../api/client";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

const ReviewForm = ({ productId, onSubmit }) => {
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || user.full_name || user.username || "");
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warning("Please select a rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                product: productId,
                rating: rating,
                comment: comment
            };


            const response = await api.post('/reviews/', payload);

            if (response.status === 201 || response.status === 200) {
                toast.success("Review submitted successfully!");

                // Construct object for local UI update
                const newReview = {
                    ...response.data,
                    customer_name: name || "You", // Use current name for immediate feedback
                    created_at: new Date().toISOString()
                };

                if (onSubmit) onSubmit(newReview);

                // Reset form
                setRating(0);
                setComment("");
            }
        } catch (err) {
            console.error("Failed to submit review:", err);

            let errorMsg = "Failed to submit review. Please try again.";

            if (err.response?.data) {
                const data = err.response.data;

                // 1. Check for specific "already reviewed" logic or unique constraint errors
                if (err.response.status === 400 && (
                    JSON.stringify(data).toLowerCase().includes("unique") ||
                    JSON.stringify(data).toLowerCase().includes("already exists") ||
                    JSON.stringify(data).toLowerCase().includes("already reviewed")
                )) {
                    errorMsg = "You have already reviewed this product.";
                }
                // 2. Extract detail or non_field_errors
                else if (data.detail) {
                    errorMsg = data.detail;
                } else if (data.non_field_errors && data.non_field_errors[0]) {
                    errorMsg = data.non_field_errors[0];
                }
                // 3. Fallback: Take the first message from any field error
                else if (typeof data === 'object') {
                    const firstError = Object.values(data)[0];
                    if (Array.isArray(firstError)) errorMsg = firstError[0];
                    else if (typeof firstError === 'string') errorMsg = firstError;
                }
            }

            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        className="hidden"
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <FaStar
                                        size={24}
                                        className={`transition-colors duration-200 ${ratingValue <= (hover || rating) ? "text-purple-600" : "text-gray-300"}`}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                        placeholder="Your name"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white h-24 resize-none"
                        placeholder="Share your experience..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-w-[140px]"
                    disabled={rating === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        "Submit Review"
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
