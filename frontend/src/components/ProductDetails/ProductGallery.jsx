import React, { useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { fixImage } from "../../context/CartContext";

const ProductGallery = ({
    images = [],
    activeIndex,
    prevIndex,
    isAnimating,
    direction,
    isNextLoaded,
    name,
    zoomOpen,
    setZoomOpen,
    handleImageError,
    preloadAndAnimate,
    next,
    prev,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    setPaused
}) => {
    const thumbnailsRef = useRef(null);

    useEffect(() => {
        if (thumbnailsRef.current) {
            const activeThumbnail = thumbnailsRef.current.children[activeIndex];
            if (activeThumbnail) {
                const container = thumbnailsRef.current;
                const scrollLeft = activeThumbnail.offsetLeft - container.offsetWidth / 2 + activeThumbnail.offsetWidth / 2;

                const rect = container.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    container.scrollTo({
                        left: scrollLeft,
                        behavior: "smooth"
                    });
                } else {
                    container.scrollLeft = scrollLeft;
                }
            }
        }
    }, [activeIndex]);

    return (
        <div className="relative bg-white rounded-xl shadow overflow-hidden">
            <div
                className="relative h-[400px] sm:h-[500px] lg:h-[600px] cursor-zoom-in w-full bg-gray-50"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => setZoomOpen(true)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
            >
                {/* Image layers */}
                {isAnimating && prevIndex !== activeIndex && (
                    <img
                        src={fixImage(images[prevIndex])}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-contain ${direction === "right" ? "gallery-exit-left" : "gallery-exit-right"
                            }`}
                        onError={handleImageError}
                    />
                )}
                <img
                    src={fixImage(images[activeIndex])}
                    alt={name}
                    className={`absolute inset-0 w-full h-full object-contain ${isAnimating
                        ? direction === "right" ? "gallery-enter-right" : "gallery-enter-left"
                        : "gallery-transition opacity-100"
                        }`}
                    onError={handleImageError}
                />

                {!isNextLoaded && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white transition-colors cursor-pointer z-10"
                        >
                            <IoChevronBack />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white transition-colors cursor-pointer z-10"
                        >
                            <IoChevronForward />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div
                    ref={thumbnailsRef}
                    className="mt-4 flex gap-2 overflow-x-auto pb-4 px-2 no-scrollbar"
                >
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => preloadAndAnimate(i)}
                            className={`w-20 h-20 sm:w-24 sm:h-24 border-2 rounded-lg overflow-hidden shrink-0 cursor-pointer ${i === activeIndex ? "border-purple-600" : "border-gray-300"}`}
                        >
                            <img src={fixImage(src)} alt="" className="w-full h-full object-cover" onError={handleImageError} />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {zoomOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out"
                    onClick={() => setZoomOpen(false)}
                >
                    <img
                        src={fixImage(images[activeIndex])}
                        alt="Zoomed"
                        className="max-w-full max-h-full object-contain"
                        onError={handleImageError}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
