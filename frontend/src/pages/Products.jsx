import React, { useState, useEffect } from 'react'
import Product from '../components/Product'
import { MdFilterList, MdApps } from 'react-icons/md'
import CategoryCarousel from '../components/CategoryCarousel.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import CategoryPanel from '../components/CategoryPanel.jsx'
// import axios from 'axios'
import api, { BASE_URL } from '../api/client'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import productsData from '../data/products.json'
import SEO from '../components/SEO'

const API_URL = import.meta.env.VITE_API_URL

const fixImage = (img) => {
    if (!img) return ''
    if (typeof img === 'string' && img.startsWith('http')) return img
    return `${BASE_URL}${img}`
}



const Products = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const { isFilterOpen, setIsFilterOpen, isCategoryOpen, setIsCategoryOpen } = useCart()
    const [priceMin, setPriceMin] = useState(0)
    const [priceMax, setPriceMax] = useState(0)
    const [globalMin, setGlobalMin] = useState(0)
    const [globalMax, setGlobalMax] = useState(0)
    const [minRating, setMinRating] = useState(0)
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [selectedBrands, setSelectedBrands] = useState([])
    const [allBrands, setAllBrands] = useState([])
    const [categories, setCategories] = useState([{ name: 'All', logo: null }])
    const [searchParams, setSearchParams] = useSearchParams()
    const initialPage = parseInt(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 20

    const getCategoryName = (p) => {
        if (!p) return ''
        const c = p.category
        return typeof c === 'string' ? c : (c?.name || '')
    }

    const getBrandName = (p) => {
        if (!p) return ''
        const b = p.brand
        return typeof b === 'string' ? b : (b?.name || '')
    }

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
    }

    const handleSelectCategory = (catName) => {
        if (catName === 'All') {
            // If we are already on products page, maybe just reset category filter?
            // But user wants "single category page".
            // If user clicks "All", they probably want to see all products, which is this page.
            setSelectedCategory('All')
            return
        }
        const cat = categories.find(c => c.name === catName)
        const slug = cat ? (cat.slug || slugify(cat.name)) : slugify(catName)
        navigate(`/category/${slug}`)
    }

    const searchQuery = searchParams.get('search') || ''

    useEffect(() => {
        // Helpful debug log
        console.log('API_URL', API_URL)

        const fetchStaticFilters = async () => {
            try {
                const [catRes, brandRes, priceRes] = await Promise.all([
                    api.get('/categories/'),
                    api.get('/brands/'),
                    api.get('/products/price_range/')
                ]);

                const catList = catRes.data.results || catRes.data || [];
                setCategories([{ name: 'All', logo: null }, ...catList.map(c => ({
                    name: c.name,
                    logo: fixImage(c.logo),
                    id: c.id,
                    slug: c.slug || slugify(c.name)
                }))]);

                const brandList = brandRes.data.results || brandRes.data || [];
                setAllBrands(brandList.map(b => b.name).filter(Boolean));

                const minP = Math.floor(priceRes.data.min || 0);
                const maxP = Math.ceil(priceRes.data.max || 100000);
                setGlobalMin(minP);
                setGlobalMax(maxP);
                setPriceMin(minP);
                setPriceMax(maxP);
            } catch (error) {
                console.error('Error fetching static filters:', error);
            }
        };
        fetchStaticFilters();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const params = {
                    page: page,
                    search: searchQuery || undefined,
                    price__gte: priceMin,
                    price__lte: priceMax,
                    rating__gte: minRating > 0 ? minRating : undefined,
                    is_featured: featuredOnly || undefined,
                };

                if (selectedCategory !== 'All') {
                    const cat = categories.find(c => c.name === selectedCategory);
                    if (cat) params.category = cat.id;
                }

                if (selectedBrands.length > 0) {
                    // Use the comma-separated "in" lookup we added to the backend
                    params.brand__name__in = selectedBrands.join(','); 
                }

                const response = await api.get('/products/', { params })
                let list = []
                if (response.data && Array.isArray(response.data.results)) {
                    list = response.data.results
                    setTotalCount(response.data.count || 0)
                } else if (Array.isArray(response.data)) {
                    list = response.data
                    setTotalCount(list.length)
                }
                const mapped = list.map(p => ({
                    ...p,
                    image: fixImage(p.image)
                }))
                setProducts(mapped)
                setFilteredProducts(mapped)
                setLoading(false)
            } catch (error) {
                console.error('Products API error:', error)
                setLoading(false)
            }
        }

        fetchProducts()
    }, [page, selectedCategory, priceMin, priceMax, minRating, featuredOnly, selectedBrands, categories, searchQuery])

    // Update URL when page changes
    useEffect(() => {
        const currentParams = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...currentParams, page: page.toString() }, { replace: true })
        // Removed window.scrollTo({ top: 0, behavior: 'smooth' }) to prevent jump on filter
    }, [page, setSearchParams])


    const brands = allBrands;

    const handleToggleBrand = (brand, checked) => {
        if (checked) {
            setSelectedBrands(prev => prev.includes(brand) ? prev : [...prev, brand])
        } else {
            setSelectedBrands(prev => prev.filter(x => x !== brand))
        }
    }

    const handleClearAll = () => {
        setSelectedCategory('All')
        setPriceMin(globalMin)
        setPriceMax(globalMax)
        setMinRating(0)
        setFeaturedOnly(false)
        setSelectedBrands([])
    }


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center min-h-[50vh]">
    //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    //         </div>
    //     )
    // }

    return (
        <div className="w-[95%] sm:w-[90%] max-w-6xl mx-auto">
            <SEO
                title="Products"
                description="Browse our wide selection of premium products. Filter by category, price, brand, and more to find exactly what you need at Sarker Shop."
                url="https://sarker.shop/products"
            />
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCategoryOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                            aria-label="Open categories panel"
                        >
                            <MdApps className="w-5 h-5 text-purple-600" />
                            <span className="hidden sm:inline">Categories</span>
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                            aria-label="Open filters"
                        >
                            <MdFilterList className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                <CategoryCarousel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                />

                <FilterPanel
                    open={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    globalMin={globalMin}
                    globalMax={globalMax}
                    onChangePriceMin={(v) => setPriceMin(v)}
                    onChangePriceMax={(v) => setPriceMax(v)}
                    minRating={minRating}
                    onChangeMinRating={(v) => setMinRating(v)}
                    featuredOnly={featuredOnly}
                    onChangeFeaturedOnly={(v) => setFeaturedOnly(v)}
                    brands={brands}
                    selectedBrands={selectedBrands}
                    onToggleBrand={handleToggleBrand}
                    onClearAll={handleClearAll}
                />

                <CategoryPanel
                    open={isCategoryOpen}
                    onClose={() => setIsCategoryOpen(false)}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                />
            </div>

            {/* Products Grid Area */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex justify-center pt-20 bg-white/60 backdrop-blur-[1px] transition-all duration-300">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                            <p className="text-sm font-medium text-purple-600 animate-pulse">Updating products...</p>
                        </div>
                    </div>
                )}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={selectedCategory}
                    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 lg:gap-4 transition-opacity duration-300 ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                variants={itemVariants}
                                layout
                            >
                                <Product product={product} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {!loading && filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                    </motion.div>
                )}
            </div>

            {/* Pagination UI */}
            {totalCount > pageSize && (
                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                    <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-md border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-purple-400 cursor-pointer transition-colors'}`}
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                                className={`w-10 h-10 rounded-md border flex items-center justify-center transition-all ${page === p ? 'bg-purple-600 border-purple-600 text-white font-bold' : 'bg-white text-gray-700 hover:border-purple-400 cursor-pointer'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => { setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1)); window.scrollTo(0, 0); }}
                        disabled={page >= Math.ceil(totalCount / pageSize)}
                        className={`px-4 py-2 rounded-md border ${page >= Math.ceil(totalCount / pageSize) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-purple-400 cursor-pointer transition-colors'}`}
                    >
                        Next
                    </button>
                </div>
            )}

            {__styles}
        </div>
    )
}

export default Products
const __styles = (
    <style>{`
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes slide-out-right {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        .animate-slide-out-right {
            animation: slide-out-right 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
    `}</style>
)
