import React, { useState, useEffect } from 'react';
import { 
    Coins, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Download, 
    ExternalLink,
    Wallet,
    Loader2
} from 'lucide-react';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PayoutRequest {
    id: number;
    user_id: number;
    user?: {
        name: string;
        email: string;
    };
    ewallet_amount: number;
    points: number;
    ewallet_type: string;
    ewallet_account: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

interface Stats {
    pending_count: number;
    pending_amount: number;
    completed_today: number;
}

const PointRedemptionPage: React.FC = () => {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    
    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/redeem', {
                params: {
                    ewallet_type: filter,
                    search: search
                }
            });
            if (response.data.success) {
                setPayouts(response.data.data.data);
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/redeem/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchPayouts();
        fetchStats();
    }, [filter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPayouts();
    };

    const handleUpdateStatus = async (id: number, status: 'completed' | 'failed') => {
        if (!confirm(`Apakah Anda yakin ingin ${status === 'completed' ? 'menyetujui' : 'menolak'} permintaan ini?`)) return;

        try {
            const response = await api.put(`/admin/redeem/${id}/status`, { status });
            if (response.data.success) {
                fetchPayouts();
                fetchStats();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal memperbarui status permintaan.');
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock, label: 'Menunggu Persetujuan' };
            case 'completed': return { color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2, label: 'Berhasil Diproses' };
            case 'failed': return { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Ditolak/Gagal' };
            default: return { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: Clock, label: status };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Pencairan Saldo (Payout)</h1>
                    <p className="text-sm text-gray-500">Tinjau dan proses permintaan penukaran poin member ke E-Money</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        <Download size={16} />
                        Ekspor Log
                    </button>
                    <button className="bg-admin-primary text-white px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-admin-primary/20 transition-all">
                        Proses Massal
                    </button>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={16} className="text-admin-info" />
                        Antrean Pencairan
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <form onSubmit={handleSearch} className="relative">
                            <input 
                                type="text" 
                                placeholder="Cari nama member..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[12px] font-bold outline-none focus:border-admin-primary w-full sm:w-48"
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </form>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-[12px] font-bold border-gray-200 rounded outline-none focus:border-admin-primary px-3 py-1.5 uppercase bg-white"
                        >
                            <option value="all">Semua Dompet</option>
                            <option value="gopay">GoPay</option>
                            <option value="ovo">OVO</option>
                            <option value="dana">Dana</option>
                            <option value="shopeepay">ShopeePay</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p className="text-[12px] font-black uppercase tracking-widest">Memuat data...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="text-[12px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/30 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-black">ID</th>
                                    <th className="px-6 py-3 font-black">Member</th>
                                    <th className="px-6 py-3 font-black">Detail Penukaran</th>
                                    <th className="px-6 py-3 font-black">Tujuan Pencairan</th>
                                    <th className="px-6 py-3 font-black">Status</th>
                                    <th className="px-6 py-3 font-black text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                                            Tidak ada permintaan pencairan.
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map((req) => {
                                        const status = getStatusInfo(req.status);
                                        return (
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-all group">
                                                <td className="px-6 py-4 font-black text-[12px] text-gray-400">#{req.id}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{req.user?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(req.created_at).toLocaleString('id-ID')}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-black text-gray-800">Rp {Number(req.ewallet_amount).toLocaleString('id-ID')}</span>
                                                        <span className="text-[11px] text-gray-400 font-black uppercase flex items-center gap-1">
                                                            <Coins size={10} /> {Math.abs(req.points).toLocaleString()} POIN
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 border border-gray-200 uppercase tracking-tighter">
                                                            {req.ewallet_type.substring(0, 3)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-black text-gray-800 uppercase">{req.ewallet_type}</span>
                                                            <span className="text-[12px] font-bold text-gray-400 font-mono tracking-wider">{req.ewallet_account}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest border",
                                                        status.color
                                                    )}>
                                                        <status.icon size={12} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'completed')}
                                                                className="bg-admin-success text-white px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-900/20"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'failed')}
                                                                className="bg-white border border-red-100 text-red-600 px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button className="p-1.5 text-gray-300 hover:text-admin-primary rounded transition-colors">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                        Total Pencairan Tertunda: <span className="font-black text-admin-primary">Rp {(stats?.pending_amount || 0).toLocaleString('id-ID')}</span>
                    </p>
                    <div className="flex gap-2">
                        <span className="text-[11px] font-black text-gray-300 uppercase">
                            {payouts.length} Permintaan Ditampilkan
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointRedemptionPage;
