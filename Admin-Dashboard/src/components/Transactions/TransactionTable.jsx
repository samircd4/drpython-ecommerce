import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const TransactionTable = ({ transactions = [], sortColumn, sortDirection, onSort, onView, onEdit, onDelete }) => {
    const getMethodIcon = (method) => {
        // Simple text fallback for now, could be icons later
        return <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{method}</span>;
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white bg-[#0b3a61]">
                    <tr>
                        {[
                            { id: 'id', label: 'ID' },
                            { id: 'customer_name', label: 'Client' },
                            { id: 'amount', label: 'Amount' },
                            { id: 'transaction_id', label: 'TXN ID' },
                            { id: 'payment_method', label: 'Method' },
                            { id: 'is_paid', label: 'Status' },
                            { id: 'payment_date', label: 'Date' }
                        ].map(col => (
                            <th key={col.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort(col.id)}>
                                <div className="flex items-center whitespace-nowrap">{col.label} <SortArrow column={col.id} sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {transactions.map((txn) => (
                        <tr 
                            key={txn.id} 
                            onClick={() => onView?.(txn)}
                            className="hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-mono text-sm">#{txn.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">{txn.customer_name || 'Anonymous'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-bold text-green-400`}>
                                    Tk {txn.amount}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs uppercase">{txn.transaction_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getMethodIcon(txn.payment_method)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${txn.is_paid
                                    ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                    : 'bg-red-500/10 text-red-400 ring-red-500/20'
                                    }`}>
                                    {txn.is_paid ? 'Paid' : 'Unpaid'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm font-mono">{new Date(txn.payment_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
