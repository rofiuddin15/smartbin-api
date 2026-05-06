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
    Search, Filter, Edit, Trash2, ShieldAlert, UserCheck, 
    Clock, CheckCircle, XCircle, Eye, MoreVertical, 
    Ban, ShieldCheck, AlertTriangle, Mail, Phone, 
    Calendar, MapPin, Briefcase, CreditCard, Activity,
    ChevronUp, ChevronDown, X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers, updateUserStatusInStore } from '../store/slices/usersSlice';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    total_points: number;
    status: 'pending' | 'active' | 'suspended';
    is_verified: boolean;
    avatar_url?: string;
    rejection_reason?: string;
    created_at: string;
    address?: string;
    gender?: string;
    dob?: string;
    occupation?: string;
    id_number?: string;
    last_login_at?: string;
}

const UserManagementPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, stats, error } = useSelector((state: RootState) => state.users);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'suspended'>('pending');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<'profile' | 'transactions'>('profile');
    const [userTransactions, setUserTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        dispatch(fetchUsers({ status: activeTab, search: searchTerm }));
    }, [activeTab, dispatch]);

    const fetchUsersData = () => {
        dispatch(fetchUsers({ status: activeTab, search: searchTerm }));
    };

    const fetchUserTransactions = async (userId: number) => {
        setLoadingTransactions(true);
        try {
            const api = (await import('../utils/api')).default;
            const response = await api.get(`/admin/users/${userId}`);
            const data = response.data.data;
            const combined = [
                ...(data.transactions || []),
                ...(data.pointTransactions || [])
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setUserTransactions(combined);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleUpdateStatus = async (userId: number, newStatus: string, reason: string | null = null) => {
        try {
            const api = (await import('../utils/api')).default;
            await api.put(`/admin/users/${userId}/status`, {
                status: newStatus,
                rejection_reason: reason
            });
            setIsRejectModalOpen(false);
            setIsProfileModalOpen(false);
            setRejectionReason('');
            dispatch(updateUserStatusInStore({ userId, status: newStatus as any }));
            dispatch(fetchUsers({ status: activeTab, search: searchTerm }));
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const columnHelper = createColumnHelper<User>();
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nama Member',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {info.row.original.avatar_url ? (
                            <img src={info.row.original.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-black text-gray-400 uppercase">{info.getValue().charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{info.getValue()}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">ID-{info.row.original.id.toString().padStart(5, '0')}</p>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('email', {
            header: 'Kontak',
            cell: info => (
                <div className="space-y-0.5">
                    <p className="text-[13px] text-gray-600 truncate max-w-[180px]">{info.getValue()}</p>
                    <p className="text-[12px] font-mono text-gray-400">{info.row.original.phone_number}</p>
                </div>
            ),
        }),
        columnHelper.accessor('total_points', {
            header: 'Poin',
            cell: info => (
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                        <ShieldAlert size={10} />
                    </div>
                    <span className="font-black text-gray-800 text-[13px]">{info.getValue().toLocaleString()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Bergabung',
            cell: info => <span className="text-[13px] text-gray-500 font-medium">{new Date(info.getValue()).toLocaleDateString('id-ID')}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {activeTab === 'pending' && (
                        <button onClick={() => handleUpdateStatus(info.row.original.id, 'active')} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-all" title="Setujui"><CheckCircle size={14} /></button>
                    )}
                    <button onClick={() => { setSelectedUser(info.row.original); setIsProfileModalOpen(true); setActiveModalTab('profile'); }} className="p-1.5 text-gray-400 hover:text-admin-primary hover:bg-gray-50 rounded transition-all"><Eye size={14} /></button>
                </div>
            ),
        }),
    ], [activeTab]);

    const table = useReactTable({
        data: users,
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
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Moderasi Member</h1>
                    <p className="text-sm text-gray-500">Kelola pendaftaran dan status partisipan SmartBin</p>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari member..." 
                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-admin-primary w-56 bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchUsersData()}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden rounded shadow-sm">
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button onClick={() => setActiveTab('pending')} className={cn("px-6 py-2.5 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2", activeTab === 'pending' ? "border-admin-primary text-admin-primary bg-white" : "border-transparent text-gray-400 hover:text-gray-600")}>
                        Verifikasi <span className={cn("px-1.5 py-0.5 rounded text-[11px]", activeTab === 'pending' ? "bg-admin-primary text-white" : "bg-gray-200 text-gray-500")}>{stats.pending}</span>
                    </button>
                    <button onClick={() => setActiveTab('active')} className={cn("px-6 py-2.5 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2", activeTab === 'active' ? "border-admin-primary text-admin-primary bg-white" : "border-transparent text-gray-400 hover:text-gray-600")}>
                        Aktif <span className={cn("px-1.5 py-0.5 rounded text-[11px]", activeTab === 'active' ? "bg-admin-primary text-white" : "bg-gray-200 text-gray-500")}>{stats.active}</span>
                    </button>
                    <button onClick={() => setActiveTab('suspended')} className={cn("px-6 py-2.5 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2", activeTab === 'suspended' ? "border-admin-primary text-admin-primary bg-white" : "border-transparent text-gray-400 hover:text-gray-600")}>
                        Suspended <span className={cn("px-1.5 py-0.5 rounded text-[11px]", activeTab === 'suspended' ? "bg-admin-primary text-white" : "bg-gray-200 text-gray-500")}>{stats.suspended}</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
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
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-[12px] font-bold uppercase tracking-widest animate-pulse">Memuat Data Member...</td></tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300 text-[12px] font-bold uppercase tracking-widest">Tidak ada data ditemukan</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} onClick={() => { setSelectedUser(row.original); setIsProfileModalOpen(true); setActiveModalTab('profile'); }} className="hover:bg-gray-50 transition-colors cursor-pointer group">
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

            {/* Modal Detail Profil */}
            {isProfileModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 rounded-xl">
                        {/* Header Biru yang Bersih */}
                        <div className="h-36 bg-admin-primary relative shrink-0">
                            {/* Avatar (Menonjol ke bawah) */}
                            <div className="absolute -bottom-6 left-10 w-32 h-32 bg-white p-1 shadow-xl rounded-xl z-10">
                                <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-gray-300 uppercase">{selectedUser.name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Nama & Badge (Aman di dalam area biru) */}
                            <div className="absolute bottom-6 left-48">
                                <h3 className="text-3xl font-black text-white tracking-tight mb-2">{selectedUser.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest border border-white/30 bg-white/10 text-white">
                                        ID-{selectedUser.id.toString().padStart(6, '0')}
                                    </span>
                                    <span className={cn(
                                        "px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest border",
                                        selectedUser.status === 'active' ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    )}>
                                        {selectedUser.status === 'active' ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 text-white rounded-full transition-all bg-white/10"><X size={20} /></button>
                        </div>

                        {/* Tab Bar Terpisah - Menghindari Bentrok */}
                        <div className="bg-white border-b border-gray-100 pl-48 pr-10 flex gap-6 shrink-0 h-14 items-end">
                            <button 
                                onClick={() => setActiveModalTab('profile')}
                                className={cn(
                                    "px-4 py-3 text-[12px] font-black uppercase tracking-widest transition-all border-b-2",
                                    activeModalTab === 'profile' ? "border-admin-primary text-admin-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Profil Detail
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveModalTab('transactions');
                                    fetchUserTransactions(selectedUser.id);
                                }}
                                className={cn(
                                    "px-4 py-3 text-[12px] font-black uppercase tracking-widest transition-all border-b-2",
                                    activeModalTab === 'transactions' ? "border-admin-primary text-admin-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Riwayat Poin
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10">
                            {activeModalTab === 'profile' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-5 bg-admin-primary/5 rounded-lg border border-admin-primary/10">
                                                <p className="text-[11px] font-black text-admin-primary uppercase tracking-widest mb-1 opacity-70">Saldo Poin Saat Ini</p>
                                                <p className="text-3xl font-black text-gray-800">{(selectedUser.total_points || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Konversi Rupiah</p>
                                                <p className="text-xl font-black text-gray-800">Rp {((selectedUser.total_points || 0) * 10).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
                                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldAlert size={14} className="text-admin-primary" /> Moderasi Member
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedUser.status === 'pending' && (
                                                    <button onClick={() => handleUpdateStatus(selectedUser.id, 'active')} className="w-full py-2.5 bg-green-600 text-white text-[12px] font-black uppercase tracking-widest rounded hover:bg-green-700 transition-all shadow-sm">Setujui Pendaftaran</button>
                                                )}
                                                {selectedUser.status === 'active' && (
                                                    <button onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')} className="w-full py-2.5 border border-red-200 text-red-600 text-[12px] font-black uppercase tracking-widest rounded hover:bg-red-50 hover:border-red-300 transition-all">Blokir Akses</button>
                                                )}
                                                {selectedUser.status === 'suspended' && (
                                                    <button onClick={() => handleUpdateStatus(selectedUser.id, 'active')} className="w-full py-2.5 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest rounded hover:bg-blue-700 transition-all shadow-sm">Aktifkan Kembali</button>
                                                )}
                                                {selectedUser.status === 'pending' && (
                                                    <button onClick={() => setIsRejectModalOpen(true)} className="w-full py-2.5 border border-gray-200 text-gray-600 text-[12px] font-black uppercase tracking-widest rounded hover:bg-gray-50 transition-all">Tolak Pendaftaran</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <section className="space-y-4">
                                            <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <CreditCard size={14} className="text-admin-primary" /> Identitas Personal
                                            </h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">NIK</p><p className="text-sm font-bold text-gray-800 font-mono">{selectedUser.id_number || '-'}</p></div>
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">Pekerjaan</p><p className="text-sm font-bold text-gray-800">{selectedUser.occupation || 'Peserta'}</p></div>
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">Gender / Lahir</p><p className="text-sm font-bold text-gray-800">{selectedUser.gender} / {selectedUser.dob}</p></div>
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">Tgl Bergabung</p><p className="text-sm font-bold text-gray-800">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</p></div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <Mail size={14} className="text-admin-primary" /> Informasi Kontak
                                            </h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">Email</p><p className="text-sm font-bold text-gray-800">{selectedUser.email}</p></div>
                                                <div><p className="text-[11px] font-black text-gray-400 uppercase mb-1">No HP</p><p className="text-sm font-bold text-gray-800 font-mono">{selectedUser.phone_number}</p></div>
                                                <div className="col-span-2"><p className="text-[11px] font-black text-gray-400 uppercase mb-1">Alamat Domisili</p><p className="text-sm font-bold text-gray-800 leading-relaxed">{selectedUser.address}</p></div>
                                            </div>
                                        </section>

                                        <section className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex gap-3">
                                            <AlertTriangle className="text-gray-400 shrink-0" size={16} />
                                            <p className="text-[12px] text-gray-500 leading-relaxed italic">Validasi data dilakukan secara otomatis melalui sinkronisasi API Mobile. Seluruh data di atas bersifat rahasia.</p>
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 bg-admin-primary/5 border border-admin-primary/10 rounded-xl">
                                            <p className="text-[11px] font-black text-admin-primary uppercase tracking-widest mb-1">Poin Terkumpul</p>
                                            <p className="text-3xl font-black text-gray-800">{(selectedUser.total_points || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                                            <p className="text-[11px] font-black text-green-600 uppercase tracking-widest mb-1">Saldo Estimasi</p>
                                            <p className="text-3xl font-black text-gray-800">Rp {((selectedUser.total_points || 0) * 10).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4">Tipe</th>
                                                    <th className="px-6 py-4">Poin</th>
                                                    <th className="px-6 py-4">Keterangan</th>
                                                    <th className="px-6 py-4 text-right">Tanggal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {loadingTransactions ? (
                                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-xs font-bold uppercase animate-pulse">Memuat data...</td></tr>
                                                ) : userTransactions.length === 0 ? (
                                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">Tidak ada riwayat</td></tr>
                                                ) : (
                                                    userTransactions.map((tx, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                                                                    tx.type === 'deposit' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                                                                )}>
                                                                    {tx.type === 'deposit' ? 'Setor' : 'Tukar'}
                                                                </span>
                                                            </td>
                                                            <td className={cn(
                                                                "px-6 py-4 text-base font-black",
                                                                tx.type === 'deposit' ? "text-green-600" : "text-blue-600"
                                                            )}>
                                                                {tx.type === 'deposit' ? '+' : '-'}{tx.points.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-[13px] text-gray-600 font-bold">{tx.notes || tx.description}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-[11px] text-gray-400 font-bold">
                                                                {new Date(tx.created_at).toLocaleDateString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-10 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
                            <button onClick={() => setIsProfileModalOpen(false)} className="px-8 py-2 bg-gray-800 text-white text-[12px] font-black uppercase tracking-widest rounded hover:bg-black transition-all">Tutup Detail</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alasan Penolakan */}
            {isRejectModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8 space-y-6 rounded">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100"><AlertTriangle size={20} /></div>
                            <div><h3 className="font-black text-gray-800 uppercase tracking-tight text-base">Tolak Pendaftaran</h3><p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Tindakan Administratif</p></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Alasan Penolakan</label>
                            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:border-red-500 min-h-[100px] resize-none" placeholder="Jelaskan mengapa pendaftaran ini ditolak..." required />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsRejectModalOpen(false)} className="flex-1 py-2 text-[12px] font-bold text-gray-500 hover:bg-gray-100 rounded transition-colors uppercase tracking-widest">Batal</button>
                            <button onClick={() => handleUpdateStatus(selectedUser.id, 'pending', rejectionReason)} disabled={!rejectionReason.trim()} className="flex-[2] py-2 bg-red-600 text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md hover:bg-red-700 transition-all disabled:opacity-50">Konfirmasi Tolak</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
