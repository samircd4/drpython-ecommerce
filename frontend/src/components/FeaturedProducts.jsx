import React, { useEffect, useState, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import api from "../api/client";
import Product from "./Product";

const FeaturedProducts = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Slider state
    const sliderRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const scrollDir = useRef("forward");

    // 🔥 Fetch from Django API ONLY
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await api.get("/products/featured/");
                const data = Array.isArray(response.data)
                    ? response.data
                    : (response.data.results || []);

                setFeatured(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError("Failed to load featured products.");
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    // 🎞️ Auto slider
    useEffect(() => {
        if (!featured || featured.length < 2 || isHovered) return;

        const interval = setInterval(() => {
            const el = sliderRef.current;
            if (!el) return;

            const { scrollLeft, scrollWidth, clientWidth } = el;
            if (scrollWidth <= clientWidth) return;

            const scrollAmount = 300;

            if (scrollDir.current === "forward") {
                if (scrollLeft + clientWidth >= scrollWidth - 20) {
                    scrollDir.current = "backward";
                    el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                } else {
                    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
                }
            } else {
                if (scrollLeft <= 20) {
                    scrollDir.current = "forward";
                    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
                } else {
                    el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [featured, isHovered]);

    const handleScroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = sliderRef.current.clientWidth;
        sliderRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    // ❌ Error UI
    if (error) {
        return (
            <div className="text-center py-10">
                <h2 className="text-red-500 font-semibold">{error}</h2>
            </div>
        );
    }

    // ⏳ Loading skeleton
    if (loading) {
        return (
            <div className="flex gap-4 lg:gap-6 overflow-hidden pb-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="w-[240px] md:w-[280px] shrink-0 bg-white rounded-lg shadow-lg h-80 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    // ✅ Slider UI
    return (
        <div className="relative group">
            {/* Left Arrow */}
            <button
                onClick={() => handleScroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-100 p-2 rounded-full text-purple-700 hover:bg-purple-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer"
            >
                <IoChevronBack size={24} />
            </button>

            {/* Slider */}
            <div
                ref={sliderRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4"
            >
                {featured.map((product) => (
                    <div key={product.id} className="w-[240px] md:w-[280px] shrink-0 snap-start">
                        <Product product={product} />
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => handleScroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-100 p-2 rounded-full text-purple-700 hover:bg-purple-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer"
            >
                <IoChevronForward size={24} />
            </button>
        </div>
    );
};

export default FeaturedProducts;