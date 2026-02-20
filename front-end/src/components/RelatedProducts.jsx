import React, { useState, useEffect, useRef } from 'react';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Product from "./Product";

const RelatedProducts = ({ products = [] }) => {
    const sliderRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const scrollDir = useRef('forward');

    // Auto-Slide Logic
    useEffect(() => {
        if (!products || products.length < 2 || isHovered) return;

        const interval = setInterval(() => {
            const el = sliderRef.current;
            if (!el) return;

            const { scrollLeft, scrollWidth, clientWidth } = el;

            if (scrollWidth <= clientWidth) return;

            const scrollAmount = 300;

            if (scrollDir.current === 'forward') {
                if (scrollLeft + clientWidth >= scrollWidth - 20) {
                    scrollDir.current = 'backward';
                    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            } else {
                if (scrollLeft <= 20) {
                    scrollDir.current = 'forward';
                    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [products, isHovered]);

    const handleScroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = 300;
        sliderRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2">Related Products</h2>

            <div className="relative group">
                {/* Navigation Arrows */}
                <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-100 p-2 rounded-full text-purple-700 hover:bg-purple-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer"
                >
                    <IoChevronBack size={24} />
                </button>

                <div
                    ref={sliderRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4"
                >
                    {products.map((item) => (
                        <div key={item.id} className="w-[240px] md:w-[280px] shrink-0 snap-start">
                            <Product product={item} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-100 p-2 rounded-full text-purple-700 hover:bg-purple-50 transition-all opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer"
                >
                    <IoChevronForward size={24} />
                </button>
            </div>
        </div>
    );
};

export default RelatedProducts;
