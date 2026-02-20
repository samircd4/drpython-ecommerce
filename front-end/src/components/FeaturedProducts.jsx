import React, { useEffect, useState } from "react";
import api from "../api/client";
import productsData from "../data/products.json";
import Product from "./Product";

const FeaturedProducts = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await api.get('/products/featured/');
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setFeatured(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching featured products:", error);
                // Fallback to local data
                const filtered = productsData
                    .filter((product) => product.is_featured)
                    .map(p => ({ ...p, reviews_count: p.reviews }));
                setFeatured(filtered);
                setLoading(false);
            }
        };

        fetchFeatured();
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
            {featured.map((product) => (
                <Product key={product.id} product={product} />
            ))}
        </div>
    );
};

export default FeaturedProducts;
