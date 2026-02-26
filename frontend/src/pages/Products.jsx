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

    useEffect(() => {
        // Helpful debug log
        console.log('API_URL', API_URL)

        const fetchProducts = async () => {
            setLoading(true)
            try {
                const response = await api.get(`/products/?page=${page}`)
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
                setLoading(false)
            } catch (error) {
                console.error('Products API error:', error)
                // Fallback to bundled local data
                const mapped = productsData.map(p => ({
                    ...p,
                    image: fixImage(p.image),
                    reviews_count: p.reviews
                }))
                setProducts(mapped)
                setFilteredProducts(mapped)
                setTotalCount(mapped.length)
                setLoading(false)
            }
        }

        fetchProducts()
    }, [page])

    // Update URL when page changes
    useEffect(() => {
        setSearchParams({ page: page.toString() }, { replace: true })
    }, [page, setSearchParams])


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/')
                const data = Array.isArray(response.data) ? response.data : (response.data?.results || [])
                const apiCategories = data.map(c => ({
                    name: c.name,
                    logo: fixImage(c.logo),
                    id: c.id,
                    slug: c.slug || slugify(c.name)
                }))

                // Remove duplicates
                const uniqueApiCategories = apiCategories.filter((c, index, self) =>
                    index === self.findIndex((t) => t.name === c.name)
                )

                setCategories([{ name: 'All', logo: null }, ...uniqueApiCategories])
            } catch (error) {
                console.error('Categories API error:', error)
                // Fallback: extract from products
                const localNames = [...new Set(products.map(p => getCategoryName(p)).filter(Boolean))]
                const localCats = localNames.map(name => ({ name, logo: null }))
                setCategories([{ name: 'All', logo: null }, ...localCats])
            }
        }
        if (products.length > 0) {
            fetchCategories()
        }
    }, [products])


    useEffect(() => {
        if (products.length > 0) {
            const prices = products.map(p => Number(p.price) || 0)
            const gMin = Math.floor(Math.min(...prices))
            const gMax = Math.ceil(Math.max(...prices))
            setGlobalMin(gMin)
            setGlobalMax(gMax)
            setPriceMin(gMin)
            setPriceMax(gMax)
        }
    }, [products])


    useEffect(() => {
        let base = products

        // Category Filter
        if (selectedCategory !== 'All') {
            base = base.filter(p => getCategoryName(p) === selectedCategory)
        }

        // Price Filter
        base = base.filter(p => {
            const price = Number(p.price) || 0
            return price >= priceMin && price <= priceMax
        })

        // Rating Filter
        base = base.filter(p => (p.rating ?? 0) >= minRating)

        // Featured Filter
        if (featuredOnly) {
            base = base.filter(p => p.is_featured)
        }

        // Brand Filter
        if (selectedBrands.length > 0) {
            base = base.filter(p => selectedBrands.includes(getBrandName(p)))
        }

        setFilteredProducts(base)
    }, [selectedCategory, priceMin, priceMax, minRating, featuredOnly, selectedBrands, products])


    const brands = Array.from(new Set((Array.isArray(products) ? products : []).map(p => getBrandName(p)).filter((s) => typeof s === 'string' && s.trim().length > 0)))

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="w-[95%] sm:w-[90%] max-w-6xl mx-auto">
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

            {/* Products Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 lg:gap-4"
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


            {filteredProducts.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <p className="text-gray-500 text-lg">No products found in this category.</p>
                </motion.div>
            )}

            {/* Pagination UI */}
            {totalCount > pageSize && (
                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-md border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-purple-400 cursor-pointer transition-colors'}`}
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-md border flex items-center justify-center transition-all ${page === p ? 'bg-purple-600 border-purple-600 text-white font-bold' : 'bg-white text-gray-700 hover:border-purple-400 cursor-pointer'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
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
