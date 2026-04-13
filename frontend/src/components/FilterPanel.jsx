import React from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa'
import { MdFilterList } from 'react-icons/md'
import { useConfig } from '../context/ConfigContext'

const FilterPanel = ({
    open,
    onClose,
    priceMin,
    priceMax,
    globalMin,
    globalMax,
    onChangePriceMin,
    onChangePriceMax,
    minRating,
    onChangeMinRating,
    featuredOnly,
    onChangeFeaturedOnly,
    brands,
    selectedBrands,
    onToggleBrand,
    onClearAll,
}) => {
    const { config } = useConfig();
    const symbol = config?.currency_symbol || "৳";
    // We only want to use createPortal if we have a document body
    if (typeof document === 'undefined') return null

    return ReactDOM.createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[70] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <MdFilterList className="text-purple-600 text-xl" />
                                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">Filters</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar">
                            {/* Price Range */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Price Range</h3>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                        {symbol}{priceMin} - {symbol}{priceMax}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="relative h-2 w-full bg-gray-100 rounded-full mt-8">
                                        <div
                                            className="absolute h-full bg-purple-600 rounded-full"
                                            style={{
                                                left: `${((priceMin - globalMin) / (globalMax - globalMin)) * 100}%`,
                                                right: `${100 - ((priceMax - globalMin) / (globalMax - globalMin)) * 100}%`
                                            }}
                                        />
                                        <input
                                            type="range"
                                            min={globalMin}
                                            max={globalMax}
                                            value={priceMin}
                                            onChange={(e) => {
                                                const val = Math.min(Number(e.target.value), priceMax - 1)
                                                onChangePriceMin(val)
                                            }}
                                            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:shadow-md"
                                            style={{ zIndex: priceMin > globalMax / 2 ? 5 : 3 }}
                                        />
                                        <input
                                            type="range"
                                            min={globalMin}
                                            max={globalMax}
                                            value={priceMax}
                                            onChange={(e) => {
                                                const val = Math.max(Number(e.target.value), priceMin + 1)
                                                onChangePriceMax(val)
                                            }}
                                            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:shadow-md"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="relative group">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 font-medium select-none text-xs">Min</span>
                                                <input
                                                    type="number"
                                                    value={priceMin}
                                                    onChange={(e) => onChangePriceMin(Number(e.target.value))}
                                                    className="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden ring-1 ring-gray-100 font-bold text-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="relative group">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 font-medium select-none text-xs">Max</span>
                                                <input
                                                    type="number"
                                                    value={priceMax}
                                                    onChange={(e) => onChangePriceMax(Number(e.target.value))}
                                                    className="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden ring-1 ring-gray-100 font-bold text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Ratings */}
                            <section>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Customer Rating</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[0, 3, 4, 4.5].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => onChangeMinRating(rating)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-1.5 transition-all text-sm font-bold cursor-pointer ${minRating === rating
                                                ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                                                : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-500'
                                                }`}
                                        >
                                            <div className="flex gap-0.5">
                                                {rating === 0 ? (
                                                    <MdFilterList className={minRating === 0 ? 'text-purple-600' : 'text-gray-400'} />
                                                ) : (
                                                    [...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            size={12}
                                                            className={i < Math.floor(rating) ? 'text-purple-600' : 'text-gray-200'}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                            <span>{rating === 0 ? 'Any Rating' : `${rating}+`}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Brands */}
                            {brands.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Brands</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {brands.map((b) => {
                                            const checked = selectedBrands.includes(b)
                                            return (
                                                <button
                                                    key={b}
                                                    onClick={() => onToggleBrand(b, !checked)}
                                                    className={`px-4 py-2 rounded-full border-1.5 text-xs font-semibold transition-all cursor-pointer ${checked
                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20 translate-y-[-1px]'
                                                        : 'bg-white border-gray-100 text-gray-600 hover:border-purple-200 hover:text-purple-600'
                                                        }`}
                                                >
                                                    {b}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Featured Toggle */}
                            <section>
                                <label className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-white hover:shadow-sm transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Featured items only</span>
                                        <span className="text-xs text-gray-500">Show only handpicked premium products</span>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={featuredOnly}
                                            onChange={(e) => onChangeFeaturedOnly(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>
                            </section>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 pt-6 pb-24 md:pb-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4">
                            <button
                                onClick={onClearAll}
                                className="px-6 py-3.5 rounded-xl border-1.5 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3.5 rounded-xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-600/40 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Show Results
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}

export default FilterPanel
