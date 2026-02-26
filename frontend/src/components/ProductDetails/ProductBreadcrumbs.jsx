import React from "react";
import { Link } from "react-router-dom";

const ProductBreadcrumbs = ({ category, productName }) => {
    return (
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
            <ol className="flex items-center gap-2">
                <li>
                    <Link to="/products" className="hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 rounded">
                        Products
                    </Link>
                </li>
                <li>›</li>
                <li>
                    <Link to={`/category/${category?.slug || ''}`} className="hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 rounded">
                        <span>{category?.name || "Category"}</span>
                    </Link>
                </li>
                <li>›</li>
                <li className="font-medium text-gray-700">
                    <span>{productName || "Product Name"}</span>
                </li>
            </ol>
        </nav>
    );
};

export default ProductBreadcrumbs;
