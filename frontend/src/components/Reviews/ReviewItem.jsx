import React from 'react';
import { FaStar } from "react-icons/fa";

const ReviewItem = ({ review }) => {
    const { customer_name: user, rating, created_at, comment, avatar } = review;
    const date = new Date(created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Helper to render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? "text-purple-600" : "text-gray-300"}
                size={14}
            />
        ));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {avatar ? (
                        <img src={avatar} alt={user} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                            {user.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-gray-800">{user}</h4>
                        <span className="text-sm text-gray-500">{date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        {renderStars(rating)}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{comment}</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewItem;
