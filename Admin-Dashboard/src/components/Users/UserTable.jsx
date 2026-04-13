import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const UserTable = ({ users = [], loading = false }) => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white bg-[#0b3a61]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">UID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Photo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Last Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {loading ? (
                        <tr><td colSpan="8" className="text-center py-10 text-slate-400">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="8" className="text-center py-10 text-slate-400">No users found.</td></tr>
                    ) : users.map((user) => (
                        <tr 
                            key={user.id} 
                            onClick={() => navigate(`/users/view/${user.id}`)}
                            className="group hover:bg-slate-800/80 transition-all cursor-pointer border-b border-slate-800 last:border-0"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium">U-{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.username)}&background=random`}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">{user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm italic">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.is_superuser ? (
                                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md text-[10px] font-black uppercase tracking-tighter">Superuser</span>
                                ) : user.is_staff ? (
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-black uppercase tracking-tighter">Staff</span>
                                ) : user.customer_type === 'wholesale' ? (
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-[10px] font-black uppercase tracking-tighter">Wholesaler</span>
                                ) : (
                                    <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-md text-[10px] font-black uppercase tracking-tighter">Customer</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${user.is_active
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => hasPermission('auth.change_user') && navigate(`/users/edit/${user.id}`)} 
                                        title="Edit" 
                                        disabled={!hasPermission('auth.change_user')}
                                        className={`p-2 rounded-xl transition-all shadow-lg ${
                                            hasPermission('auth.change_user') 
                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white cursor-pointer shadow-emerald-500/0 hover:shadow-emerald-500/20' 
                                                : 'bg-emerald-500/5 text-emerald-400/30 cursor-not-allowed hidden'
                                        }`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button 
                                        title="Delete" 
                                        disabled={true} 
                                        className="p-2 bg-red-500/10 text-red-500/30 rounded-xl cursor-not-allowed border border-red-500/5"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
