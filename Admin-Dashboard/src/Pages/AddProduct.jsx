import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, Edit, ArrowLeft, Image as ImageIcon, Plus, X, Check, AlertCircle, ChevronDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import api from '../api/axiosConfig';



const CustomSelect = ({ label, options, value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);
    const selectedOption = options.find(opt => String(opt.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full bg-[#071229] border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 flex items-center justify-between transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-600'}`}
            >
                <div className="flex items-center space-x-3 truncate">
                    {selectedOption ? (
                        <>
                            {(selectedOption.image || selectedOption.logo) && (
                                <img src={selectedOption.image || selectedOption.logo} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                            )}
                            <span className="truncate">{selectedOption.name}</span>
                        </>
                    ) : (
                        <span className="text-slate-500">{placeholder}</span>
                    )}
                </div>
                {!disabled && <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[70] w-full mt-2 bg-[#0b1a2a] border border-slate-700 rounded-xl shadow-2xl py-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {options.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-slate-500">No options available</div>
                    ) : (
                        options.map((opt) => (
                            <div 
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                className={`flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-800 transition-colors cursor-pointer ${String(opt.id) === String(value) ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300'}`}
                            >
                                {(opt.image || opt.logo) && (
                                    <img src={opt.image || opt.logo} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">{opt.name}</span>
                                {String(opt.id) === String(value) && <Check className="w-4 h-4" />}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const TakaIcon = ({ className = "w-3.5 h-3.5" }) => (
    <img src="/currency-taka.svg" alt="৳" className={`${className} opacity-60 invert-[0.3]`} />
);

const AddProduct = () => {
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;
    const isView = location.pathname.includes('/view/');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingProduct, setFetchingProduct] = useState(false);

    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        short_description: '',
        price: '',
        discount_price: '',
        wholesale_price: '',
        stock_quantity: '',
        is_featured: false,
        is_bestseller: false,
        is_active: true,
        category_id: '',
        brand_id: '',
    });

    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
    const [variants, setVariants] = useState([{ price: '', wholesale_price: '', discount_price: '', stock_quantity: '', color: '', ram: '', storage: '' }]);
    const [images, setImages] = useState([]); // [{file, is_primary}]
    const [existingImages, setExistingImages] = useState([]); // [{id, image, is_primary}]
    const [deletedImages, setDeletedImages] = useState([]); 
    const [imagePreviews, setImagePreviews] = useState([]); 
    
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, brandsRes] = await Promise.all([
                    api.get('/categories/'),
                    api.get('/brands/')
                ]);
                setCategories(catsRes.data?.results || catsRes.data || []);
                setBrands(brandsRes.data?.results || brandsRes.data || []);

                if (isEdit) {
                    setFetchingProduct(true);
                    const productRes = await api.get(`/products/${id}/`);
                    const productData = productRes.data;
                    
                    setFormData({
                        name: productData.name || '',
                        description: productData.description || '',
                        short_description: productData.short_description || '',
                        price: productData.price || '',
                        discount_price: productData.discount_price || '',
                        wholesale_price: productData.wholesale_price || '',
                        stock_quantity: productData.stock_quantity || '',
                        is_featured: productData.is_featured || false,
                        is_bestseller: productData.is_bestseller || false,
                        is_active: productData.is_active !== false,
                        category_id: productData.category?.id || '',
                        brand_id: productData.brand?.id || '',
                    });

                    if (productData.specifications) {
                        setSpecifications(productData.specifications.length > 0 
                            ? productData.specifications 
                            : [{ key: '', value: '' }]);
                    }
                    
                    if (productData.variants) {
                        setVariants(productData.variants.length > 0
                            ? productData.variants.map(v => ({
                                id: v.id,
                                price: v.price || '',
                                wholesale_price: v.wholesale_price || '',
                                discount_price: v.discount_price || '',
                                stock_quantity: v.stock_quantity || '',
                                color: v.color || '',
                                ram: v.ram || '',
                                storage: v.storage || ''
                            }))
                            : [{ price: '', wholesale_price: '', discount_price: '', stock_quantity: '', color: '', ram: '', storage: '' }]);
                    }

                    const combinedImages = [];
                    // Add primary image if exists
                    if (productData.image) {
                        combinedImages.push({
                            id: 'primary_field', 
                            image: productData.image,
                            is_primary: true
                        });
                    }
                    // Add other gallery images
                    if (productData.gallery_images && productData.gallery_images.length > 0) {
                        combinedImages.push(...productData.gallery_images);
                    }
                    setExistingImages(combinedImages);
                    setFetchingProduct(false);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                toast.error('Failed to load product data');
                setFetchingProduct(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const removeExistingImage = (imageId) => {
        if (isView) return;
        setDeletedImages(prev => [...prev, imageId]);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const togglePrimaryExisting = (imageId) => {
        if (isView) return;
        setExistingImages(prev => prev.map(img => ({
            ...img,
            is_primary: img.id === imageId
        })));
        // Deselect any new image that was marked primary
        setImages(prev => prev.map(img => ({ ...img, is_primary: false })));
    };

    const togglePrimaryNew = (index) => {
        if (isView) return;
        setImages(prev => prev.map((img, i) => ({
            ...img,
            is_primary: i === index
        })));
        // Deselect any existing image that was marked primary
        setExistingImages(prev => prev.map(img => ({ ...img, is_primary: false })));
    };

    const handleChange = (e) => {
        if (isView) return;
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSpecChange = (index, field, value) => {
        if (isView) return;
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const addSpec = () => {
        if (isView) return;
        setSpecifications([...specifications, { key: '', value: '' }]);
    }
    const removeSpec = (index) => {
        if (isView) return;
        setSpecifications(specifications.filter((_, i) => i !== index));
    }

    const handleVariantChange = (index, field, value) => {
        if (isView) return;
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        if (isView) return;
        setVariants([...variants, { price: '', wholesale_price: '', discount_price: '', stock_quantity: '', color: '', ram: '', storage: '' }]);
    }
    const removeVariant = (index) => {
        if (isView) return;
        setVariants(variants.filter((_, i) => i !== index));
    }

    const handleImageChange = (e) => {
        if (isView) return;
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            file,
            is_primary: false
        }));
        setImages(prev => [...prev, ...newImages]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        if (isView) return;
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isView) return;
        setLoading(true);

        try {
            const formPayload = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '' && formData[key] !== null) {
                    formPayload.append(key, formData[key]);
                }
            });

            const filteredSpecs = specifications.filter(s => s.key && s.value);
            const filteredVariants = variants
                .filter(v => v.price || v.stock_quantity)
                .map(v => {
                    const cleaned = { ...v };
                    // Replace empty strings with null for numeric/optional fields
                    ['price', 'wholesale_price', 'discount_price', 'stock_quantity', 'ram', 'storage'].forEach(field => {
                        if (cleaned[field] === '') {
                            cleaned[field] = null;
                        }
                    });
                    return cleaned;
                });
    
            if (filteredSpecs.length > 0) {
                formPayload.append('specs_input', JSON.stringify(filteredSpecs));
            }
            if (filteredVariants.length > 0) {
                formPayload.append('variants_input', JSON.stringify(filteredVariants));
            }

            if (deletedImages.length > 0) {
                formPayload.append('deleted_images', JSON.stringify(deletedImages));
            }

            images.forEach((imgObj, idx) => {
                formPayload.append('uploaded_images', imgObj.file);
                if (imgObj.is_primary) {
                    formPayload.append('primary_new_image_index', idx);
                }
            });

            const primaryExisting = existingImages.find(img => img.is_primary);
            if (primaryExisting) {
                formPayload.append('primary_image_id', primaryExisting.id);
            }

            if (isEdit) {
                await api.patch(`/products/${id}/`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully!');
            } else {
                await api.post('/products/', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created successfully!');
            }
            setTimeout(() => navigate('/products'), 3000);
        } catch (error) {
            console.error('Failed to submit:', error.response?.data || error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Check console for details';
            toast.error('Failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Breadcrumb title={isView ? "View Product" : (isEdit ? "Edit Product" : "Add Product")} paths={["Home", "Products", isView ? "View" : (isEdit ? "Edit" : "Add New")]} />
                {isView ? (
                    <button
                        onClick={() => navigate(`/products/edit/${id}`)}
                        className="flex items-center text-blue-400 hover:text-white transition-colors bg-blue-600/10 px-4 py-1.5 rounded-lg border border-blue-500/20 cursor-pointer shadow-lg shadow-blue-600/5 hover:bg-blue-600/20 font-bold"
                    >
                        <Edit className="w-4 h-4 mr-2" /> Edit Product
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                    </button>
                )}
            </div>



            {isEdit && fetchingProduct ? (
                <div className="flex items-center justify-center p-20 bg-[#0b1a2a]/50 rounded-2xl border border-slate-800 lg:col-span-3 mt-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <form id="add-product-form" onSubmit={handleSubmit} className="mt-6 pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Basic Info */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                        Basic Information
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Product Name *</label>
                                        <input
                                            required
                                            type="text"
                                            name="name"
                                            placeholder="Enter product name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            readOnly={isView}
                                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Description</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            placeholder="Describe your product in detail..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            readOnly={isView}
                                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500 resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-300">Short Description</label>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                (formData.short_description?.length || 0) > 150 
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                                : (formData.short_description?.length || 0) > 130
                                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                : 'bg-slate-800 text-slate-500 border-slate-700'
                                            }`}>
                                                {formData.short_description?.length || 0} / 160
                                            </span>
                                        </div>
                                        <textarea
                                            name="short_description"
                                            rows="2"
                                            maxLength="160"
                                            placeholder="A brief summary for cards and lists..."
                                            value={formData.short_description}
                                            onChange={handleChange}
                                            readOnly={isView}
                                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500 resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                        Pricing & Inventory
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Base Price *</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                                    <TakaIcon />
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    name="price"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    readOnly={isView}
                                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Discount Price</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                                    <TakaIcon />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="discount_price"
                                                    placeholder="0.00"
                                                    value={formData.discount_price}
                                                    onChange={handleChange}
                                                    readOnly={isView}
                                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500 border-dashed border-emerald-500/30 font-bold text-emerald-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Wholesale Price</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                                    <TakaIcon />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="wholesale_price"
                                                    placeholder="0.00"
                                                    value={formData.wholesale_price}
                                                    onChange={handleChange}
                                                    readOnly={isView}
                                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 uppercase tracking-tighter">Stock *</label>
                                            <input
                                                required
                                                type="number"
                                                name="stock_quantity"
                                                placeholder="Qty"
                                                value={formData.stock_quantity}
                                                onChange={handleChange}
                                                readOnly={isView}
                                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                        Specifications
                                    </h3>
                                    {!isView && (
                                        <button
                                            type="button"
                                            onClick={addSpec}
                                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-600/20 transition-all text-sm font-bold cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Add Special Field
                                        </button>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {specifications.map((spec, index) => (
                                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 group">
                                                <input
                                                    type="text"
                                                    placeholder="Field Name (e.g. RAM)"
                                                    value={spec.key}
                                                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                                    readOnly={isView}
                                                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g. 16GB)"
                                                        value={spec.value}
                                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                        readOnly={isView}
                                                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                                                    />
                                                    {!isView && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSpec(index)}
                                                            className="p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                        Product Variants
                                    </h3>
                                    {!isView && (
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="flex items-center gap-2 px-4 py-1.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-600/20 transition-all text-sm font-bold cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Add Variant
                                        </button>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50 space-y-4 relative group">
                                                {!isView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all shadow-lg z-10 opacity-0 group-hover:opacity-100 cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color</label>
                                                        <input
                                                            type="text"
                                                            value={variant.color}
                                                            onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="e.g. Red"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">RAM</label>
                                                        <input
                                                            type="text"
                                                            value={variant.ram}
                                                            onChange={(e) => handleVariantChange(index, 'ram', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="e.g. 8GB"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storage</label>
                                                        <input
                                                            type="text"
                                                            value={variant.storage}
                                                            onChange={(e) => handleVariantChange(index, 'storage', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="e.g. 256GB"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-700/30">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</label>
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="0.00"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest">Discount</label>
                                                        <input
                                                            type="number"
                                                            value={variant.discount_price}
                                                            onChange={(e) => handleVariantChange(index, 'discount_price', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="0.00"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 border-dashed border-emerald-500/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WS Price</label>
                                                        <input
                                                            type="number"
                                                            value={variant.wholesale_price}
                                                            onChange={(e) => handleVariantChange(index, 'wholesale_price', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="0.00"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock_quantity}
                                                            onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                                                            readOnly={isView}
                                                            placeholder="0"
                                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            
                            {/* Organization */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl relative z-[20]">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                        Organization
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <CustomSelect 
                                        label="Category"
                                        placeholder="Select Category"
                                        options={categories}
                                        value={formData.category_id}
                                        onChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                                        disabled={isView}
                                    />
                                    
                                    <CustomSelect 
                                        label="Brand"
                                        placeholder="Select Brand"
                                        options={brands}
                                        value={formData.brand_id}
                                        onChange={(val) => setFormData(prev => ({ ...prev, brand_id: val }))}
                                        disabled={isView}
                                    />
                                </div>
                            </div>

                            {/* Media */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                        Media Gallery
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {!isView && (
                                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <ImageIcon className="w-8 h-8 text-slate-500 mb-2 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                                            <p className="text-sm font-medium text-slate-300">Click to upload images</p>
                                            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}

                                    {/* Gallery Grid */}
                                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Existing */}
                                            {existingImages.map((img) => (
                                                <div key={img.id} className={`relative aspect-square rounded-lg border overflow-hidden group transition-all ${img.is_primary ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-800'}`}>
                                                    <img src={img.image} alt="Product" className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isView && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeExistingImage(img.id)}
                                                                className="p-1 bg-red-600 text-white rounded shadow-lg cursor-pointer"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        {!isView && !img.is_primary && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => togglePrimaryExisting(img.id)}
                                                                className="p-1 bg-yellow-500 text-white rounded shadow-lg cursor-pointer"
                                                            >
                                                                <Star className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {img.is_primary && (
                                                        <div className="absolute bottom-0 inset-x-0 bg-yellow-500 text-[10px] text-slate-900 text-center font-bold py-1 uppercase tracking-tighter shadow-lg z-10">Primary</div>
                                                    )}
                                                </div>
                                            ))}
                                            {/* New Previews */}
                                            {imagePreviews.map((src, idx) => (
                                                <div key={idx} className={`relative aspect-square rounded-lg border overflow-hidden group transition-all ${images[idx]?.is_primary ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-800 bg-emerald-950/20'}`}>
                                                    <img src={src} alt="New" className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isView && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeImage(idx)}
                                                                className="p-1 bg-red-600 text-white rounded shadow-lg cursor-pointer"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        {!isView && !images[idx]?.is_primary && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => togglePrimaryNew(idx)}
                                                                className="p-1 bg-yellow-500 text-white rounded shadow-lg cursor-pointer"
                                                            >
                                                                <Star className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {images[idx]?.is_primary && (
                                                        <div className="absolute bottom-0 inset-x-0 bg-yellow-500 text-[10px] text-slate-900 text-center font-bold py-1 uppercase tracking-tighter shadow-lg z-10">Primary</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                        Status
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {[
                                        { name: 'is_active', label: 'Active Status', desc: 'Visible to customers' },
                                        { name: 'is_featured', label: 'Featured Product', desc: 'Display in home sections' },
                                        { name: 'is_bestseller', label: 'Bestseller', desc: 'Add bestseller badge' }
                                    ].map((item) => (
                                        <label key={item.name} className={`flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 group transition-all ${isView ? 'cursor-default' : 'cursor-pointer hover:bg-slate-800/50'}`}>
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-semibold text-slate-200">{item.label}</div>
                                                <div className="text-xs text-slate-500">{item.desc}</div>
                                            </div>
                                            <div className="relative inline-flex items-center group cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name={item.name}
                                                    className="sr-only peer"
                                                    checked={formData[item.name]}
                                                    onChange={handleChange}
                                                    disabled={isView}
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-all"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Action Bar */}
                    <div className="fixed bottom-0 right-0 sm:left-[var(--sidebar-width,18rem)] left-0 bg-[#0b1a2a]/95 backdrop-blur-xl border-t border-slate-800/80 p-4 z-[100] flex items-center justify-end space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors flex items-center space-x-2 font-medium cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{isView ? 'Back to Products' : 'Discard'}</span>
                        </button>
                        {!isView && (
                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-w-[160px] shadow-lg shadow-blue-600/20 cursor-pointer"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span className="font-semibold">{isEdit ? 'Update' : 'Create'}</span>
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddProduct;
