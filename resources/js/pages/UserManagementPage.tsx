import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, ShieldAlert, UserCheck } from 'lucide-react';
import api from '../utils/api';

interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    total_points: number;
    status?: string; // Add if API supports it
    created_at: string;
}

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users'); 
            // Handle Laravel resource structure (response.data.data) or direct array (response.data)
            const userData = response.data.data || response.data;
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback for demo if API fails
            setUsers([
                { id: 1, name: 'John Doe', email: 'john@example.com', phone_number: '081234567890', total_points: 500, created_at: '2023-11-13' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone_number: '081234567891', total_points: 1200, created_at: '2023-11-14' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
                <span className="ml-3 text-gray-500">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">Manage participants of the SmartBin ecosystem</p>
                </div>
                <div className="text-sm text-gray-500">
                    Home / <span className="text-gray-800">Users</span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, or phone..." 
                                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary outline-none w-full md:w-80"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-admin-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                            Export Users
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Details</th>
                                <th className="px-6 py-4 font-semibold">Contact Info</th>
                                <th className="px-6 py-4 font-semibold">Point Balance</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Joined Date</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(users || []).filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500">ID: {user.id.toString().padStart(5, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="space-y-1">
                                            <p className="text-xs">{user.email}</p>
                                            <p className="text-xs font-mono">{user.phone_number}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="p-1 rounded bg-yellow-100 text-yellow-700">
                                                <ShieldAlert size={14} />
                                            </div>
                                            <span className="font-bold text-gray-800">{user.total_points.toLocaleString()} pts</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <UserCheck size={12} />
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button title="Edit User" className="p-1.5 text-gray-400 hover:text-admin-primary hover:bg-admin-primary/5 rounded">
                                                <Edit size={16} />
                                            </button>
                                            <button title="Delete User" className="p-1.5 text-gray-400 hover:text-admin-danger hover:bg-admin-danger/5 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Showing 1 to {users.length} of {users.length} entries</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 bg-admin-primary text-white rounded text-xs">1</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
