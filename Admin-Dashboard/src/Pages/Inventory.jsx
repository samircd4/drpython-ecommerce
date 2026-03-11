import React, { useState, useMemo } from 'react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import InventoryTable from '../Components/Inventory/InventoryTable';
import mockInventory from '../data/inventory.json';

const Inventory = () => {
    const [inventory, setInventory] = useState(mockInventory);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showBy, setShowBy] = useState(12);
    const [sortColumn, setSortColumn] = useState('productName');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...inventory].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setInventory(sorted);
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter(item =>
            item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredInventory.length / showBy));
    const visibleItems = filteredInventory.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <Breadcrumb title="Inventory" paths={["Home", "Inventory"]} />

            <div className="my-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="flex-1 w-full">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search inventory..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
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
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm">
                            Update Stock
                        </button>
                    </div>
                </div>
            </div>

            <InventoryTable
                items={visibleItems}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleItems.length}</span> of <span className="text-slate-200 font-semibold">{filteredInventory.length}</span> products
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Inventory;
