import React, { useState, useEffect } from 'react';
import { 
    Coins, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Download, 
    ExternalLink,
    Wallet
} from 'lucide-react';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PayoutRequest {
    id: number;
    user_name: string;
    amount_idr: number;
    points: number;
    ewallet_type: string;
    ewallet_account: string;
    status: 'pending' | 'completed' | 'failed';
    requested_at: string;
}

const PointRedemptionPage: React.FC = () => {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    
    useEffect(() => {
        // Fallback data
        setPayouts([
            { id: 101, user_name: 'Ahmad Faisal', amount_idr: 50000, points: 5000, ewallet_type: 'GoPay', ewallet_account: '081234567890', status: 'pending', requested_at: new Date().toISOString() },
            { id: 102, user_name: 'Siti Aminah', amount_idr: 25000, points: 2500, ewallet_type: 'OVO', ewallet_account: '085678901234', status: 'completed', requested_at: new Date(Date.now() - 3600000).toISOString() },
            { id: 103, user_name: 'Budi Santoso', amount_idr: 100000, points: 10000, ewallet_type: 'Dana', ewallet_account: '081299998888', status: 'pending', requested_at: new Date(Date.now() - 7200000).toISOString() },
            { id: 104, user_name: 'Dewi Lestari', amount_idr: 15000, points: 1500, ewallet_type: 'ShopeePay', ewallet_account: '087712345678', status: 'failed', requested_at: new Date(Date.now() - 86400000).toISOString() },
        ]);
    }, []);

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
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Pencairan Saldo (Payout)</h1>
                    <p className="text-xs text-gray-500">Tinjau dan proses permintaan penukaran poin member ke E-Money</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        <Download size={16} />
                        Ekspor Log
                    </button>
                    <button className="bg-admin-primary text-white px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-admin-primary/20 transition-all">
                        Proses Massal
                    </button>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={16} className="text-admin-info" />
                        Antrean Pencairan
                    </h3>
                    <div className="flex items-center gap-3">
                        <select className="text-[10px] font-bold border-gray-200 rounded outline-none focus:border-admin-primary px-3 py-1 uppercase bg-white">
                            <option value="all">Semua Dompet</option>
                            <option value="gopay">GoPay</option>
                            <option value="ovo">OVO</option>
                            <option value="dana">Dana</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/30 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-black">ID Permintaan</th>
                                <th className="px-6 py-3 font-black">Member</th>
                                <th className="px-6 py-3 font-black">Detail Penukaran</th>
                                <th className="px-6 py-3 font-black">Tujuan Pencairan</th>
                                <th className="px-6 py-3 font-black">Status</th>
                                <th className="px-6 py-3 font-black text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payouts.map((req) => {
                                const status = getStatusInfo(req.status);
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-4 font-black text-[10px] text-gray-400">#{req.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{req.user_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-800">Rp {req.amount_idr.toLocaleString('id-ID')}</span>
                                                <span className="text-[9px] text-gray-400 font-black uppercase flex items-center gap-1">
                                                    <Coins size={10} /> {req.points.toLocaleString()} POIN
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-400 border border-gray-200 uppercase tracking-tighter">
                                                    {req.ewallet_type.substring(0, 3)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-800 uppercase">{req.ewallet_type}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">{req.ewallet_account}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border",
                                                status.color
                                            )}>
                                                <status.icon size={12} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="bg-admin-success text-white px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-900/20">
                                                        Setujui
                                                    </button>
                                                    <button className="bg-white border border-red-100 text-red-600 px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
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
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pencairan Tertunda: <span className="font-black text-admin-primary">Rp 150.000</span></p>
                    <div className="flex gap-2">
                        <span className="text-[9px] font-black text-gray-300 uppercase">Halaman 1 dari 5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointRedemptionPage;
