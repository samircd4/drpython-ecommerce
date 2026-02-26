import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useCart, fixImage } from "../context/CartContext.jsx";
import { IoFlashOutline } from "react-icons/io5";
import { Link } from 'react-router-dom'
import TakaIcon from "./TakaIcon";

const Product = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
            <div className="relative">
                <Link to={`/products/${product.slug}`}>
                    <img
                        src={fixImage(product.image)}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://motionview.s3.amazonaws.com/images/products/profile/176165257711.Kospet%20Tank%20M4%20Black%202.webp";
                        }}
                    />
                </Link>
                {product.is_featured && (
                    <div className="absolute top-4 right-4">
                        <IoFlashOutline className="text-purple-600 text-2xl" />
                    </div>
                )}
            </div>
            <div className="p-2 flex flex-col flex-1">
                <div className="flex items-center mb-2">
                    <div className="flex text-purple-600">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={i < Math.floor(product.rating) ? "text-purple-600" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({product.reviews_count})</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 h-14 overflow-hidden">
                    <Link to={`/products/${product.slug}`} className="hover:text-purple-700">
                        {product.name}
                    </Link>
                </h3>
                {/* <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p> */}
                <div className="mt-auto">
                    <div className="mb-2 flex items-center gap-2 whitespace-nowrap">
                        {product.wholesale_price ? (
                            <>
                                <span className="flex items-baseline gap-0.5 text-lg font-bold text-purple-700">
                                    <TakaIcon size={14} />
                                    {product.wholesale_price}
                                </span>

                                <span className="flex items-baseline gap-0.5 text-xs text-gray-400 line-through">
                                    <TakaIcon size={12} />
                                    {product.discount_price ?? product.price}
                                </span>
                            </>
                        ) : product.discount_price ? (
                            <>
                                <span className="flex items-baseline gap-0.5 text-lg font-bold text-purple-700">
                                    <TakaIcon size={14} />
                                    {product.discount_price}
                                </span>

                                <span className="flex items-baseline gap-0.5 text-sm text-gray-400 line-through">
                                    <TakaIcon size={12} />
                                    {product.price}
                                </span>
                            </>
                        ) : (
                            <span className="flex items-baseline gap-0.5 text-lg font-bold text-purple-700">
                                <TakaIcon size={14} />
                                {product.price}
                            </span>
                        )}
                    </div>
                    {product.product_type === 'variant' ? (
                        <Link to={`/products/${product.slug}`} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                            Select Variant
                        </Link>
                    ) : (
                        <button onClick={() => addToCart(product)} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                            <FaShoppingCart className="mr-2" />
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Product;
