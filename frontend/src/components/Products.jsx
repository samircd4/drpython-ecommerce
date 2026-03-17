import React, { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import api from "../api/client";
import productsData from "../data/products.json";
import Product from "./Product";
import { Loader2 } from "lucide-react"; // Assuming lucide-react is available for a nice spinner

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const fetchProducts = useCallback(async (pageToFetch, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsFetchingMore(true);

        try {
            const response = await api.get(`/products/?page=${pageToFetch}`);
            // DRF PageNumberPagination returns: { count, next, previous, results: [] }
            const results = response.data.results || [];
            const hasNext = !!response.data.next;

            setProducts(prev => isInitial ? results : [...prev, ...results]);
            setHasMore(hasNext);
            if (isInitial) setLoading(false);
            else setIsFetchingMore(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            if (isInitial) {
                // Fallback to local data only on initial load error
                const mapped = productsData.map(p => ({ ...p, reviews_count: p.reviews }));
                setProducts(mapped);
                setHasMore(false);
                setLoading(false);
            } else {
                setIsFetchingMore(false);
                setHasMore(false); // Stop trying if we hit an error during pagination
            }
        }
    }, []);

    useEffect(() => {
        fetchProducts(1, true);
    }, [fetchProducts]);

    useEffect(() => {
        if (inView && hasMore && !loading && !isFetchingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    }, [inView, hasMore, loading, isFetchingMore, page, fetchProducts]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-lg h-80 animate-pulse border border-gray-100 dark:border-gray-800"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <Product key={`${product.id}-${product.slug}`} product={product} />
                ))}
            </div>

            {/* Sentinel element for Infinite Scroll */}
            <div ref={ref} className="w-full flex justify-center py-6 h-20">
                {isFetchingMore && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm font-medium">Loading more products...</span>
                    </div>
                )}
                {!hasMore && products.length > 0 && (
                    <p className="text-gray-500 text-sm italic">You've reached the end of the collection.</p>
                )}
            </div>
        </div>
    );
};

export default Products;
