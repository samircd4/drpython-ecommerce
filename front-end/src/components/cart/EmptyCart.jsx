import React from 'react';
import { Link } from 'react-router-dom';
import emptyCartImg from '../../assets/empty_cart.png';

const EmptyCart = ({
    title = "Your cart is empty",
    description = "Looks like you haven't added any products to your cart yet.",
    buttonText = "SHOP NOW",
    buttonLink = "/products",
    compact = false,
    onClick = () => { }
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${compact ? 'py-6' : 'py-12'} px-4 bg-white rounded-2xl border border-neutral-100 shadow-sm transition-all hover:shadow-md animate-fade-in`}>
            <div className={`relative ${compact ? 'w-32 h-32 mb-4' : 'w-64 h-64 mb-8'} overflow-hidden rounded-full bg-neutral-50 flex items-center justify-center group`}>
                <img
                    src={emptyCartImg}
                    alt="Empty Cart"
                    className={`${compact ? 'w-24 h-24' : 'w-48 h-48'} object-contain transform transition-transform duration-500 group-hover:scale-110`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </div>

            <h2 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-neutral-800 mb-2 text-center tracking-tight`}>
                {title}
            </h2>

            <p className={`text-neutral-500 text-center max-w-sm ${compact ? 'mb-6 text-sm' : 'mb-10'} leading-relaxed font-medium`}>
                {description}
            </p>

            <Link
                to={buttonLink}
                onClick={onClick}
                className={`group relative overflow-hidden bg-purple-600 hover:bg-purple-700 text-white ${compact ? 'px-6 py-2 rounded-lg text-sm' : 'px-10 py-4 rounded-xl font-bold tracking-wider'} transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 flex items-center gap-3`}
            >
                <span className="relative z-10">{buttonText}</span>
                {!compact && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 relative z-10 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]" />
            </Link>
        </div>
    );
};

export default EmptyCart;
