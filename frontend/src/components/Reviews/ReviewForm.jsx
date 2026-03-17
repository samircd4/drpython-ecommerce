import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaCamera, FaTimes } from "react-icons/fa";
import api from "../../api/client";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

const ReviewForm = ({ productId, onSubmit }) => {
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [name, setName] = useState("");
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name || user.full_name || user.username || "");
        }
    }, [user]);

    // Clean up object URLs to avoid memory leaks
    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const availableSlots = 5 - images.length;
        if (availableSlots <= 0) {
            toast.warning("You can only upload up to 5 images.");
            return;
        }

        const newFiles = files.slice(0, availableSlots);
        const validFiles = newFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (>5MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setImages(prev => [...prev, ...validFiles]);
            setPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
        }

        if (files.length > availableSlots) {
            toast.info("Limit is 5 images total.");
        }
        
        // Reset input so the same file can be picked again if removed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warning("Please select a rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('product', productId);
            formData.append('rating', rating);
            formData.append('comment', comment);
            
            // Append first image to legacy 'image' field if exists
            if (images.length > 0) {
                formData.append('image', images[0]);
                
                // Append remaining images to 'uploaded_images' to avoid duplication
                if (images.length > 1) {
                    images.slice(1).forEach(img => {
                        formData.append('uploaded_images', img);
                    });
                }
            }

            const response = await api.post('/reviews/', formData);

            if (response.status === 201 || response.status === 200) {
                toast.success("Review published successfully!");

                if (onSubmit) {
                    const newReview = {
                        ...response.data,
                        customer_name: name || "You",
                        created_at: new Date().toISOString()
                    };
                    onSubmit(newReview);
                }

                // Reset form
                setRating(0);
                setComment("");
                setImages([]);
                setPreviews([]);
            }
        } catch (err) {
            console.error("Failed to submit review:", err);
            let errorMsg = "Failed to submit review. Please try again.";
            if (err.response?.data) {
                const data = err.response.data;
                if (err.response.status === 400 && JSON.stringify(data).toLowerCase().includes("unique")) {
                    errorMsg = "You have already reviewed this product.";
                } else if (data.detail) {
                    errorMsg = data.detail;
                } else if (typeof data === 'object') {
                    const firstError = Object.values(data)[0];
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                }
            }
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">Share Your Experience</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Overall Rating</label>
                    <div className="flex gap-2">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        className="hidden"
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <div className={`p-2 rounded-xl transition-all duration-200 ${ratingValue <= (hover || rating) ? "bg-purple-50 scale-110" : "bg-gray-50 hover:bg-gray-100"}`}>
                                        <FaStar
                                            size={28}
                                            className={`transition-colors duration-200 ${ratingValue <= (hover || rating) ? "text-purple-600" : "text-gray-300"}`}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50/50 text-gray-500 font-medium transition-all"
                            disabled
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Review Content</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white h-32 resize-none transition-all placeholder:text-gray-400"
                        placeholder="What did you like or dislike about the product?"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Visual Feedback (Max 5)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center">
                        {previews.map((url, index) => (
                            <div key={index} className="relative group/preview w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm">
                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {images.length < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50/50 transition-all cursor-pointer group"
                            >
                                <FaCamera size={20} className="mb-1" />
                                <span className="text-[10px] uppercase font-bold tracking-tighter">Add Photo</span>
                            </button>
                        )}
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        disabled={rating === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <span>Publish Review</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
