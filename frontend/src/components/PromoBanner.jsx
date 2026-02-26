import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const banners = [
  {
    id: 1,
    title: "Big Summer Sale!",
    subtitle: "Up to 50% off selected items",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "New Arrivals!",
    subtitle: "Check out the latest gadgets and accessories",
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155226f9f0?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Explore",
  },
  {
    id: 3,
    title: "Limited Time Offer",
    subtitle: "Get extra 10% off on electronics",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Grab Now",
  },
];

const PromoBanner = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg h-40 md:h-48">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 rounded-2xl ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          {/* Text Content */}
          <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10 text-white">
            <div>
              <h3 className="text-lg md:text-xl font-bold">{banner.title}</h3>
              <p className="text-sm md:text-base">{banner.subtitle}</p>
            </div>
            <Link
              to="/products"
              className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer"
            >
              {banner.buttonText}
            </Link>
          </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
