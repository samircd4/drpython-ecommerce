import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { User, Bell, Shield, Palette, Save, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';


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



    const handleSave = async () => {
        setLoading(true);
        try {
            if (activeTab === 'profile') {
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
