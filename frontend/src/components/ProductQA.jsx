import React, { useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import api from "../api/client";

const QAItem = ({ q, onReply, isAdmin }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(q.id, replyText);
        setReplyText("");
        setShowReplyForm(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return "";
        }
    };

    const displayName = q.customer_name || "User";

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-4 hover:shadow-md transition-shadow">
            {/* User Question Section */}
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{displayName}</h4>
                        <span className="text-xs text-gray-400">{formatDate(q.created_at)}</span>
                    </div>
                    {/* No stars as requested */}
                    <p className="text-gray-700 mt-2 leading-relaxed">{q.question}</p>

                    {/* Admin Reply Button */}
                    {isAdmin && !q.answer && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="text-sm text-purple-600 font-medium mt-3 hover:underline focus:outline-none cursor-pointer"
                        >
                            {showReplyForm ? "Cancel" : "Reply as Sarker Shop"}
                        </button>
                    )}
                </div>
            </div>

            {/* Existing Admin Answer */}
            {q.answer && (
                <div className="mt-4 ml-14 bg-gray-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">Sarker Shop</span>
                        <span className="text-xs text-gray-500">Replied</span>
                    </div>
                    <p className="text-gray-600 text-sm">{q.answer}</p>
                </div>
            )}

            {/* Admin Reply Form */}
            {showReplyForm && isAdmin && (
                <div className="mt-4 ml-14 animate-fade-in">
                    <form onSubmit={handleReplySubmit}>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mb-2"
                            placeholder="Write an official response..."
                            rows="3"
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowReplyForm(false)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 cursor-pointer"
                            >
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const ProductQA = ({ productId, productQuestions = [] }) => {
    const { user } = useUser();
    const [newQuestion, setNewQuestion] = useState("");
    const [questions, setQuestions] = useState(productQuestions);

    useEffect(() => {
        setQuestions(productQuestions);
    }, [productQuestions]);

    const isAdmin = !!user?.is_staff;

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        if (!user) {
            toast.error("Please login first to ask a question");
            return;
        }

        try {
            const payload = {
                product: productId,
                question: newQuestion
            };
            const res = await api.post('/questions/', payload);
            setQuestions([res.data, ...questions]);
            setNewQuestion("");
            toast.success("Question submitted!");
        } catch (err) {
            console.error("Failed to submit question:", err);
            toast.error("Failed to submit question. Please try again.");
        }
    };

    const handleAdminReply = async (id, replyText) => {
        try {
            const res = await api.patch(`/questions/${id}/`, { answer: replyText });
            setQuestions(questions.map(q => q.id === id ? res.data : q));
            toast.success("Reply posted successfully!");
        } catch (err) {
            console.error("Failed to post reply:", err);
            toast.error("Failed to post reply.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Questions & Answers</h3>

            {questions.length > 0 ? (
                <div className="flex flex-col gap-2 mb-10">
                    {questions.map((q) => (
                        <QAItem
                            key={q.id}
                            q={q}
                            onReply={handleAdminReply}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl mb-10 border border-dashed border-gray-200">
                    <p className="text-gray-500">No questions yet. Be the first to ask!</p>
                </div>
            )}

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Have a question?</h4>
                <form onSubmit={handleQuestionSubmit} className="relative">
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type your question regarding this product..."
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow bg-white resize-none h-32"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={!newQuestion.trim()}
                        className="absolute right-4 bottom-4 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <IoSend size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductQA;
