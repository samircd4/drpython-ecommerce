import React from "react";
import { MessageSquare, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStoreConfig } from "../../hooks/useStoreConfig";

const PopularClients = ({ clients = [] }) => {
    const navigate = useNavigate();
    const { config } = useStoreConfig();
    const symbol = config?.currency_symbol || "৳";

    const defaultClients = [
        { id: 1, name: "Miron Mahmud", orders: 648, amount: 5500, avatar: "https://i.pravatar.cc/150?u=miron" },
        { id: 2, name: "Tahmina Bonny", orders: 590, amount: 4400, avatar: "https://i.pravatar.cc/150?u=tahmina" },
    ];

    const displayClients = clients.length > 0 ? clients : defaultClients;

    // Helper to fix backend image paths (adding baseUrl if relative)
    const fixImage = (path, name = "User") => {
        if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        if (path.startsWith('http')) return path;
        
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        let baseUrl = API_BASE.replace(/\/api\/?$/, '');
        
        // If baseUrl is relative, make it absolute
        if (baseUrl.startsWith('/')) {
            baseUrl = window.location.origin + baseUrl;
        } else if (!baseUrl.startsWith('http')) {
            baseUrl = 'http://localhost:8000';
        }
        
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div className="bg-[#071229] border border-slate-800 rounded-xl p-6 text-white shadow-lg h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Popular Clients</h2>
                <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                            <th className="pb-4">Clients</th>
                            <th className="pb-4">Orders</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {displayClients.map((client) => (
                            <tr key={client.id} className="group hover:bg-slate-800/20 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={fixImage(client.avatar, client.name)} 
                                            alt={client.name} 
                                            className="w-10 h-10 rounded-lg object-cover" 
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`;
                                            }}
                                        />
                                        <span className="text-sm font-semibold group-hover:text-blue-400 transition-colors uppercase">{client.name.toLowerCase()}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-slate-300 font-medium">{client.orders}</td>
                                <td className="py-4 text-sm text-slate-300 font-medium">
                                    {typeof client.amount === 'number' 
                                        ? `${symbol}${client.amount.toLocaleString()}` 
                                        : client.amount}
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => navigate('/chats', { state: { userId: client.user_id } })}
                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                            title="Chat with Customer"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/customers/view/${client.id}`)}
                                            className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                                            title="View Profile"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PopularClients;
