import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Spacification from "../Spacification";
import DescriptionTab from "../DescriptionTab";
import ProductReviews from "../Reviews/ProductReviews";
import ProductQA from "../ProductQA";
import ProductVideo from "../ProductVideo";

const ProductDetailsTabs = ({ product, productReviews = [], onProductUpdate }) => {
    const tabsRef = useRef(null);
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") || "spacification";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
            setTimeout(() => {
                tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [searchParams]);

    const tabs = [
        { key: "spacification", label: "Spacification" },
        { key: "description", label: "Description" },
        { key: "reviews", label: `Reviews` },
        { key: "qa", label: `Q&A` },
        { key: "video", label: "Video" },
    ];

    return (
        <div ref={tabsRef} className="mt-8 max-w-full mx-auto px-1 sm:px-0">
            <div className="flex overflow-x-auto whitespace-nowrap gap-0 sm:gap-2 mb-6 border-b border-gray-200 pb-0 scrollbar-hide">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all duration-300 focus:outline-none cursor-pointer ${activeTab === t.key
                            ? "border-purple-700 text-purple-700"
                            : "border-transparent text-gray-500 hover:text-purple-600 hover:border-gray-300"
                            }`}
                        aria-current={activeTab === t.key ? "page" : undefined}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px] animate-fade-in px-1 sm:px-0">
                {activeTab === "spacification" && (
                    <Spacification specifications={product.specifications || []} />
                )}
                {activeTab === "description" && (
                    <DescriptionTab product={product} onUpdate={onProductUpdate} />
                )}
                {activeTab === "reviews" && (
                    <ProductReviews productId={product.id} productReviews={productReviews} />
                )}
                {activeTab === "qa" && (
                    <div className="max-w-4xl mx-auto">
                        <ProductQA productId={product.id} productQuestions={product.questions || []} />
                    </div>
                )}
                {activeTab === "video" && (
                    <div className="max-w-4xl mx-auto">
                        <ProductVideo videoUrl={product.video} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsTabs;
