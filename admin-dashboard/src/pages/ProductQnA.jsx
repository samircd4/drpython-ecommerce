import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Trash2, CheckCircle, Clock } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import api from '../api/axiosConfig';
import useProductLink from '../hooks/useProductLink';
import { useAuth } from '../Context/AuthContext';


const ProductQnA = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const { copyToClipboard } = useProductLink();
    const { hasPermission } = useAuth();


    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                // Assuming we have an endpoint for questions
                const response = await api.get('/questions/', { params: { page } });
                setQuestions(response.data.results || []);
                setTotalCount(response.data.count || 0);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [page]);

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <Breadcrumb title="Product Q&A" paths={["Home", "Messages", "Product Q&A"]} />
            
            <div className="my-6 space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-20 bg-[#071229] rounded-xl border border-slate-800 text-slate-500">
                        <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No questions found.</p>
                    </div>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="bg-[#071229] border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-100 font-bold">{q.customer_name || 'Anonymous'}</h4>
                                        <p className="text-xs text-slate-500">{new Date(q.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {q.answer ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                                            <CheckCircle className="w-3 h-3" /> Answered
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full border border-yellow-500/20">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="ml-13 space-y-4">
                                <div className="bg-[#0b1a2a] p-4 rounded-lg border border-slate-700/50">
                                    <p className="text-sm text-slate-300 italic">"{q.question}"</p>
                                    <p 
                                        onClick={() => copyToClipboard(q.product_slug, q.product_name)}
                                        className="text-xs text-blue-400 mt-2 font-medium cursor-pointer hover:text-blue-300 transition-colors"
                                        title="Click to copy product link"
                                    >
                                        Product: {q.product_name}
                                    </p>
                                </div>
                                
                                {q.answer ? (
                                    <div className="bg-blue-600/5 p-4 rounded-lg border border-blue-600/20">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase mb-2">Our Answer</p>
                                        <p className="text-sm text-slate-200">{q.answer}</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        {hasPermission('reviews.change_question') && (
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-all cursor-pointer">
                                                Answer Question
                                            </button>
                                        )}
                                        {hasPermission('reviews.delete_question') && (
                                            <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalCount > 10 && (
                <div className="mt-8 flex justify-center">
                    <Pagination page={page} setPage={setPage} total={Math.ceil(totalCount / 10)} />
                </div>
            )}
        </div>
    );
};

export default ProductQnA;
