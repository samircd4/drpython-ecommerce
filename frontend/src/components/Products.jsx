import React, { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import api from "../api/client";
import Product from "./Product";
import { Loader2 } from "lucide-react";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState(null);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    // 🔥 Fetch products from Django API
    const fetchProducts = useCallback(async (pageToFetch, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsFetchingMore(true);

        try {
            const response = await api.get(`/products/?page=${pageToFetch}`);

            // DRF pagination format:
            // { count, next, previous, results: [] }
            const results = response.data.results || [];
            const hasNext = !!response.data.next;

            setProducts(prev => isInitial ? results : [...prev, ...results]);
            setHasMore(hasNext);

            if (isInitial) setLoading(false);
            else setIsFetchingMore(false);

        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to load products. Please try again later.");

            if (isInitial) setLoading(false);
            else setIsFetchingMore(false);

            setHasMore(false);
        }
    }, []);

    // First load
    useEffect(() => {
        fetchProducts(1, true);
    }, [fetchProducts]);

    // Infinite scroll
    useEffect(() => {
        if (inView && hasMore && !loading && !isFetchingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    }, [inView, hasMore, loading, isFetchingMore, page, fetchProducts]);

    // ❌ Error UI
    if (error) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-red-500">{error}</h2>
            </div>
        );
    }

    // ⏳ Skeleton loader
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg shadow-lg h-80 animate-pulse border border-gray-100 dark:border-gray-800"
                    />
                ))}
            </div>
        );
    }

    // ✅ Products grid
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <Product key={`${product.id}-${product.slug}`} product={product} />
                ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={ref} className="w-full flex justify-center py-6 h-20">
                {isFetchingMore && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm font-medium">Loading more products...</span>
                    </div>
                )}

                {!hasMore && products.length > 0 && (
                    <p className="text-gray-500 text-sm italic">
                        You've reached the end of the collection.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Products;