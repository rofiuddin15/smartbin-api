import React, { useState, useEffect, useMemo } from 'react';
import { 
    createColumnHelper, 
    flexRender, 
    getCoreRowModel, 
    useReactTable,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import { 
    UserPlus, Shield, UserCog, Mail, Key, Trash2, Edit2, 
    BadgeCheck, Search, Filter, X, Save, Ban, CheckCircle, 
    ChevronUp, ChevronDown, Activity, ShieldCheck, Lock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchStaff, invalidateStaffCache } from '../store/slices/staffSlice';
import { fetchRoles } from '../store/slices/rolesSlice';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Role {
    id: number;
    name: string;
}

interface Staff {
    id: number;
    name: string;
    email: string;
    roles: string[];
    status: 'active' | 'suspended';
    created_at: string;
}

const StaffManagementPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { staffList, loading, error } = useSelector((state: RootState) => state.staff);
    const { roles } = useSelector((state: RootState) => state.roles);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: [] as string[]
    });

    useEffect(() => {
        dispatch(fetchStaff());
        dispatch(fetchRoles());
    }, [dispatch]);

    const fetchStaffData = () => {
        dispatch(invalidateStaffCache());
        dispatch(fetchStaff());
    };

    const handleOpenModal = (staff: Staff | null = null) => {
        if (staff) {
            setEditingStaff(staff);
            setFormData({
                name: staff.name,
                email: staff.email,
                password: '',
                roles: staff.roles
            });
        } else {
            setEditingStaff(null);
            setFormData({ name: '', email: '', password: '', roles: [] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const api = (await import('../utils/api')).default;
            if (editingStaff) {
                await api.put(`/users/${editingStaff.id}`, {
                    name: formData.name,
                    email: formData.email,
                    ...(formData.password ? { password: formData.password } : {})
                });
                await api.post('/roles/sync', {
                    user_id: editingStaff.id,
                    roles: formData.roles
                });
            } else {
                const response = await api.post('/users', formData);
                const newUserId = response.data.data.id;
                await api.post('/roles/sync', {
                    user_id: newUserId,
                    roles: formData.roles
                });
            }
            setIsModalOpen(false);
            fetchStaffData();
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Gagal menyimpan data staff');
        }
    };

    const handleToggleStatus = async (staff: Staff) => {
        const newStatus = staff.status === 'active' ? 'suspended' : 'active';
        const confirmMsg = staff.status === 'active' 
            ? 'Apakah Anda yakin ingin menonaktifkan staff ini?' 
            : 'Apakah Anda yakin ingin mengaktifkan kembali staff ini?';
            
        if (!confirm(confirmMsg)) return;
        
        try {
            const api = (await import('../utils/api')).default;
            await api.put(`/admin/users/${staff.id}/status`, { status: newStatus });
            fetchStaffData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const toggleRole = (roleName: string) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(roleName)
                ? prev.roles.filter(r => r !== roleName)
                : [...prev.roles, roleName]
        }));
    };

    const columnHelper = createColumnHelper<Staff>();
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nama Lengkap',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                        <UserCog size={16} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="font-black text-gray-800 text-[13px] uppercase tracking-tight">{info.getValue()}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">ID-{info.row.original.id.toString().padStart(4, '0')}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('roles', {
            header: 'Peran / Role',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue().length > 0 ? info.getValue().map(role => (
                        <span key={role} className="px-2 py-0.5 rounded bg-admin-primary/10 text-admin-primary border border-admin-primary/20 text-[11px] font-black uppercase tracking-tighter shadow-sm">
                            {role}
                        </span>
                    )) : <span className="text-[11px] text-gray-300 font-bold italic">Tanpa Role</span>}
                </div>
            ),
        }),
        columnHelper.accessor('email', {
            header: 'Alamat Email',
            cell: info => <span className="text-[13px] text-gray-600 font-bold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-black uppercase border tracking-widest",
                    info.getValue() === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                )}>
                    {info.getValue() === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleOpenModal(info.row.original)} className="p-1.5 text-gray-400 hover:text-admin-primary hover:bg-gray-50 rounded transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleToggleStatus(info.row.original)} className={cn("p-1.5 rounded transition-all", info.row.original.status === 'active' ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-green-500 hover:bg-green-50")}>
                        {info.row.original.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                </div>
            ),
        }),
    ], []);

    const table = useReactTable({
        data: staffList,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Manajemen Staff</h1>
                    <p className="text-sm text-gray-500">Kelola peran tim internal dan akses sistem administrasi</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari staff..." 
                            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-admin-primary w-48 bg-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition-all font-black text-[12px] uppercase tracking-widest">
                        <UserPlus size={16} />
                        Tambah Staff
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3 cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                                            <div className="flex items-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() && (header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-[12px] font-black uppercase tracking-widest animate-pulse">Memuat Staff...</td></tr>
                            ) : staffList.length === 0 ? (
                                <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-gray-300 text-[12px] font-black uppercase tracking-widest">Tidak ada staff ditemukan</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-2.5">
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

            {/* MODAL ADD/EDIT STAFF */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white shadow-2xl w-full max-w-md overflow-hidden rounded animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-gray-800 uppercase tracking-tight text-base">{editingStaff ? 'Edit Data Staff' : 'Tambah Staff Baru'}</h3>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Konfigurasi Akses Sistem</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50/30">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold uppercase outline-none focus:border-admin-primary shadow-sm" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Alamat Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold outline-none focus:border-admin-primary shadow-sm" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Kata Sandi {editingStaff && '(Kosongkan jika tetap)'}</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold outline-none focus:border-admin-primary shadow-sm" required={!editingStaff} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Pilih Role (Multi-Role)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {roles.map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => toggleRole(role.name)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 rounded border text-left transition-all",
                                                formData.roles.includes(role.name) 
                                                    ? "bg-admin-primary/10 border-admin-primary text-admin-primary shadow-sm" 
                                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn("w-3.5 h-3.5 rounded-sm border flex items-center justify-center", formData.roles.includes(role.name) ? "bg-admin-primary border-admin-primary text-white" : "bg-gray-100 border-gray-200")}>
                                                {formData.roles.includes(role.name) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-[12px] font-black uppercase tracking-tight truncate">{role.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[12px] font-black text-gray-400 hover:bg-gray-100 rounded transition-colors uppercase tracking-widest">Batal</button>
                                <button type="submit" className="flex-[2] py-3 bg-admin-primary text-white text-[12px] font-black uppercase tracking-widest rounded shadow-lg shadow-admin-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <Save size={16} />
                                    {editingStaff ? 'Simpan Perubahan' : 'Daftarkan Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagementPage;
