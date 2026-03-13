import React, { useState, useEffect } from 'react';
import { Mail, User, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import api from '../api/axiosConfig';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // Assuming we have an endpoint for contact messages
                const response = await api.get('/contact-messages/', { params: { page } });
                setMessages(response.data.results || []);
                setTotalCount(response.data.count || 0);
            } catch (error) {
                console.error("Failed to fetch contact messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [page]);

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <Breadcrumb title="Contact Messages" paths={["Home", "Messages", "Contact Messages"]} />
            
            <div className="my-6 space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 bg-[#071229] rounded-xl border border-slate-800 text-slate-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No messages found.</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className="bg-[#071229] border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
                            <div className="p-5 border-b border-slate-800 flex justify-between items-center group-hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-100 font-bold">{msg.name}</h4>
                                        <p className="text-xs text-slate-500">{msg.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(msg.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all cursor-pointer">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 bg-[#0b1a2a]/30">
                                <div className="mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</span>
                                    <p className="text-sm font-semibold text-white">{msg.subject || 'No Subject'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</span>
                                    <p className="text-sm text-slate-300 leading-relaxed mt-1">
                                        {msg.message}
                                    </p>
                                </div>
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

export default ContactMessages;
