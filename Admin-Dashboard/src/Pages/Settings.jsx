import React, { useState } from 'react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id
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
                                        src="https://i.pravatar.cc/150?u=current-user"
                                        alt="Current User"
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-800"
                                    />
                                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        Change
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Samir Ahmed</h3>
                                    <p className="text-slate-400">Super Admin • Dhaka, Bangladesh</p>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                                    <input type="text" defaultValue="Samir Ahmed" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                                    <input type="email" defaultValue="samir@example.com" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Role</label>
                                    <input type="text" readOnly defaultValue="Super Admin" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
                                    <input type="text" defaultValue="+880 1700 000000" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Bio</label>
                                    <textarea rows="4" className="w-full bg-[#0b1a2a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
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
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
