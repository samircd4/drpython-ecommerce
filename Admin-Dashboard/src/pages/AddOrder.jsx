import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Plus, Minus, Trash2, User, MapPin, 
    CreditCard, ShoppingBag, ArrowLeft, Check, 
    Loader2, ChevronDown, Phone, Mail, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import Breadcrumb from '../components/Layout/Breadcrumb';
import SearchableSelect from '../components/AddOrder/SearchableSelect';
import { useStoreConfig } from '../hooks/useStoreConfig';

const AddOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { config } = useStoreConfig();
    const symbol = config?.currency_symbol || "৳";
    
    // Data for selectors
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Selection states
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        division: '',
        district: '',
        sub_district: '',
        shipping_address: '',
        payment_method: 'Cash on delivery',
        status: 'pending',
        delivery_charge: 0,
        discount: 0,
        tax: 0,
    });

    // Search states
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [showProductResults, setShowProductResults] = useState(false);

    const customerSearchRef = useRef(null);
    const productSearchRef = useRef(null);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [divRes] = await Promise.all([
                    api.get('/divisions/'),
                ]);
                setDivisions(divRes.data.results || divRes.data);
                
                // Fetch order statuses if possible or hardcode defaults
                // We'll use defaults for now based on Orders.jsx
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Customers on search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (customerSearch.trim().length > 1) {
                try {
                    const res = await api.get(`/customers/?search=${customerSearch}`);
                    setCustomers(res.data.results || []);
                } catch (error) {
                    console.error('Error searching customers:', error);
                }
            } else {
                setCustomers([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [customerSearch]);

    // Fetch Products on search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (productSearch.trim().length > 1) {
                try {
                    const res = await api.get(`/products/?search=${productSearch}`);
                    setProducts(res.data.results || []);
                } catch (error) {
                    console.error('Error searching products:', error);
                }
            } else {
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [productSearch]);

    // Fetch Districts when division changes
    useEffect(() => {
        if (formData.division) {
            const fetchDistricts = async () => {
                try {
                    const divisionObj = divisions.find(d => d.name === formData.division);
                    if (divisionObj) {
                        const res = await api.get(`/districts/?division_id=${divisionObj.id}`);
                        setDistricts(res.data.results || res.data);
                        setSubDistricts([]);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setSubDistricts([]);
        }
    }, [formData.division, divisions]);

    // Fetch Sub-districts when district changes
    useEffect(() => {
        if (formData.district) {
            const fetchSubDistricts = async () => {
                try {
                    const districtObj = districts.find(d => d.name === formData.district);
                    if (districtObj) {
                        const res = await api.get(`/sub-districts/?district_id=${districtObj.id}`);
                        setSubDistricts(res.data.results || res.data);
                    }
                } catch (error) {
                    console.error('Error fetching sub-districts:', error);
                }
            };
            fetchSubDistricts();
        } else {
            setSubDistricts([]);
        }
    }, [formData.district, districts]);

    // Handle Customer Selection
    const handleSelectCustomer = (customer) => {
        const defaultAddr = customer.addresses?.find(a => a.is_default) || customer.addresses?.[0];
        
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            full_name: customer.name || customer.full_name || '',
            email: customer.email || '',
            phone: customer.phone_number || customer.phone || '',
            // Populate address if exists
            ...(defaultAddr ? {
                division: defaultAddr.division || '',
                district: defaultAddr.district || '',
                sub_district: defaultAddr.sub_district || '',
                shipping_address: defaultAddr.address || '',
            } : {})
        }));
        setCustomerSearch('');
        setShowCustomerResults(false);
    };

    // Handle Product Selection
    const handleAddProduct = (product, variant = null) => {
        const itemId = variant ? `v-${variant.id}` : `p-${product.id}`;
        const existingItem = orderItems.find(item => item.itemId === itemId);

        if (existingItem) {
            setOrderItems(prev => prev.map(item => 
                item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            const price = variant ? 
                (variant.discount_price && variant.discount_price > 0 ? variant.discount_price : variant.price) :
                (product.discount_price && product.discount_price > 0 ? product.discount_price : product.price);

            setOrderItems(prev => [...prev, {
                itemId,
                product_id: product.id,
                variant_id: variant ? variant.id : null,
                name: product.name,
                variantLabel: variant ? `${variant.ram || ''} ${variant.storage || ''} ${variant.color || ''}`.trim() : null,
                price: parseFloat(price),
                quantity: 1,
                image: product.image
            }]);
        }
        setProductSearch('');
        setShowProductResults(false);
    };

    const handleUpdateQuantity = (itemId, delta) => {
        setOrderItems(prev => prev.map(item => {
            if (item.itemId === itemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleRemoveItem = (itemId) => {
        setOrderItems(prev => prev.filter(item => item.itemId !== itemId));
    };

    // Calculations
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = subtotal + parseFloat(formData.delivery_charge || 0) + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0);

    const validateForm = () => {
        const requiredFields = {
            full_name: "Customer Name",
            phone: "Phone Number",
            shipping_address: "Street Address",
            division: "Division",
            district: "District"
        };

        for (const [key, label] of Object.entries(requiredFields)) {
            if (!formData[key] || formData[key].trim() === '') {
                toast.error(`${label} is required.`);
                return false;
            }
        }

        // Phone validation (BD format: 013-019 followed by 8 digits)
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Please enter a valid Bangladesh phone number (01XXXXXXXXX).");
            return false;
        }

        if (orderItems.length === 0) {
            toast.error("Please add at least one product to the order.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                items_input: orderItems.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity
                })),
                total_amount: grandTotal
            };

            const response = await api.post('/orders/', payload);
            toast.success("Order created successfully!");
            navigate('/orders');
        } catch (error) {
            console.error('Error creating order:', error);
            const data = error.response?.data;
            let msg = "Failed to create order";
            
            if (data) {
                if (typeof data === 'object') {
                    msg = Object.entries(data)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                        .join(' | ');
                } else {
                    msg = data;
                }
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
                setShowCustomerResults(false);
            }
            if (productSearchRef.current && !productSearchRef.current.contains(event.target)) {
                setShowProductResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-[#071229]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <Breadcrumb 
                    title="Add Order" 
                    paths={[
                        { label: "Home", path: "/" },
                        { label: "Orders", path: "/orders" },
                        { label: "Add New", path: "/orders/add" }
                    ]} 
                />
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
                {/* Left Column: Order Items & Product Search */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Selection */}
                    <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl relative z-40">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                Order Items
                            </h3>
                            <div className="relative w-64" ref={productSearchRef}>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Search className="w-4 h-4 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                                    onFocus={() => setShowProductResults(true)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                                />
                                
                                {showProductResults && products.length > 0 && (
                                    <div className="absolute z-50 mt-2 w-[450px] right-0 bg-[#0b1a2a] border border-slate-700 rounded-xl shadow-2xl py-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                                        {products.map(product => (
                                            <div key={product.id} className="p-2 border-b border-slate-800/30 last:border-0">
                                                <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors" onClick={() => !product.variants?.length && handleAddProduct(product)}>
                                                    <img src={product.image || '/placeholder.png'} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-800" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-200 truncate">{product.name}</p>
                                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                                                                {product.product_id}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <p className="text-xs text-blue-400 font-black tracking-tight">{symbol}{Number(product.price).toLocaleString()}</p>
                                                            <p className="text-[10px] text-slate-500 font-mono italic">SKU: {product.sku}</p>
                                                        </div>
                                                    </div>
                                                    {!product.variants?.length && <Plus className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                {product.variants?.map(variant => (
                                                    <div 
                                                        key={variant.id} 
                                                        onClick={() => handleAddProduct(product, variant)}
                                                        className="ml-14 flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border-l-2 border-slate-800 mt-1"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-300">
                                                                {variant.ram && `${variant.ram}GB / `}
                                                                {variant.storage && `${variant.storage}GB `}
                                                                {variant.color && `• ${variant.color}`}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                <p className="text-[10px] text-blue-400 font-black">{symbol}{Number(variant.price).toLocaleString()}</p>
                                                                <p className="text-[9px] text-slate-500 font-mono">{variant.sku}</p>
                                                            </div>
                                                        </div>
                                                        <Plus className="w-3 h-3 text-blue-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {orderItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                    <ShoppingBag className="w-12 h-12 text-slate-700 mb-4" />
                                    <p className="text-slate-500 text-sm">No products added to this order yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orderItems.map((item) => (
                                        <div key={item.itemId} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-all">
                                            <img src={item.image || '/placeholder.png'} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-800" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-200 truncate">{item.name}</h4>
                                                {item.variantLabel && (
                                                    <p className="text-xs text-slate-500 mt-0.5">{item.variantLabel}</p>
                                                )}
                                                <p className="text-sm text-blue-400 font-bold mt-1">{symbol}{Number(item.price).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-1.5 border border-slate-700">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.itemId, -1)}
                                                    className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-bold text-slate-200 min-w-[20px] text-center">{item.quantity}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleUpdateQuantity(item.itemId, 1)}
                                                    className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-sm font-bold text-white">{symbol}{(item.price * item.quantity).toLocaleString()}</p>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.itemId)}
                                                    className="mt-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl relative z-30">
                        <div className="px-6 py-4 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                Shipping Details
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Customer full name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="01XXXXXXXXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Division"
                                    required
                                    value={formData.division}
                                    options={divisions}
                                    onChange={(val) => setFormData({...formData, division: val, district: '', sub_district: ''})}
                                    placeholder="Select Division"
                                />
                            </div>
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="District"
                                    required
                                    disabled={!formData.division}
                                    value={formData.district}
                                    options={districts}
                                    onChange={(val) => setFormData({...formData, district: val, sub_district: ''})}
                                    placeholder="Select District"
                                />
                            </div>
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Sub-district / Area"
                                    disabled={!formData.district}
                                    value={formData.sub_district}
                                    options={subDistricts}
                                    onChange={(val) => setFormData({...formData, sub_district: val})}
                                    placeholder="Select Sub-district"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-400">Street Address *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <textarea
                                        required
                                        rows="2"
                                        placeholder="House #, Road #, Area details..."
                                        value={formData.shipping_address}
                                        onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none text-slate-200 resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Search, Payment, Summary */}
                <div className="space-y-6">
                    {/* Customer Selection */}
                    <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl relative z-30" ref={customerSearchRef}>
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                Customer
                            </h3>
                            {selectedCustomer && (
                                <button 
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            {!selectedCustomer ? (
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Search className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search existing customer..."
                                        value={customerSearch}
                                        onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerResults(true); }}
                                        onFocus={() => setShowCustomerResults(true)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none text-slate-200"
                                    />
                                    
                                    {showCustomerResults && customers.length > 0 && (
                                        <div className="absolute z-60 mt-2 w-full bg-[#0b1a2a] border border-slate-700 rounded-xl shadow-2xl py-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {customers.map(customer => (
                                                <div 
                                                    key={customer.id} 
                                                    onClick={() => handleSelectCustomer(customer)}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800/30 last:border-0 group"
                                                >
                                                    <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all text-lg">
                                                        {customer.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-slate-200 truncate uppercase tracking-tight">{customer.full_name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1">
                                                                <Phone className="w-2.5 h-2.5" /> {customer.phone_number || customer.phone}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1">
                                                                <Mail className="w-2.5 h-2.5" /> {customer.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        <span>Searching will show registered customers.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 text-xl">
                                        {selectedCustomer.full_name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-white truncate">{selectedCustomer.full_name}</p>
                                        <p className="text-xs text-blue-300 truncate">{selectedCustomer.email}</p>
                                    </div>
                                    <Check className="w-5 h-5 text-emerald-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Controls */}
                    <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl relative z-20">
                        <div className="px-6 py-4 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                Order Settings
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <SearchableSelect
                                label="Payment Method"
                                icon={CreditCard}
                                value={formData.payment_method}
                                options={['Cash on delivery', 'Bkash', 'Nagad', 'Rocket', 'Bank Transfer'].map(m => ({ label: m }))}
                                onChange={(val) => setFormData({...formData, payment_method: val})}
                            />
                            
                            <SearchableSelect
                                label="Order Status"
                                value={formData.status}
                                options={[
                                    { label: 'Pending', name: 'pending' },
                                    { label: 'Processing', name: 'processing' },
                                    { label: 'Shipped', name: 'shipped' },
                                    { label: 'Delivered', name: 'delivered' },
                                    { label: 'Cancelled', name: 'cancelled' },
                                    { label: 'Returned', name: 'returned' }
                                ]}
                                onChange={(val) => {
                                    const opt = [
                                        { label: 'Pending', name: 'pending' },
                                        { label: 'Processing', name: 'processing' },
                                        { label: 'Shipped', name: 'shipped' },
                                        { label: 'Delivered', name: 'delivered' },
                                        { label: 'Cancelled', name: 'cancelled' },
                                        { label: 'Returned', name: 'returned' }
                                    ].find(o => o.label === val);
                                    setFormData({...formData, status: opt.name});
                                }}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#0b1a2a]/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Order Summary</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Subtotal</span>
                                <span className="text-slate-200 font-medium">{symbol}{Number(subtotal).toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-slate-400">Delivery Charge</label>
                                    <input 
                                        type="number"
                                        value={formData.delivery_charge}
                                        onChange={(e) => setFormData({...formData, delivery_charge: e.target.value})}
                                        className="w-24 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-right text-sm text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-emerald-400">
                                    <label className="text-sm">Discount</label>
                                    <input 
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({...formData, discount: e.target.value})}
                                        className="w-24 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-right text-sm text-emerald-400 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-slate-400">Tax</label>
                                    <input 
                                        type="number"
                                        value={formData.tax}
                                        onChange={(e) => setFormData({...formData, tax: e.target.value})}
                                        className="w-24 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-right text-sm text-slate-200"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-4">
                                <span className="text-lg font-bold text-white">Grand Total</span>
                                <span className="text-2xl font-black text-blue-400">{symbol}{Number(grandTotal).toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || orderItems.length === 0}
                                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Create Order</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddOrder;
