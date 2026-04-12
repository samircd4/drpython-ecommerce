import React from "react";
import { FaStar } from "react-icons/fa";
import ProductAttributes from "../ProductAttributes";
import { Link } from "react-router-dom";
import { fixImage } from "../../context/CartContext.jsx";
import TakaIcon from "../TakaIcon";

const ProductInfo = ({
    name,
    brandObj,
    brand,
    sku,
    rating,
    filledStars,
    reviews_count,
    displayPrice,
    originalPrice,
    displayWholesalePrice,
    PRICE_COLOR_HEX,
    stockStatus,
    displayStockQuantity,
    variantColors,
    selectedColor,
    setSelectedColor,
    filteredVariants,
    selectedVariant,
    setSelectedVariant,
    qty,
    setQty,
    handleAddToCart,
    handleBuyNow,
    product,
    handleImageError
}) => {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            <div className="mt-1 flex items-center gap-3">
                {brandObj?.logo && (
                    <img
                        src={fixImage(brandObj.logo)}
                        alt={brand}
                        className="w-6 h-6 object-contain rounded"
                        onError={handleImageError}
                    />
                )}
                <span className="text-sm text-gray-600">Brand: {brand}</span>
                {sku && <span className="text-xs text-gray-500">SKU: {sku}</span>}
            </div>

            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar key={i} style={{ color: i < filledStars ? PRICE_COLOR_HEX : "#D1D5DB" }} />
                    ))}
                </div>
                <span className="text-sm text-gray-600 font-bold">{Number(rating).toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviews_count} reviews)</span>
            </div>

            <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    {/* Price Section */}
                    <div className="flex items-baseline gap-3 whitespace-nowrap">

                        <span
                            className="flex items-baseline gap-1 text-3xl font-extrabold"
                            style={{ color: PRICE_COLOR_HEX }}
                        >
                            <TakaIcon size={20} />
                            {displayWholesalePrice
                                ? Number(displayWholesalePrice).toLocaleString()
                                : Number(displayPrice).toLocaleString()}
                        </span>

                        {(displayWholesalePrice ||
                            (product?.discount_price && !selectedVariant) ||
                            selectedVariant?.discount_price) && (
                                <span className="flex items-baseline gap-1 text-xl text-gray-400 line-through">
                                    <TakaIcon size={16} />
                                    {Number(originalPrice).toLocaleString()}
                                </span>
                            )}
                    </div>

                    {/* Stock Badge */}
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus === "in_stock"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
                {displayWholesalePrice && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-purple-600 font-bold bg-purple-50 px-2 rounded">Wholesale Price Active</span>
                    </div>
                )}
            </div>

            {product?.short_description && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500 text-gray-700 text-sm leading-relaxed">
                    {product.short_description}
                </div>
            )}

            <div className="border-t my-6" />

            {(variantColors.length > 0) && (
                <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-2 font-medium">Color</div>
                    <div className="flex flex-wrap gap-2">
                        {variantColors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                aria-pressed={selectedColor === c}
                                className={`px-3 h-9 rounded-md border cursor-pointer ${selectedColor === c ? "border-purple-700 bg-purple-50" : "border-gray-300 bg-white"} hover:border-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 text-sm`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {filteredVariants.length > 0 && filteredVariants.some(v => v.ram || v.storage) && (
                <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-2 font-medium">RAM / Storage</div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                        {filteredVariants.map((v) => {
                            const active = selectedVariant?.id === v.id;
                            const disabled = Number(v.stock_quantity || 0) <= 0;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    disabled={disabled}
                                    aria-pressed={active}
                                    className={`p-2 border rounded-md text-sm cursor-pointer ${active ? "border-purple-700 bg-purple-50" : "border-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {v.ram ? `${v.ram}GB` : ''}{v.ram && v.storage ? '/' : ''}{v.storage ? `${v.storage}GB` : ''}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="border-t my-6" />

            <div className="text-sm text-gray-700">
                {stockStatus === "in_stock"
                    ? `In Stock (${Number(displayStockQuantity).toLocaleString()} available)`
                    : "Currently unavailable"}
            </div>

            <div className="mt-4 flex flex-col gap-4">
                {/* <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border rounded-md shrink-0">
                        <button
                            aria-label="Decrease quantity"
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="px-3 py-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer"
                        >
                            −
                        </button>
                        <input
                            className="w-10 text-center outline-none py-2 text-sm"
                            type="text"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                        />
                        <button
                            aria-label="Increase quantity"
                            onClick={() => setQty(qty + 1)}
                            className="px-3 py-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer"
                        >
                            +
                        </button>
                    </div>
                </div> */}
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 px-3 py-3 rounded-md border-2 border-purple-700 text-purple-700 hover:bg-purple-50 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        disabled={stockStatus !== "in_stock"}
                    >
                        Add to cart
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="flex-1 px-3 py-3 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        disabled={stockStatus !== "in_stock"}
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <ProductAttributes product={product} />
            </div>

            <div className="mt-6">
                <Link to="/products" className="px-5 py-3 inline-block rounded-md border border-gray-300 text-gray-700 hover:border-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700">
                    Back to Products
                </Link>
            </div>
        </div>
    );
};

export default ProductInfo;
