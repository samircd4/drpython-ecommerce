import React, { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import InventoryTable from '../components/Inventory/InventoryTable';
import api from '../api/axiosConfig';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showBy, setShowBy] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    page_size: showBy,
                    search: searchQuery,
                    ordering: sortColumn ? (sortDirection === 'asc' ? sortColumn : `-${sortColumn}`) : undefined
                };
                
                const response = await api.get('/products/', { params });
                setInventory(response.data.results || []);
                setTotalCount(response.data.count || 0);
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, [page, showBy, searchQuery, sortColumn, sortDirection]);

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / showBy));

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb title="Inventory" paths={[{ label: "Home", path: "/" }, { label: "Inventory", path: "/inventory" }]} />

            <div className="my-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="flex-1 w-full">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search inventory by name, SKU or brand..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
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
                    </div>
                </div>
            </div>

            <InventoryTable
                items={inventory}
                loading={loading}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
            />

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{inventory.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> products
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Inventory;
