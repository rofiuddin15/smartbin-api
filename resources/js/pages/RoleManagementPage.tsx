import React, { useState, useEffect, useMemo } from 'react';
import { 
    createColumnHelper, 
    flexRender, 
    getCoreRowModel, 
    useReactTable,
} from '@tanstack/react-table';
import { 
    Shield, Key, Lock, Edit2, Trash2, Plus, Save, X, 
    ChevronUp, ChevronDown, CheckCircle, ShieldAlert,
    ShieldCheck, Settings, Users
} from 'lucide-react';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles');
            setRoles(response.data.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/roles/permissions');
            setPermissions(response.data.data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleOpenModal = (role: Role | null = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, formData);
            } else {
                await api.post('/roles', formData);
            }
            setIsModalOpen(false);
            fetchRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            alert('Gagal menyimpan Role. Pastikan nama Role belum digunakan.');
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus Role ini? Hal ini dapat mempengaruhi akses staff.')) return;
        try {
            await api.delete(`/roles/${id}`);
            fetchRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Tidak dapat menghapus Role sistem yang dilindungi.');
        }
    };

    const togglePermission = (permName: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permName)
                ? prev.permissions.filter(p => p !== permName)
                : [...prev.permissions, permName]
        }));
    };

    const columnHelper = createColumnHelper<Role>();
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nama Role',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                        <Shield size={16} className="text-gray-400" />
                    </div>
                    <span className="font-black text-gray-800 text-[11px] uppercase tracking-tight">{info.getValue()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('users_count', {
            header: 'Anggota',
            cell: info => (
                <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{info.getValue()} Staff</span>
                </div>
            ),
        }),
        columnHelper.accessor('permissions', {
            header: 'Jumlah Wewenang',
            cell: info => (
                <span className="text-[10px] font-black text-admin-primary bg-admin-primary/5 px-2 py-0.5 rounded border border-admin-primary/10 uppercase tracking-widest">
                    {info.getValue().length} Hak Akses
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleOpenModal(info.row.original)} className="p-1.5 text-gray-400 hover:text-admin-primary hover:bg-gray-50 rounded transition-all"><Edit2 size={14} /></button>
                    {!['admin', 'user', 'operator'].includes(info.row.original.name) && (
                        <button onClick={() => handleDeleteRole(info.row.original.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={14} /></button>
                    )}
                </div>
            ),
        }),
    ], []);

    const table = useReactTable({
        data: roles,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">Kontrol Akses (RBAC)</h1>
                    <p className="text-xs text-gray-500">Definisikan peran sistem dan wewenang spesifik setiap staff</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest">
                    <Plus size={16} />
                    Buat Role Baru
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-3">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Memuat Role...</td></tr>
                                    ) : roles.length === 0 ? (
                                        <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">Belum ada role yang didefinisikan</td></tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-3">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-gray-900 rounded text-white border border-black shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded text-admin-primary">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="font-black text-[11px] tracking-widest uppercase">Keamanan Sistem</h3>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed mb-6 italic font-medium">
                            Role menentukan aksi apa yang dapat dilakukan staff. Untuk staff dengan banyak Role, wewenang akan digabungkan secara otomatis.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[9px] font-black text-admin-warning uppercase tracking-widest">
                                <Lock size={12} /> Role Sistem Terproteksi:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['admin', 'user', 'operator'].map(r => (
                                    <span key={r} className="px-2 py-0.5 bg-white/10 rounded border border-white/10 text-[9px] uppercase font-black tracking-widest text-gray-300">{r}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CREATE/EDIT ROLE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden rounded animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">{editingRole ? 'Perbarui Hak Akses' : 'Buat Role Akses Baru'}</h3>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Konfigurasi Role-Based Access Control</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nama Tampilan Role</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-xs outline-none focus:border-admin-primary font-black uppercase tracking-widest shadow-sm" 
                                    placeholder="Contoh: SUPERVISOR_OPERASI"
                                    required 
                                    disabled={!!(editingRole && ['admin', 'user', 'operator'].includes(editingRole.name))}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Tentukan Wewenang</label>
                                    <span className="text-[9px] text-admin-primary font-black uppercase tracking-widest">{formData.permissions.length} Dipilih</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {permissions.map(perm => (
                                        <button
                                            key={perm.id}
                                            type="button"
                                            onClick={() => togglePermission(perm.name)}
                                            className={cn(
                                                "px-3 py-2.5 rounded border text-left transition-all flex items-center gap-3 group",
                                                formData.permissions.includes(perm.name) 
                                                    ? "bg-admin-primary/10 border-admin-primary text-admin-primary shadow-sm" 
                                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-all", 
                                                formData.permissions.includes(perm.name) 
                                                    ? "bg-admin-primary border-admin-primary text-white" 
                                                    : "bg-gray-100 border-gray-200 group-hover:border-gray-300"
                                            )}>
                                                {formData.permissions.includes(perm.name) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter truncate">{perm.name.replace(/_/g, ' ')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white flex gap-3 shrink-0 sticky bottom-0">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black text-gray-400 hover:bg-gray-50 rounded transition-colors uppercase tracking-widest border border-gray-100">Batal</button>
                            <button onClick={handleSubmit} className="flex-[2] py-3 bg-admin-primary text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-admin-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                <Save size={16} />
                                {editingRole ? 'Simpan Konfigurasi' : 'Inisialisasi Role Akses'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagementPage;
