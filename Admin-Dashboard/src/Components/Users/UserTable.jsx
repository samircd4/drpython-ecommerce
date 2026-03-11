import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const UserTable = ({ users = [] }) => {
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
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 italic">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-semibold">
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.status === 'Active'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">{user.lastActive}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                    <button title="View" className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button title="Edit" className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button title="Delete" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
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
