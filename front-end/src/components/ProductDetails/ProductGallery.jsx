import React, { useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

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
                activeThumbnail.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [activeIndex]);

    return (
        <div className="relative bg-white rounded-xl shadow overflow-hidden">
            <div
                className="relative aspect-square lg:h-[500px] cursor-zoom-in w-full"
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
                        src={images[prevIndex]}
                        alt=""
                        className={`absolute inset-0 w-full h-full ${direction === "right" ? "gallery-exit-left" : "gallery-exit-right"
                            }`}
                        onError={handleImageError}
                    />
                )}
                <img
                    src={images[activeIndex]}
                    alt={name}
                    className={`absolute inset-0 w-full h-full ${isAnimating
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
                    className="mt-4 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 px-2 no-scrollbar"
                >
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => preloadAndAnimate(i)}
                            className={`w-20 h-20 sm:w-24 sm:h-24 border-2 rounded-lg overflow-hidden snap-start shrink-0 cursor-pointer ${i === activeIndex ? "border-purple-600" : "border-gray-300"}`}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover" onError={handleImageError} />
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
                        src={images[activeIndex]}
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
