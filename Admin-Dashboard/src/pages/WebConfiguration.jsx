import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Globe, Camera, Save, Loader2, Layout, Image, Share2, CreditCard } from 'lucide-react';
import { useStoreConfig } from '../hooks/useStoreConfig';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../Context/AuthContext';

const CURRENCY_OPTIONS = [
    { value: 'BDT', symbol: '৳', label: 'Bangladeshi Taka (BDT) - ৳' },
    { value: 'USD', symbol: '$', label: 'US Dollar (USD) - $' },
    { value: 'EUR', symbol: '€', label: 'Euro (EUR) - €' },
    { value: 'GBP', symbol: '£', label: 'British Pound (GBP) - £' },
    { value: 'AED', symbol: 'د.إ', label: 'UAE Dirham (AED) - د.إ' },
    { value: 'SAR', symbol: '﷼', label: 'Saudi Riyal (SAR) - ﷼' },
    { value: 'INR', symbol: '₹', label: 'Indian Rupee (INR) - ₹' },
    { value: 'PKR', symbol: '₨', label: 'Pakistani Rupee (PKR) - ₨' },
];

const TIMEZONE_OPTIONS = [
    { value: 'Asia/Dhaka', label: 'Asia/Dhaka (UTC+6)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
    { value: 'Asia/Karachi', label: 'Asia/Karachi (UTC+5)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0/1)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
];

const WebConfiguration = () => {
    const { hasPermission } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const { config: globalStoreConfig, updateConfigLocal, clearCache } = useStoreConfig();

    const [configFormData, setConfigFormData] = useState({
        website_name: '',
        currency: 'BDT',
        currency_symbol: '৳',
        timezone: 'Asia/Dhaka',
        contact_email: '',
        support_phone: '',
        location: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        youtube_url: '',
        whatsapp_url: '',
        telegram_url: '',
        tiktok_url: '',
        messenger_url: '',
        dashboard_logo: null,
        logo_dark: null,
        logo_light: null,
        favicon: null,
        show_website_name: false,
        // Payment Settings
        is_cod_enabled: true,
        is_online_payment_enabled: false,
        bkash_number: '',
        nagad_number: '',
        rocket_number: '',
    });

    const [dashboardLogoPreview, setDashboardLogoPreview] = useState(null);
    const dashboardLogoInputRef = useRef(null);
    const [logoDarkPreview, setLogoDarkPreview] = useState(null);
    const logoDarkInputRef = useRef(null);
    const [logoLightPreview, setLogoLightPreview] = useState(null);
    const logoLightInputRef = useRef(null);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const faviconInputRef = useRef(null);

    useEffect(() => {
        if (globalStoreConfig) {
            setConfigFormData({
                website_name: globalStoreConfig.website_name || '',
                currency: globalStoreConfig.currency || 'BDT',
                currency_symbol: globalStoreConfig.currency_symbol || '৳',
                timezone: globalStoreConfig.timezone || 'Asia/Dhaka',
                contact_email: globalStoreConfig.contact_email || '',
                support_phone: globalStoreConfig.support_phone || '',
                location: globalStoreConfig.location || '',
                facebook_url: globalStoreConfig.facebook_url || '',
                instagram_url: globalStoreConfig.instagram_url || '',
                twitter_url: globalStoreConfig.twitter_url || '',
                linkedin_url: globalStoreConfig.linkedin_url || '',
                youtube_url: globalStoreConfig.youtube_url || '',
                whatsapp_url: globalStoreConfig.whatsapp_url || '',
                telegram_url: globalStoreConfig.telegram_url || '',
                tiktok_url: globalStoreConfig.tiktok_url || '',
                messenger_url: globalStoreConfig.messenger_url || '',
                dashboard_logo: null,
                logo_dark: null,
                logo_light: null,
                favicon: null,
                show_website_name: globalStoreConfig.show_website_name || false,
                // Payment settings
                is_cod_enabled: globalStoreConfig.is_cod_enabled ?? true,
                is_online_payment_enabled: globalStoreConfig.is_online_payment_enabled ?? false,
                bkash_number: globalStoreConfig.bkash_number || '',
                nagad_number: globalStoreConfig.nagad_number || '',
                rocket_number: globalStoreConfig.rocket_number || '',
            });
            if (globalStoreConfig.dashboard_logo) setDashboardLogoPreview(globalStoreConfig.dashboard_logo);
            if (globalStoreConfig.logo_dark) setLogoDarkPreview(globalStoreConfig.logo_dark);
            if (globalStoreConfig.logo_light) setLogoLightPreview(globalStoreConfig.logo_light);
            if (globalStoreConfig.favicon) setFaviconPreview(globalStoreConfig.favicon);
        }
    }, [globalStoreConfig]);

    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (name === 'currency') {
            const selectedOpt = CURRENCY_OPTIONS.find(opt => opt.value === value);
            setConfigFormData(prev => ({
                ...prev,
                [name]: value,
                currency_symbol: selectedOpt ? selectedOpt.symbol : prev.currency_symbol
            }));
        } else {
            setConfigFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setConfigFormData(prev => ({ ...prev, [field]: file }));
            const previewUrl = URL.createObjectURL(file);
            if (field === 'dashboard_logo') setDashboardLogoPreview(previewUrl);
            if (field === 'logo_dark') setLogoDarkPreview(previewUrl);
            if (field === 'logo_light') setLogoLightPreview(previewUrl);
            if (field === 'favicon') setFaviconPreview(previewUrl);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            // Append all fields, handle booleans specifically for FormData
            Object.keys(configFormData).forEach(key => {
                if (!['dashboard_logo', 'logo_dark', 'logo_light', 'favicon'].includes(key)) {
                    // Normalize boolean to string for FormData if needed, but standard Django handles 'true'/'false'
                    data.append(key, configFormData[key]);
                }
            });

            // Append files if they exist
            if (configFormData.dashboard_logo) data.append('dashboard_logo', configFormData.dashboard_logo);
            if (configFormData.logo_dark) data.append('logo_dark', configFormData.logo_dark);
            if (configFormData.logo_light) data.append('logo_light', configFormData.logo_light);
            if (configFormData.favicon) data.append('favicon', configFormData.favicon);

            const res = await api.patch('/configuration/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Configuration updated successfully!');

            updateConfigLocal(res.data);

            // Broadcast config update to other tabs via localStorage
            try {
                localStorage.setItem('storeConfigUpdated', JSON.stringify({
                    timestamp: Date.now(),
                    currency: res.data.currency,
                    website_name: res.data.website_name
                }));
            } catch (e) { }

            { id: 'social', name: 'Social Media', icon: Share2 },
            { id: 'payment', name: 'Payment Settings', icon: CreditCard },
    ];

return (
    <div className="min-h-screen p-0 sm:px-6 sm:py-4" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
        <Breadcrumb
            title="Web Configuration"
            paths={[
                { label: "Home", path: "/" },
                { label: "Configuration", path: "/web-config" }
            ]}
        />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-64 flex flex-col gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-[#071229] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#071229] border border-slate-800 rounded-2xl p-6 shadow-xl">
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">General Store Details</h3>
                            <p className="text-sm text-slate-500">Configure your basic store identity and regional settings.</p>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Website Name</label>
                                <input
                                    type="text" name="website_name" value={configFormData.website_name} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                                <div className="flex items-center gap-3 mt-3 ml-1 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <input
                                        type="checkbox" name="show_website_name"
                                        id="show_web_name"
                                        checked={configFormData.show_website_name}
                                        onChange={handleConfigChange}
                                        className="w-4 h-4 accent-blue-600 rounded"
                                    />
                                    <label htmlFor="show_web_name" className="text-xs font-bold text-slate-400 cursor-pointer">
                                        Show Brand Name in Store Header
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Base Currency</label>
                                <select
                                    name="currency" value={configFormData.currency} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                >
                                    {CURRENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Store Timezone</label>
                                <select
                                    name="timezone" value={configFormData.timezone} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                >
                                    {TIMEZONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Contact Email</label>
                                <input
                                    type="email" name="contact_email" value={configFormData.contact_email} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Support Phone</label>
                                <input
                                    type="text" name="support_phone" value={configFormData.support_phone} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Shop Address / Location</label>
                                <textarea
                                    name="location" rows="3" value={configFormData.location} onChange={handleConfigChange}
                                    className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                />
                                <p className="text-[10px] text-slate-500 italic ml-1">This address will be used for the contact page and maps.</p>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Branding Assets</h3>
                            <p className="text-sm text-slate-500">Manage your store logos and browser favicon.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            {/* Dashboard Logo */}
                            <div className="flex items-center gap-4 group">
                                <div className="relative w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                                    {dashboardLogoPreview ? (
                                        <img src={dashboardLogoPreview} alt="Dashboard Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-slate-700 text-[10px] font-black">LOGO</div>
                                    )}
                                    <input type="file" ref={dashboardLogoInputRef} onChange={(e) => handleFileUpload(e, 'dashboard_logo')} className="hidden" accept="image/*" />
                                    <button
                                        onClick={() => dashboardLogoInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                    >
                                        <Camera className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] uppercase">Upload</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">Dashboard Logo</div>
                                    <div className="text-xs text-slate-500 italic block mt-1">For light bg (Rec: 512x512px)</div>
                                    <div className="text-[10px] text-slate-600">Max size: 2MB, formats: PNG/SVG</div>
                                </div>
                            </div>

                            {/* Light Logo */}
                            <div className="flex items-center gap-4 group">
                                <div className="relative w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {logoLightPreview ? (
                                        <img src={logoLightPreview} alt="Light Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-slate-700 text-[10px] font-black text-center leading-tight">SITE<br />LIGHT</div>
                                    )}
                                    <input type="file" ref={logoLightInputRef} onChange={(e) => handleFileUpload(e, 'logo_light')} className="hidden" accept="image/*" />
                                    <button
                                        onClick={() => logoLightInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                    >
                                        <Camera className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] uppercase">Upload</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">Footer Logo (Light)</div>
                                    <div className="text-xs text-slate-500 italic block mt-1">Footer brand (Rec: 200x60px)</div>
                                    <div className="text-[10px] text-slate-600">Max size: 2MB, transparent PNG/SVG</div>
                                </div>
                            </div>

                            {/* Dark Logo */}
                            <div className="flex items-center gap-4 group">
                                <div className="relative w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {logoDarkPreview ? (
                                        <img src={logoDarkPreview} alt="Dark Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-slate-700 text-[10px] font-black text-center leading-tight">SITE<br />DARK</div>
                                    )}
                                    <input type="file" ref={logoDarkInputRef} onChange={(e) => handleFileUpload(e, 'logo_dark')} className="hidden" accept="image/*" />
                                    <button
                                        onClick={() => logoDarkInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                    >
                                        <Camera className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] uppercase">Upload</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">Header Logo (Dark)</div>
                                    <div className="text-xs text-slate-500 italic block mt-1">Header brand (Rec: 200x60px)</div>
                                    <div className="text-[10px] text-slate-600">Max size: 2MB, transparent PNG/SVG</div>
                                </div>
                            </div>

                            {/* Favicon */}
                            <div className="flex items-center gap-4 group">
                                <div className="relative w-16 h-16 bg-[#0b1a2a] border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {faviconPreview ? (
                                        <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-slate-700 text-[10px] font-black">ICON</span>
                                    )}
                                    <input type="file" ref={faviconInputRef} onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" accept="image/*" />
                                    <button
                                        onClick={() => faviconInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                    >
                                        <Camera className="w-4 h-4 mb-1" />
                                        <span className="text-[9px] uppercase">Upload</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">Store Favicon</div>
                                    <div className="text-xs text-slate-500 italic block mt-1">Browser icon (Rec: 64x64px)</div>
                                    <div className="text-[10px] text-slate-600">Max size: 1MB, format: ICO/PNG</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Social Media Links</h3>
                            <p className="text-sm text-slate-500">Enable customers to connect with you across platforms.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Facebook URL', name: 'facebook_url', type: 'url', placeholder: 'https://facebook.com/shopsarker' },
                                { label: 'Messenger URL', name: 'messenger_url', type: 'url', placeholder: 'https://m.me/shopsarker' },
                                { label: 'WhatsApp Number/URL', name: 'whatsapp_url', type: 'text', placeholder: 'https://wa.me/+8801781355377' },
                                { label: 'Instagram URL', name: 'instagram_url', type: 'url', placeholder: 'https://www.instagram.com/sarkershop' },
                                { label: 'Twitter URL', name: 'twitter_url', type: 'url', placeholder: 'https://twitter.com/sarkershop' },
                                { label: 'LinkedIn URL', name: 'linkedin_url', type: 'url', placeholder: 'https://linkedin.com/company/sarkershop/' },
                                { label: 'YouTube URL', name: 'youtube_url', type: 'url', placeholder: 'https://youtube.com/@sarkershop' },
                                { label: 'TikTok URL', name: 'tiktok_url', type: 'url', placeholder: 'https://tiktok.com/@sarkershop' },
                            ].map(field => (
                                <div key={field.name} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-1">{field.label}</label>
                                    <input
                                        type={field.type} name={field.name} value={configFormData[field.name]} onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Payment Method Settings</h3>
                            <p className="text-sm text-slate-500">Configure how your customers can pay for their orders.</p>
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0b1a2a] rounded-2xl border border-slate-700/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-tight">Direct Payments</div>
                                        <div className="text-[10px] text-slate-500">Enable Stripe Gateway</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfigFormData(prev => ({ ...prev, is_online_payment_enabled: !prev.is_online_payment_enabled }))}
                                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${configFormData.is_online_payment_enabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${configFormData.is_online_payment_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="p-4 bg-[#0b1a2a] rounded-2xl border border-slate-700/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase tracking-tight">Manual Payments</div>
                                        <div className="text-[10px] text-slate-500">Enable Cash on Delivery</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfigFormData(prev => ({ ...prev, is_cod_enabled: !prev.is_cod_enabled }))}
                                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${configFormData.is_cod_enabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${configFormData.is_cod_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Banking Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Banking (MFS)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">BKash Number</label>
                                    <input
                                        type="text" name="bkash_number" value={configFormData.bkash_number} onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-pink-500/50 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="01781355377"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Nagad Number</label>
                                    <input
                                        type="text" name="nagad_number" value={configFormData.nagad_number} onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="01781355377"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Rocket Number</label>
                                    <input
                                        type="text" name="rocket_number" value={configFormData.rocket_number} onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="01781355377"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Common Bottom Action */}
                {hasPermission('web.change_storeconfiguration') && (
                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${loading
                                ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 cursor-pointer'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default WebConfiguration;
