import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const ProfileSettings = ({
    user,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    profilePhone,
    setProfilePhone,
    profileImagePreview,
    onProfileImageChange,
    onProfileSave,
    savingProfile,
}) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setChangingPassword(true);
        try {
            await api.put('/auth/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            toast.success("Password changed successfully.");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.old_password?.[0] || error.response?.data?.message || "Failed to change password.");
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Information Section */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                                    {profileImagePreview ? (
                                        <img src={profileImagePreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl font-bold text-gray-400">
                                            {profileName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 cursor-pointer shadow-md transition-transform hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    <input type="file" accept="image/*" className="hidden" onChange={onProfileImageChange} />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500">Allowed *.jpeg, *.jpg, *.png, *.gif</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Email Address
                                    {user.is_email_verified ? (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Unverified
                                        </span>
                                    )}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        disabled // Email usually shouldn't be changeable directly here without re-verification logic
                                    />
                                    {!user.is_email_verified && (
                                        <button
                                            onClick={async () => {
                                                setIsResending(true);
                                                try {
                                                    const res = await api.post('/auth/resend-verification-email/', { email: user.email });
                                                    toast.success(res.data.message || "Verification email sent!");
                                                } catch (error) {
                                                    toast.error(error.response?.data?.message || "Failed to send email.");
                                                } finally {
                                                    setIsResending(false);
                                                }
                                            }}
                                            disabled={isResending}
                                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                            title="Resend Verification Email"
                                        >
                                            {isResending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Resend Link'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50"
                                    value={profilePhone}
                                    onChange={(e) => setProfilePhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-2.5 text-gray-500 cursor-not-allowed"
                                    value={user.username || ''}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex items-center gap-3">
                            <button
                                onClick={onProfileSave}
                                disabled={savingProfile}
                                className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all ${savingProfile
                                    ? 'bg-purple-400 cursor-wait'
                                    : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'}`}
                            >
                                {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Change Password
                </h2>
                <div className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50 pr-10"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5 bg-gray-50"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handlePasswordChange}
                            disabled={changingPassword}
                            className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all ${changingPassword
                                ? 'bg-gray-800 cursor-wait'
                                : 'bg-gray-900 hover:bg-gray-800 hover:shadow-lg'}`}
                        >
                            {changingPassword ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;

