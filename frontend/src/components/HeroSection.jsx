// src/components/HeroSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
    {
        id: 1,
        title: "Welcome to Sarker Shop",
        subtitle: "Find the best electronics and accessories here!",
        image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: 2,
        title: "Exclusive Deals",
        subtitle: "Save big on headphones, laptops, and more.",
        image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: 3,
        title: "Smart Gadgets",
        subtitle: "Upgrade your life with the latest tech products.",
        image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    },
];

const HeroSection = () => {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const timeoutRef = useRef(null);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () =>
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    // Auto slide
    useEffect(() => {
        if (!paused) {
            timeoutRef.current = setTimeout(nextSlide, 5000);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [current, paused]);

    return (
        <div
            className="relative w-full h-72 md:h-[500px] rounded-2xl overflow-hidden shadow-lg"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={slides[current].id}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                    {/* Background Image */}
                    <img
                        src={slides[current].image}
                        alt={slides[current].title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                    {/* Text Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-white">
                        <motion.h1
                            className="text-3xl md:text-5xl font-bold mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {slides[current].title}
                        </motion.h1>
                        <motion.p
                            className="text-lg md:text-xl mb-6 max-w-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {slides[current].subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Link
                                to="/products"
                                className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 cursor-pointer animate-pulse-glow hover:animate-none hover:shadow-primary-glow transform hover:scale-105"
                            >
                                Shop Now
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-600/40 opacity-50 hover:bg-purple-600/60 p-2 rounded-full text-white cursor-pointer"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-600/40 opacity-50 hover:opacity-100 hover:bg-purple-600/60 p-2 rounded-full text-white cursor-pointer"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full ${current === index ? "bg-purple-600" : "bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSection;
