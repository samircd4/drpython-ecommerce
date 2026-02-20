import React, { useEffect, useState } from "react";
import api from "../api/client";
import productsData from "../data/products.json";
import Product from "./Product";

const BestSellers = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await api.get('/products/bestsellers/');
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setBestSellers(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching best sellers:", error);
                // Fallback to local data
                const filtered = productsData
                    .filter((product) => product.rating >= 4.5 && product.reviews >= 150)
                    .sort((a, b) => b.reviews - a.reviews)
                    .slice(0, 5)
                    .map(p => ({ ...p, reviews_count: p.reviews }));
                setBestSellers(filtered);
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-lg h-80 animate-pulse"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {bestSellers.map((product) => (
                <Product key={product.id} product={product} />
            ))}
        </div>
    );
};

export default BestSellers;
