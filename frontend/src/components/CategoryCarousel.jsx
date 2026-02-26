import React, { useEffect, useRef, memo } from 'react'
import { MdDevices, MdSettings, MdHome, MdWork, MdApps } from 'react-icons/md'

const categoryIconMap = {
    Electronics: MdDevices,
    Accessories: MdSettings,
    Home: MdHome,
    Office: MdWork,
    All: MdApps,
}

const CategoryCarousel = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
}) => {
    const carouselRef = useRef(null)
    const isDragging = useRef(false)
    const isHovered = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)

    /* ---------- Drag scroll (Unified Pointer Events) ---------- */
    const hasMoved = useRef(false)

    const onPointerDown = (e) => {
        const el = carouselRef.current
        if (!el) return
        isDragging.current = true
        hasMoved.current = false
        startX.current = e.clientX
        scrollStart.current = el.scrollLeft
    }

    const onPointerMove = (e) => {
        if (!isDragging.current) return
        const el = carouselRef.current
        if (!el) return
        const x = e.clientX
        const dist = Math.abs(x - startX.current)

        if (dist > 10) {
            if (!hasMoved.current) {
                hasMoved.current = true
                if (el.setPointerCapture) {
                    try {
                        el.setPointerCapture(e.pointerId)
                    } catch (err) { }
                }
            }
            const walk = (startX.current - x) * 1.5 // Multiplier for faster drag
            el.scrollLeft = scrollStart.current + walk
        }
    }

    const stopDragging = (e) => {
        isDragging.current = false
        if (carouselRef.current && e.pointerId && hasMoved.current) {
            try {
                carouselRef.current.releasePointerCapture(e.pointerId)
            } catch (err) { }
        }
    }

    /* ---------- Auto scroll ---------- */
    useEffect(() => {
        const el = carouselRef.current
        if (!el || categories.length === 0) return

        let rafId
        const speed = 0.5

        const loop = () => {
            if (!isHovered.current && !isDragging.current) {
                el.scrollLeft += speed

                // Reset at half because we duplicate items once
                if (el.scrollLeft >= el.scrollWidth / 2) {
                    el.scrollLeft = 0
                }
            }
            rafId = requestAnimationFrame(loop)
        }

        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [categories])

    // Duplicate categories once for infinite scroll
    const displayCategories = [...categories, ...categories]

    return (
        <div className="mb-6 relative group">
            <div
                ref={carouselRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                onMouseEnter={() => (isHovered.current = true)}
                onMouseLeave={() => (isHovered.current = false)}
                className="flex gap-4 overflow-x-auto no-scrollbar px-1 select-none cursor-grab active:cursor-grabbing scroll-smooth"
                style={{ touchAction: 'pan-y' }}
            >
                {displayCategories.map((cat, idx) => {
                    const Icon = categoryIconMap[cat.name] || MdApps
                    const isActive = selectedCategory === cat.name

                    return (
                        <button
                            key={`${cat.name}-${idx}`}
                            onClick={(e) => {
                                if (hasMoved.current) return
                                onSelectCategory(cat.name)
                            }}
                            className={`shrink-0 flex flex-col items-center ${isActive ? 'text-purple-700' : 'text-gray-800'
                                } cursor-pointer`}
                            style={{ width: 104 }}
                        >
                            <div
                                className={`w-full h-24 rounded-md border-2 overflow-hidden ${isActive
                                    ? 'border-purple-500 shadow-md'
                                    : 'border-gray-200'
                                    } bg-white`}
                            >
                                {cat.logo ? (
                                    <img
                                        src={cat.logo}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Icon className="w-7 h-7 text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <span className="mt-2 text-xs sm:text-sm text-center line-clamp-2 leading-tight">
                                {cat.name}
                            </span>

                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default memo(CategoryCarousel)
