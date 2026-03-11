import React, { useState, useMemo } from 'react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import TransactionTable from '../Components/Transactions/TransactionTable';
import mockTransactions from '../data/transactions.json';

const Transactions = () => {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [showBy, setShowBy] = useState(12);
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...transactions].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setTransactions(sorted);
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                txn.client.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'All' || txn.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchQuery, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / showBy));
    const visibleTransactions = filteredTransactions.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb title="Transactions" paths={["Home", "Transactions"]} />

            <div className="my-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="flex-1 w-full">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search by ID or client..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Payment">Payment</option>
                            <option value="Refund">Refund</option>
                        </select>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span>Show:</span>
                            <select
                                value={showBy}
                                onChange={(e) => { setShowBy(Number(e.target.value)); setPage(1); }}
                                className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                                {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <TransactionTable
                transactions={visibleTransactions}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleTransactions.length}</span> of <span className="text-slate-200 font-semibold">{filteredTransactions.length}</span> transactions
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Transactions;
