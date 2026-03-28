import React from "react";
import { MessageSquare, Eye, MoreHorizontal } from "lucide-react";

const PopularClients = () => {
    const clients = [
        { id: 1, name: "Miron Mahmud", orders: 648, amount: "$5500", avatar: "https://i.pravatar.cc/150?u=miron" },
        { id: 2, name: "Tahmina Bonny", orders: 590, amount: "$4400", avatar: "https://i.pravatar.cc/150?u=tahmina" },
        { id: 3, name: "Labonno Khan", orders: 408, amount: "$3300", avatar: "https://i.pravatar.cc/150?u=labonno" },
        { id: 4, name: "Sheikh Adabali", orders: 357, amount: "$2200", avatar: "https://i.pravatar.cc/150?u=sheikh" },
        { id: 5, name: "Johara Khatun", orders: 289, amount: "$1100", avatar: "https://i.pravatar.cc/150?u=johara" },
        { id: 6, name: "Kurulus Osman", orders: 194, amount: "$789", avatar: "https://i.pravatar.cc/150?u=osman" },
    ];

    return (
        <div className="bg-[#071229] border border-slate-800 rounded-xl p-6 text-white shadow-lg h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Popular Clients</h2>
                <button className="text-slate-400 hover:text-white transition-colors">
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
                        {clients.map((client) => (
                            <tr key={client.id} className="group hover:bg-slate-800/20 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <span className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{client.name.toLowerCase()}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-slate-300 font-medium">{client.orders}</td>
                                <td className="py-4 text-sm text-slate-300 font-medium">{client.amount}</td>
                                <td className="py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all">
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
