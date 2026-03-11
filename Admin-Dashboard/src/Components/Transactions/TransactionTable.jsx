import React from 'react';
import { Eye, Download, Search } from 'lucide-react';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const TransactionTable = ({ transactions = [], sortColumn, sortDirection, onSort }) => {
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
                            { id: 'id', label: 'TXN ID' },
                            { id: 'client', label: 'Client' },
                            { id: 'amount', label: 'Amount' },
                            { id: 'type', label: 'Type' },
                            { id: 'method', label: 'Method' },
                            { id: 'status', label: 'Status' },
                            { id: 'date', label: 'Date' }
                        ].map(col => (
                            <th key={col.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort(col.id)}>
                                <div className="flex items-center whitespace-nowrap">{col.label} <SortArrow column={col.id} sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-mono text-sm">{txn.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">{txn.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-bold ${txn.type === 'Payment' ? 'text-green-400' : 'text-red-400'}`}>
                                    {txn.type === 'Payment' ? '+' : '-'}${txn.amount.toFixed(2)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-xs uppercase font-bold tracking-wider">{txn.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getMethodIcon(txn.method)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${txn.status === 'Completed'
                                    ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                    : txn.status === 'Pending'
                                        ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                        : 'bg-red-500/10 text-red-400 ring-red-500/20'
                                    }`}>
                                    {txn.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm font-mono">{txn.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                    <button title="View Receipt" className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button title="Download Invoice" className="p-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-all">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
