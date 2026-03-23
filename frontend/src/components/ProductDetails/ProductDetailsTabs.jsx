import React, { useState, useEffect, useRef } from "react";
import Spacification from "../Spacification";
import DescriptionTab from "../DescriptionTab";
import ProductReviews from "../Reviews/ProductReviews";
import ProductQA from "../ProductQA";
import ProductVideo from "../ProductVideo";

const ProductDetailsTabs = ({ product, productReviews = [], onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState("spacification");
    const isScrollingRef = useRef(false);

    const tabs = [
        { key: "spacification", label: "Spacification" },
        { key: "description", label: "Description" },
        { key: "reviews", label: `Reviews` },
        { key: "qa", label: `Q&A` },
        { key: "video", label: "Video" },
    ];

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-180px 0px -80% 0px', // Adjusted for taller header + tabs
            threshold: 0
        };

        const handleIntersect = (entries) => {
            if (isScrollingRef.current) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveTab(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        tabs.forEach((tab) => {
            const element = document.getElementById(tab.key);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            isScrollingRef.current = true;
            setActiveTab(id);
            
            const offset = 240; // Increased to clear taller header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 1000);
        }
    };

    return (
        <div className="mt-8 max-w-full mx-auto px-1 sm:px-0 relative text-neutral-900">
            {/* Sticky Navigation Bar */}
            <div className="sticky top-[100px] md:top-[128px] z-40 bg-white shadow-md border-b border-gray-100 -mx-1 sm:mx-0 px-1 sm:px-0 py-2">
                <div className="flex overflow-x-auto whitespace-nowrap gap-0 sm:gap-2 scrollbar-hide py-1">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => scrollToSection(t.key)}
                            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-300 focus:outline-none cursor-pointer ${activeTab === t.key
                                ? "border-purple-700 text-purple-700 font-extrabold scale-105"
                                : "border-transparent text-gray-500 hover:text-purple-600 hover:border-gray-300"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            <div className="mt-4 space-y-4 pb-12">
                <section id="spacification" className="scroll-mt-64">
                    <Spacification specifications={product.specifications || []} />
                </section>

                <div className="border-t border-gray-100 max-w-4xl mx-auto opacity-50" />

                <section id="description" className="scroll-mt-64">
                    <DescriptionTab product={product} onUpdate={onProductUpdate} />
                </section>

                <div className="border-t border-gray-100 max-w-4xl mx-auto opacity-50" />

                <section id="reviews" className="scroll-mt-64">
                    <ProductReviews productId={product.id} productReviews={productReviews} />
                </section>

                <div className="border-t border-gray-100 max-w-4xl mx-auto opacity-50" />

                <section id="qa" className="scroll-mt-64">
                    <div className="max-w-4xl mx-auto">
                        <ProductQA productId={product.id} productQuestions={product.questions || []} />
                    </div>
                </section>

                <div className="border-t border-gray-100 max-w-4xl mx-auto opacity-50" />

                <section id="video" className="scroll-mt-64">
                    <div className="max-w-4xl mx-auto">
                        <ProductVideo videoUrl={product.video} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductDetailsTabs;
