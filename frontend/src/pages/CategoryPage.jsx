import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Product from '../components/Product'
import { MdFilterList, MdApps } from 'react-icons/md'
import CategoryPanel from '../components/CategoryPanel.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import api, { BASE_URL } from '../api/client'
import { useCart } from '../context/CartContext'
import localProducts from '../data/products.json'

const fixImage = (img) => {
    if (!img) return ''
    if (typeof img === 'string' && img.startsWith('http')) return img
    return `${BASE_URL}${img}`
}

const CategoryPage = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isBrandRoute = location.pathname.includes('/brand/')

    const [categories, setCategories] = useState([{ name: 'All', logo: null }])
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const initialPage = parseInt(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 20

    // UI state
    const { isFilterOpen, setIsFilterOpen, isCategoryOpen, setIsCategoryOpen } = useCart()

    // Filter state
    const [priceMin, setPriceMin] = useState(0)
    const [priceMax, setPriceMax] = useState(0)
    const [globalMin, setGlobalMin] = useState(0)
    const [globalMax, setGlobalMax] = useState(0)
    const [minRating, setMinRating] = useState(0)
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [selectedBrands, setSelectedBrands] = useState([])

    // Helpers
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

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/')
                const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
                const apiCategories = data.map(c => ({
                    name: c.name,
                    logo: fixImage(c.logo),
                    id: c.id,
                    slug: c.slug || slugify(c.name)
                }))
                const uniqueApiCategories = apiCategories.filter((c, index, self) =>
                    index === self.findIndex((t) => t.name === c.name)
                )
                setCategories([{ name: 'All', logo: null }, ...uniqueApiCategories])
            } catch (error) {
                console.error("Error fetching categories:", error)
                // Fallback to local data
                const localNames = [...new Set(products.map(p => getCategoryName(p)).filter(Boolean))]
                const localCats = localNames.map(name => ({ name, logo: null, slug: slugify(name) }))
                setCategories([{ name: 'All', logo: null }, ...localCats])
            }
        }
        fetchCategories()
    }, [products])

    // Fetch Products (Server-side filtering & pagination)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                let url = `/products/?page=${page}`
                if (slug && slug !== 'all') {
                    if (isBrandRoute) {
                        url += `&brand__slug=${slug}`
                    } else {
                        url += `&category__slug=${slug}`
                    }
                }

                const response = await api.get(url)
                let list = []
                if (Array.isArray(response.data)) {
                    list = response.data
                    setTotalCount(list.length)
                } else if (response.data && Array.isArray(response.data.results)) {
                    list = response.data.results
                    setTotalCount(response.data.count || 0)
                }
                const mapped = list.map(p => ({
                    ...p,
                    image: fixImage(p.image)
                }))
                setProducts(mapped)
                setFilteredProducts(mapped)
            } catch (error) {
                console.error("Error fetching products:", error)
                // Fallback to local data
                let base = localProducts.map(p => ({
                    ...p,
                    image: fixImage(p.image),
                    reviews_count: p.reviews
                }))

                if (slug && slug !== 'all') {
                    if (isBrandRoute) {
                        base = base.filter(p => slugify(getBrandName(p)) === slug)
                    } else {
                        base = base.filter(p => slugify(getCategoryName(p)) === slug)
                    }
                }
                setProducts(base)
                setFilteredProducts(base)
                setTotalCount(base.length)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [slug, isBrandRoute, page])

    // Update URL when page changes
    useEffect(() => {
        setSearchParams({ page: page.toString() }, { replace: true })
    }, [page, setSearchParams])

    // Price Range Calculation (We might keep this local for the current products, 
    // but in a real pro app, we'd fetch min/max from backend aggregation)
    useEffect(() => {
        // Only reset price ranges if we have products and it's the first load for this category
        if (products.length > 0) {
            const prices = products.map(p => Number(p.price) || 0)
            const gMin = Math.floor(Math.min(...prices))
            const gMax = Math.ceil(Math.max(...prices))
            setGlobalMin(gMin)
            setGlobalMax(gMax)
            if (priceMin === 0 && priceMax === 0) {
                setPriceMin(gMin)
                setPriceMax(gMax)
            }
        }
    }, [products])

    // Filter Logic
    useEffect(() => {
        let base = products

        // 1. Filter by Route (Category or Brand)
        if (slug && slug !== 'all') {
            if (isBrandRoute) {
                // Filter by Brand
                base = base.filter(p => slugify(getBrandName(p)) === slug)
            } else {
                // Filter by Category
                base = base.filter(p => slugify(getCategoryName(p)) === slug)
            }
        }

        // 2. Apply Side Filters
        // Price
        base = base.filter(p => {
            const price = Number(p.price) || 0
            return price >= priceMin && price <= priceMax
        })

        // Rating
        base = base.filter(p => (p.rating ?? 0) >= minRating)

        // Featured
        if (featuredOnly) {
            base = base.filter(p => p.is_featured)
        }

        // Selected Brands (from Filter Panel)
        // If we are on a brand page, we might want to ignore this or pre-select. 
        // For now, let's treat selectedBrands as *additional* filter if user selects manually.
        if (selectedBrands.length > 0) {
            base = base.filter(p => selectedBrands.includes(getBrandName(p)))
        }

        setFilteredProducts(base)
    }, [slug, isBrandRoute, priceMin, priceMax, minRating, featuredOnly, selectedBrands, products])


    // Navigation Handlers
    const handleSelectCategory = (catName) => {
        // If "All", go to /categories
        if (catName === 'All') {
            navigate('/categories')
            return
        }

        // Find slug for category name
        const cat = categories.find(c => c.name === catName)
        const targetSlug = cat ? (cat.slug || slugify(cat.name)) : slugify(catName)

        navigate(`/category/${targetSlug}`)
        setIsCategoryOpen(false)
    }

    const brands = Array.from(new Set((Array.isArray(products) ? products : []).map(p => getBrandName(p)).filter((s) => typeof s === 'string' && s.trim().length > 0)))

    const handleToggleBrand = (brand, checked) => {
        // If on a brand page, maybe we should navigate?
        // User asked: "browse category by using category slug... same should be for brand"
        // So clicking a brand in filter panel could navigate to /brand/:slug
        // BUT typically filter panels are for "refining" the current view.
        // Let's keep filter panel as "refine" and rely on URL for the main context.
        // However, if I am on "Electronics" and I click "Samsung", I expect to see "Samsung Electronics".
        // If I am on "All Products" and I click "Samsung", I expect to see "Samsung".

        if (checked) {
            setSelectedBrands(prev => prev.includes(brand) ? prev : [...prev, brand])
        } else {
            setSelectedBrands(prev => prev.filter(x => x !== brand))
        }
    }

    const handleClearAll = () => {
        setPriceMin(globalMin)
        setPriceMax(globalMax)
        setMinRating(0)
        setFeaturedOnly(false)
        setSelectedBrands([])
        // Do NOT navigate away from current category/brand route on "Clear Filters"
        // unless "Clear All" implies resetting the route too. usually it implies resetting *filters*.
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

    // Determine Title
    let pageTitle = 'All Products'
    if (slug && slug !== 'all') {
        if (isBrandRoute) {
            // Find brand name from slug (reverse lookup or just format slug)
            // Ideally we find a product with that brand
            const foundProduct = products.find(p => slugify(getBrandName(p)) === slug)
            const brandName = foundProduct ? getBrandName(foundProduct) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            pageTitle = `${brandName}`
        } else {
            const cat = categories.find(c => (c.slug === slug || slugify(c.name) === slug))
            pageTitle = cat ? cat.name : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
    }

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center min-h-[50vh]">
    //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    //         </div>
    //     )
    // }

    return (
        <div className="w-[95%] sm:w-[90%] max-w-6xl mx-auto py-8">
            <div className="mb-8">
                {/* Header with Title and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {pageTitle}
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCategoryOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm cursor-pointer"
                            aria-label="Open categories panel"
                        >
                            <MdApps className="w-5 h-5 text-purple-600" />
                            <span className="hidden sm:inline">Categories</span>
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm cursor-pointer"
                            aria-label="Open filters"
                        >
                            <MdFilterList className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                <CategoryPanel
                    open={isCategoryOpen}
                    onClose={() => setIsCategoryOpen(false)}
                    categories={categories}
                    selectedCategory={isBrandRoute ? null : pageTitle} // Highlight if matches name
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

                {/* Products Grid Area */}
                <div className="relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex justify-center pt-20 bg-white/60 backdrop-blur-[1px] transition-all duration-300">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                <p className="text-sm font-medium text-purple-600 animate-pulse">Filtering products...</p>
                            </div>
                        </div>
                    )}

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={slug || 'all'}
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

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No products found.</p>
                        {(slug || isBrandRoute) && (
                            <button
                                onClick={() => navigate('/categories')}
                                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
                            >
                                Browse All Categories
                            </button>
                        )}
                    </div>
                )}
            </div>
            {__styles}
        </div>
    )
}

export default CategoryPage

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
