import React, { useEffect, useState } from "react";
import api from "../api/client";
import productsData from "../data/products.json";
import Product from "./Product";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/');
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                // Limit to first 10 or 20 if needed, but for now show what API returns (usually paginated)
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                // Fallback to local data
                const mapped = productsData.map(p => ({ ...p, reviews_count: p.reviews }));
                setProducts(mapped);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-lg h-80 animate-pulse"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product) => (
                <Product key={product.id} product={product} />
            ))}
        </div>
    );
};

export default Products;
