import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { User, Bell, Shield, Palette, Save, Camera, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useStoreConfig } from '../hooks/useStoreConfig';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const CURRENCY_OPTIONS = [
    { value: 'BDT', label: 'Bangladeshi Taka (BDT)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
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

const Settings = () => {
    const { user, fetchUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

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
        show_website_name: false
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const logoInputRef = useRef(null);
    const [dashboardLogoPreview, setDashboardLogoPreview] = useState(null);
    const dashboardLogoInputRef = useRef(null);
    const [logoDarkPreview, setLogoDarkPreview] = useState(null);
    const logoDarkInputRef = useRef(null);
    const [logoLightPreview, setLogoLightPreview] = useState(null);
    const logoLightInputRef = useRef(null);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const faviconInputRef = useRef(null);

    const { config: globalStoreConfig, updateConfigLocal } = useStoreConfig();

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
                show_website_name: globalStoreConfig.show_website_name || false
            });
            if (globalStoreConfig.dashboard_logo) setDashboardLogoPreview(globalStoreConfig.dashboard_logo);
            if (globalStoreConfig.logo_dark) setLogoDarkPreview(globalStoreConfig.logo_dark);
            if (globalStoreConfig.logo_light) setLogoLightPreview(globalStoreConfig.logo_light);
            if (globalStoreConfig.favicon) setFaviconPreview(globalStoreConfig.favicon);
        }
    }, [globalStoreConfig]);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                avatar: null
            });
            setAvatarPreview(user.avatar || user.social_avatar_url);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfigFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleDashboardLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConfigFormData(prev => ({ ...prev, dashboard_logo: file }));
            setDashboardLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoDarkChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConfigFormData(prev => ({ ...prev, logo_dark: file }));
            setLogoDarkPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoLightChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConfigFormData(prev => ({ ...prev, logo_light: file }));
            setLogoLightPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setConfigFormData(prev => ({ ...prev, favicon: file }));
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (activeTab === 'configuration') {
                const data = new FormData();
                data.append('website_name', configFormData.website_name);
                data.append('currency', configFormData.currency);
                data.append('currency_symbol', configFormData.currency_symbol);
                data.append('timezone', configFormData.timezone);
                data.append('contact_email', configFormData.contact_email);
                data.append('support_phone', configFormData.support_phone);
                data.append('location', configFormData.location);
                data.append('facebook_url', configFormData.facebook_url);
                data.append('instagram_url', configFormData.instagram_url);
                data.append('twitter_url', configFormData.twitter_url);
                data.append('linkedin_url', configFormData.linkedin_url);
                data.append('youtube_url', configFormData.youtube_url);
                data.append('whatsapp_url', configFormData.whatsapp_url);
                data.append('telegram_url', configFormData.telegram_url);
                data.append('tiktok_url', configFormData.tiktok_url);
                data.append('messenger_url', configFormData.messenger_url);
                data.append('show_website_name', configFormData.show_website_name);
                
                if (configFormData.dashboard_logo) {
                    data.append('dashboard_logo', configFormData.dashboard_logo);
                }
                if (configFormData.logo_dark) {
                    data.append('logo_dark', configFormData.logo_dark);
                }
                if (configFormData.logo_light) {
                    data.append('logo_light', configFormData.logo_light);
                }
                if (configFormData.favicon) {
                    data.append('favicon', configFormData.favicon);
                }

                const res = await api.patch('/configuration/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Configuration updated successfully!');
                
                // Update global config and document instantly
                updateConfigLocal(res.data);
                if (res.data.website_name) {
                    document.title = `${res.data.website_name} - Admin Dashboard`;
                }
                if (res.data.favicon) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = res.data.favicon;
                }
            } else if (activeTab === 'profile') {
                const data = new FormData();
                data.append('first_name', formData.first_name);
                data.append('last_name', formData.last_name);
                data.append('email', formData.email);
                data.append('phone_number', formData.phone_number);
                
                if (formData.avatar) {
                    data.append('avatar', formData.avatar);
                }

                await api.patch('/customers/me/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                await fetchUserProfile(); // Refresh global user state
                toast.success('Profile updated successfully!');
            } else {
                toast.success('Settings updated gracefully.');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : 'Failed to update profile';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile Information', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Password & Security', icon: Shield },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'configuration', name: 'Configuration', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen p-0 sm:px-6 sm:py-4" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <Breadcrumb title="Settings" paths={["Home", "Dashboard", "Settings"]} />

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
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
                                <div className="relative group">
                                    <img
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0D8ABC&color=fff`}
                                        alt="Current User"
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-800"
                                    />
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleAvatarChange} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 cursor-pointer"
                                    >
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{user?.name || 'Admin User'}</h3>
                                    <p className="text-slate-400">
                                        {user?.is_superuser ? 'Super Admin' : (user?.is_staff ? 'Staff Member' : 'Member')} 
                                        {user?.address ? ` • ${user.address}` : ''}
                                    </p>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">First Name</label>
                                    <input 
                                        type="text" 
                                        name="first_name"
                                        value={formData.first_name} 
                                        onChange={handleChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        name="last_name"
                                        value={formData.last_name} 
                                        onChange={handleChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        name="phone"
                                        value={formData.phone} 
                                        onChange={handleChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Role</label>
                                    <input type="text" readOnly value={user?.is_superuser ? 'Super Admin' : (user?.is_staff ? 'Staff Member' : 'Admin')} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed italic" />
                                </div>
                                <div className="md:col-span-1 space-y-2 invisible h-0">
                                    {/* Spacer/Empty for grid alignment */}
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-slate-300">
                            <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                {['Email Notifications', 'Browser Notifications', 'Sales Alerts', 'System Updates'].map((notif) => (
                                    <div key={notif} className="flex items-center justify-between p-4 bg-[#0b1a2a] rounded-xl border border-slate-700">
                                        <span className="font-medium">{notif}</span>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                            <form className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-slate-300">
                            <h3 className="text-lg font-bold text-white mb-4">Dashboard Appearance</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border-2 border-blue-600 bg-[#071229] relative overflow-hidden">
                                    <div className="text-sm font-bold text-white mb-2 italic">Standard Dark (Active)</div>
                                    <div className="w-full h-20 bg-gradient-to-br from-blue-900/40 to-black rounded-lg" />
                                </div>
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed">
                                    <div className="text-sm font-bold text-slate-500 mb-2">Ocean Deep (Locked)</div>
                                    <div className="w-full h-20 bg-gradient-to-br from-cyan-900/40 to-black rounded-lg" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'configuration' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-white mb-4">Global Store Configuration</h3>
                            
                            <div className="flex flex-wrap items-center gap-8 py-4 border-b border-slate-800/50 mb-6">
                                {/* General Logo Block */}

                                {/* Dashboard Logo Block */}
                                <div className="flex items-center gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-800">
                                    <div className="relative group w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
                                        {dashboardLogoPreview ? (
                                            <img src={dashboardLogoPreview} alt="Dashboard Logo Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-slate-700 text-[10px] font-bold text-center">ADMIN<br/>LOGO</div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={dashboardLogoInputRef} 
                                            onChange={handleDashboardLogoChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => dashboardLogoInputRef.current.click()}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                        >
                                            <Camera className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] uppercase tracking-wider">Upload</span>
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        Dashboard Logo<br/>
                                        <span className="text-xs text-slate-500 italic">Header brand</span>
                                    </div>
                                </div>

                                {/* Light Logo Block */}
                                <div className="flex items-center gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-800">
                                    <div className="relative group w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
                                        {logoLightPreview ? (
                                            <img src={logoLightPreview} alt="Light Logo Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-slate-700 text-[10px] font-bold text-center">LIGHT<br/>THEME</div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={logoLightInputRef} 
                                            onChange={handleLogoLightChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => logoLightInputRef.current.click()}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                        >
                                            <Camera className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] uppercase tracking-wider">Upload</span>
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        Website Logo (Light)<br/>
                                        <span className="text-xs text-slate-500 italic">For light bg</span>
                                    </div>
                                </div>

                                {/* Dark Logo Block */}
                                <div className="flex items-center gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-800">
                                    <div className="relative group w-20 h-20 bg-[#0b1a2a] border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
                                        {logoDarkPreview ? (
                                            <img src={logoDarkPreview} alt="Dark Logo Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-slate-700 text-[10px] font-bold text-center">DARK<br/>THEME</div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={logoDarkInputRef} 
                                            onChange={handleLogoDarkChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => logoDarkInputRef.current.click()}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                        >
                                            <Camera className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] uppercase tracking-wider">Upload</span>
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        Website Logo (Dark)<br/>
                                        <span className="text-xs text-slate-500 italic">For dark bg</span>
                                    </div>
                                </div>

                                {/* Favicon Block */}
                                <div className="flex items-center gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-800">
                                    <div className="relative group w-16 h-16 bg-[#0b1a2a] border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
                                        {faviconPreview ? (
                                            <img src={faviconPreview} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span className="text-slate-500 text-xs text-center leading-tight">No<br/>Favicon</span>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={faviconInputRef} 
                                            onChange={handleFaviconChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => faviconInputRef.current.click()}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all font-bold cursor-pointer"
                                        >
                                            <Camera className="w-4 h-4 mb-1" />
                                            <span className="text-[9px] uppercase tracking-wider">Upload</span>
                                        </button>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        Favicon<br/>
                                        <span className="text-xs text-slate-500 italic">Browser icon</span>
                                    </div>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Website Name</label>
                                    <input 
                                        type="text" 
                                        name="website_name"
                                        value={configFormData.website_name} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all" 
                                    />
                                    <div className="flex items-center gap-3 mt-3 ml-1 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                        <input
                                            type="checkbox"
                                            name="show_website_name"
                                            checked={configFormData.show_website_name}
                                            onChange={(e) => setConfigFormData({ ...configFormData, show_website_name: e.target.checked })}
                                            className="w-4 h-4 accent-blue-600 rounded"
                                        />
                                        <label className="text-xs font-bold text-slate-400 cursor-pointer">
                                            Show Brand Name in Store Header
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Base Currency</label>
                                    <select 
                                        name="currency"
                                        value={configFormData.currency} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none" 
                                    >
                                        {CURRENCY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Currency Symbol</label>
                                    <input 
                                        type="text" 
                                        name="currency_symbol"
                                        value={configFormData.currency_symbol} 
                                        onChange={handleConfigChange}
                                        placeholder="e.g. $, ৳"
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Store Timezone</label>
                                    <select 
                                        name="timezone"
                                        value={configFormData.timezone} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none" 
                                    >
                                        {TIMEZONE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Contact Email</label>
                                    <input 
                                        type="email" 
                                        name="contact_email"
                                        value={configFormData.contact_email} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Support Phone</label>
                                    <input 
                                        type="text" 
                                        name="support_phone"
                                        value={configFormData.support_phone} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Shop Address / Location</label>
                                    <textarea 
                                        name="location"
                                        rows="3"
                                        value={configFormData.location} 
                                        onChange={handleConfigChange}
                                        className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all resize-none" 
                                    />
                                    <p className="text-[10px] text-slate-500 italic ml-1">This address will be used for the Google Maps iframe on the contact page.</p>
                                </div>

                                <div className="md:col-span-2 pt-4 border-t border-slate-800/50 mt-2">
                                    <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Social Media & Messaging</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">Facebook URL</label>
                                            <input 
                                                type="url" name="facebook_url" value={configFormData.facebook_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">Messenger URL</label>
                                            <input 
                                                type="url" name="messenger_url" value={configFormData.messenger_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">WhatsApp URL / Number</label>
                                            <input 
                                                type="text" name="whatsapp_url" value={configFormData.whatsapp_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">Instagram URL</label>
                                            <input 
                                                type="url" name="instagram_url" value={configFormData.instagram_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">Twitter URL</label>
                                            <input 
                                                type="url" name="twitter_url" value={configFormData.twitter_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">LinkedIn URL</label>
                                            <input 
                                                type="url" name="linkedin_url" value={configFormData.linkedin_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">YouTube URL</label>
                                            <input 
                                                type="url" name="youtube_url" value={configFormData.youtube_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">TikTok URL</label>
                                            <input 
                                                type="url" name="tiktok_url" value={configFormData.tiktok_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-500 ml-1">Telegram URL</label>
                                            <input 
                                                type="url" name="telegram_url" value={configFormData.telegram_url} onChange={handleConfigChange}
                                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Common Bottom Action */}
                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                                loading 
                                ? 'bg-blue-600/50 text-white/50 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 cursor-pointer'
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
