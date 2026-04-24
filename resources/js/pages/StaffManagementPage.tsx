import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserCog, Mail, Key, Trash2, Edit2, BadgeCheck } from 'lucide-react';
import api from '../utils/api';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'operator' | 'finance';
    created_at: string;
}

const StaffManagementPage: React.FC = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);

    useEffect(() => {
        // Fallback data
        setStaffList([
            { id: 1, name: 'System Admin', email: 'admin@smartbin.example', role: 'admin', created_at: '2023-01-01' },
            { id: 2, name: 'Budi Operation', email: 'budi@smartbin.example', role: 'operator', created_at: '2023-11-15' },
            { id: 3, name: 'Ani Finance', email: 'ani@smartbin.example', role: 'finance', created_at: '2023-11-16' },
        ]);
    }, []);

    const getRoleBadge = (role: string) => {
        const styles = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200',
            operator: 'bg-blue-100 text-blue-700 border-blue-200',
            finance: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${styles[role as keyof typeof styles]}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Staff & Administration</h1>
                    <p className="text-sm text-gray-500">Manage internal team members and their system access</p>
                </div>
                <button className="flex items-center gap-2 bg-admin-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all font-medium text-sm">
                    <UserPlus size={18} />
                    Add Team Member
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff List Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <Shield size={18} className="text-admin-primary" />
                            <h3 className="font-semibold text-gray-700">Internal Team</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Name & Role</th>
                                        <th className="px-6 py-4">Email Address</th>
                                        <th className="px-6 py-4">Joined Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {staffList.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <UserCog size={18} className="text-gray-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                            {staff.name}
                                                            {staff.role === 'admin' && <BadgeCheck size={14} className="text-admin-primary" />}
                                                        </span>
                                                        <div className="mt-1">{getRoleBadge(staff.role)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-400" />
                                                    <span className="text-xs">{staff.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(staff.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-2 text-gray-400 hover:text-admin-primary rounded transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-admin-danger rounded transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Role Permissions Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Key size={18} className="text-admin-warning" />
                            Role Access Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <h4 className="text-xs font-bold text-purple-700 uppercase mb-1">Administrator</h4>
                                <p className="text-[10px] text-purple-600">Full system access including staff management, finances, and global settings.</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-700 uppercase mb-1">Operator</h4>
                                <p className="text-[10px] text-blue-600">Manage Smart Bin locations, monitor IoT status, and view user details.</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <h4 className="text-xs font-bold text-orange-700 uppercase mb-1">Finance</h4>
                                <p className="text-[10px] text-orange-600">Manage point redemptions, e-money payouts, and financial reports.</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Configure Custom Roles
                        </button>
                    </div>

                    <div className="bg-admin-dark rounded-xl shadow-lg p-5 text-white overflow-hidden relative">
                        <Shield size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                        <h3 className="font-bold text-lg mb-2 relative z-10">Security Policy</h3>
                        <p className="text-xs text-gray-400 mb-4 relative z-10 leading-relaxed">
                            Team members must use strong passwords. PIN requests from Smart Bins are logged for forensic analysis.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-admin-success bg-white/5 self-start px-2 py-1 rounded relative z-10">
                            <span className="w-1.5 h-1.5 bg-admin-success rounded-full animate-pulse"></span>
                            2FA ACTIVE GLOBALLY
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManagementPage;
