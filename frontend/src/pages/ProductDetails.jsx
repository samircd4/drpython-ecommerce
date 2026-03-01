import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/client";
import { toast } from "react-toastify";
import useWebSocket from "../hooks/useWebSocket";
// Sub-components
import ProductBreadcrumbs from "../components/ProductDetails/ProductBreadcrumbs";
import ProductGallery from "../components/ProductDetails/ProductGallery";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import ProductDetailsTabs from "../components/ProductDetails/ProductDetailsTabs";
import RelatedProducts from "../components/RelatedProducts";
import productsData from "../data/products.json";



const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const containerRef = useRef(null);

    // ALL HOOKS AT THE TOP — NO CONDITIONALS BEFORE THEM!
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState("right");
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isNextLoaded, setIsNextLoaded] = useState(true);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const [paused, setPaused] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const PLACEHOLDER_IMAGE = "https://motionview.s3.amazonaws.com/images/products/profile/176165257711.Kospet%20Tank%20M4%20Black%202.webp";
    const PRICE_COLOR_HEX = "#7e22ce";

    // Build images from backend shape: image + gallery_images[].image
    const images = useMemo(() => {
        if (!product) return [PLACEHOLDER_IMAGE];
        const main = product.image;
        const extras = Array.isArray(product.gallery_images)
            ? product.gallery_images
                .map((i) => i && i.image)
                .filter(Boolean)
            : [];
        const result = [];
        if (main) result.push(main);
        for (const img of extras) if (!result.includes(img)) result.push(img);
        return result.length > 0 ? result : [PLACEHOLDER_IMAGE];
    }, [product]);

    // Safe destructuring (with fallbacks)
    const {
        id: productId,
        name = "Unnamed Product",
        price = "0",
        discount_price = null,
        description = "No description available.",
        rating = 0,
        reviews_count = 0,
        reviews: productReviews = [],
        stock_quantity = 0,
        brand: brandObj,
        specifications = [],
        variants = [],
        category: categoryObj = {},
        wholesale_price = null,
        related_products = [],
    } = product || {};

    const brand = brandObj?.name || "Unknown Brand";

    const filledStars = Math.round(rating);
    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    const preloadAndAnimate = useCallback((newIndex, forcedDirection = null) => {
        if (newIndex === activeIndex || isAnimating) return;
        if (newIndex < 0 || newIndex >= images.length) return;

        setIsNextLoaded(false);
        const img = new Image();
        img.src = images[newIndex];
        img.onload = () => {
            setPrevIndex(activeIndex);
            setActiveIndex(newIndex);
            setDirection(forcedDirection || (newIndex > activeIndex ? "right" : "left"));
            setIsAnimating(true);
            setIsNextLoaded(true);
            setTimeout(() => {
                setIsAnimating(false);
                setPrevIndex(newIndex);
            }, 700);
        };
        img.onerror = () => setIsNextLoaded(true);
    }, [activeIndex, isAnimating, images]);

    const next = useCallback(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        preloadAndAnimate(nextIndex, "right");
    }, [activeIndex, images.length, preloadAndAnimate]);

    const prev = useCallback(() => {
        const prevIndex = (activeIndex - 1 + images.length) % images.length;
        preloadAndAnimate(prevIndex, "left");
    }, [activeIndex, images.length, preloadAndAnimate]);

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/products/${encodeURIComponent(id)}/`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                const localProduct = productsData.find(p => String(p.id) === String(id));
                if (localProduct) {
                    setProduct({ ...localProduct, reviews_count: localProduct.reviews });
                } else {
                    setError("Failed to load product and no demo data found.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const { data: wsData } = useWebSocket(productId ? `/ws/product/${productId}/` : null);

    useEffect(() => {
        if (wsData) {
            console.log("Real-time product update received:", wsData);
            setProduct(prev => {
                if (!prev) return prev;
                // Main product or variant update
                if (wsData.id === prev.id) {
                    return {
                        ...prev,
                        price: wsData.price || prev.price,
                        discount_price: wsData.discount_price !== undefined ? wsData.discount_price : prev.discount_price,
                        stock_quantity: wsData.stock !== undefined ? wsData.stock : prev.stock_quantity,
                    };
                }
                if (wsData.variant_id) {
                    const newVariants = (prev.variants || []).map(v =>
                        v.id === wsData.variant_id
                            ? { ...v, price: wsData.variant_price || v.price, stock_quantity: wsData.variant_stock ?? v.stock_quantity }
                            : v
                    );
                    return { ...prev, variants: newVariants };
                }
                return prev;
            });
        }
    }, [wsData]);

    // Derive variant options and selection
    const variantColors = useMemo(() => {
        const set = new Set();
        (variants || []).forEach(v => { if (v.color) set.add(v.color); });
        return Array.from(set);
    }, [variants]);

    const filteredVariants = useMemo(() => {
        const list = Array.isArray(variants) ? variants : [];
        const pool = selectedColor ? list.filter(v => v.color === selectedColor) : list;
        const seen = new Set();
        const unique = [];
        for (const v of pool) {
            const key = `${v.ram ?? ''}-${v.storage ?? ''}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(v);
            }
        }
        return unique;
    }, [variants, selectedColor]);

    useEffect(() => {
        const list = filteredVariants;
        setSelectedVariant(list[0] || null);
    }, [filteredVariants]);

    const displayPrice = useMemo(() => {
        const raw = selectedVariant ? (selectedVariant.discount_price || selectedVariant.price) : (discount_price || price);
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    }, [selectedVariant, discount_price, price]);

    const displayWholesalePrice = useMemo(() => {
        if (!wholesale_price && (!selectedVariant || !selectedVariant.wholesale_price)) return null;
        const raw = selectedVariant ? selectedVariant.wholesale_price : wholesale_price;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    }, [selectedVariant, wholesale_price]);

    const originalPrice = useMemo(() => {
        // For wholesalers, if a discount exists, show that as the original price to highlight extra saving
        if (displayWholesalePrice && (selectedVariant ? selectedVariant.discount_price : discount_price)) {
            return selectedVariant ? selectedVariant.discount_price : discount_price;
        }
        const raw = selectedVariant ? selectedVariant.price : price;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    }, [selectedVariant, price, discount_price, displayWholesalePrice]);

    const stockStatus = useMemo(() => {
        const s = selectedVariant ? Number(selectedVariant.stock_quantity || 0) : Number(stock_quantity || 0);
        return s > 0 ? "in_stock" : "out_of_stock";
    }, [selectedVariant, stock_quantity]);

    // Reset quantity when variant changes to avoid carrying over previous variant qty
    useEffect(() => {
        setQty(1);
    }, [selectedVariant]);

    // Respect prefers-reduced-motion for gallery transitions and slideshow
    useEffect(() => {
        const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = () => setPrefersReducedMotion(!!mq.matches);
        if (mq) {
            handler();
            mq.addEventListener('change', handler);
        }
        return () => {
            if (mq) mq.removeEventListener('change', handler);
        };
    }, []);

    // Auto-advance slideshow every 3s when not paused/zoomed and motion allowed
    useEffect(() => {
        if (prefersReducedMotion || zoomOpen || paused || images.length <= 1) return;
        const interval = setInterval(() => {
            // Only advance if the gallery container is actually visible
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                if (!isVisible) return;
            }
            next();
        }, 3000);
        return () => clearInterval(interval);
    }, [prefersReducedMotion, zoomOpen, paused, images, activeIndex, next]);

    // Early returns AFTER all hooks
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="inline-block">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 inline-block">
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Link to="/products" className="text-purple-600 hover:underline font-medium">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 inline-block">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find this product.</p>
                    <Link to="/products" className="text-purple-600 hover:underline font-medium">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    // Rest of your logic (safe now)
    const handleAddToCart = async () => {
        if (stockStatus !== "in_stock") {
            toast.error("Sorry, this item is out of stock.");
            return;
        }
        try {
            const body = selectedVariant
                ? { product_id: product.id, variant_id: selectedVariant.id, quantity: qty }
                : { product_id: product.id, quantity: qty };
            await api.post('/cart-items/', body);
            const cartPrice = displayWholesalePrice ? Number(displayWholesalePrice) : Number(displayPrice);
            const payload = selectedVariant ? {
                ...product,
                price: cartPrice,
                variant: {
                    id: selectedVariant.id,
                    sku: selectedVariant.sku,
                    color: selectedVariant.color,
                    ram: selectedVariant.ram,
                    storage: selectedVariant.storage
                }
            } : {
                ...product,
                price: cartPrice
            };
            for (let i = 0; i < qty; i++) addToCart(payload);
        } catch {
            toast.error("Failed to add to cart");
        }
    };



    const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
        }
        setTouchStart(0);
        setTouchEnd(0);
    };




    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-8">
            <ProductBreadcrumbs category={categoryObj} productName={name} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProductGallery
                    images={images}
                    activeIndex={activeIndex}
                    prevIndex={prevIndex}
                    isAnimating={isAnimating}
                    direction={direction}
                    isNextLoaded={isNextLoaded}
                    name={name}
                    zoomOpen={zoomOpen}
                    setZoomOpen={setZoomOpen}
                    handleImageError={handleImageError}
                    preloadAndAnimate={preloadAndAnimate}
                    next={next}
                    prev={prev}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    setPaused={setPaused}
                />

                <ProductInfo
                    name={name}
                    brandObj={brandObj}
                    brand={brand}
                    sku={product?.sku}
                    rating={rating}
                    filledStars={filledStars}
                    reviews_count={reviews_count}
                    displayPrice={displayPrice}
                    originalPrice={originalPrice}
                    displayWholesalePrice={displayWholesalePrice}
                    PRICE_COLOR_HEX={PRICE_COLOR_HEX}
                    stockStatus={stockStatus}
                    displayStockQuantity={selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity}
                    variantColors={variantColors}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    filteredVariants={filteredVariants}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                    qty={qty}
                    setQty={setQty}
                    handleAddToCart={handleAddToCart}
                    product={product}
                    handleImageError={handleImageError}
                />
            </div>

            <ProductDetailsTabs
                product={product}
                productReviews={productReviews}
                onProductUpdate={setProduct}
            />

            <RelatedProducts products={related_products} />
        </div>
    );
};

export default ProductDetails;
