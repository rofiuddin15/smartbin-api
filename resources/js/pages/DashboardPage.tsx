import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Trash2, 
    TrendingUp, 
    UserPlus, 
    ArrowRight,
    Search,
    Activity
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const InfoBox = ({ color, icon: Icon, title, value, linkText }: { color: string, icon: any, title: string, value: string | number, linkText: string }) => (
    <div className={`overflow-hidden rounded shadow-sm flex flex-col relative h-full border border-black/5`}>
        <div className={`p-4 flex justify-between items-start ${color} text-white flex-1`}>
            <div>
                <h3 className="text-2xl font-black mb-1">{value}</h3>
                <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">{title}</p>
            </div>
            <Icon size={40} className="text-white/20 absolute right-2 top-4" />
        </div>
        <a href="#" className="bg-black/10 hover:bg-black/20 text-white text-center py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors shrink-0">
            {linkText} <ArrowRight size={12} />
        </a>
    </div>
);

const DashboardPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const fetchDashboardData = () => {
        dispatch(fetchDashboardStats());
    };

    if (!stats) {
        if (error) {
            return (
                <div className="bg-red-50 border border-red-100 p-12 rounded text-center">
                    <Activity className="mx-auto text-red-400 mb-4" size={48} />
                    <h3 className="text-sm font-black text-red-800 uppercase">Gagal Memuat Data</h3>
                    <p className="text-xs text-red-600 mt-2">{error}</p>
                    <button onClick={fetchDashboardData} className="mt-6 px-8 py-2 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20">Coba Lagi</button>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <Activity className="animate-spin" size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">Memuat Data Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Ringkasan Dashboard</h1>
                    <p className="text-xs text-gray-500">Pantau performa ekosistem SmartBin Pamekasan</p>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Beranda / <span className="text-admin-primary">Dashboard</span>
                </div>
            </div>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBox 
                    color="bg-admin-info" 
                    icon={TrendingUp} 
                    title="Sampah Terkumpul (Botol)" 
                    value={stats.stats.trash_collected} 
                    linkText="Lihat Statistik" 
                />
                <InfoBox 
                    color="bg-admin-success" 
                    icon={Trash2} 
                    title="SmartBin IoT Aktif" 
                    value={stats.stats.active_bins} 
                    linkText="Cek Perangkat" 
                />
                <InfoBox 
                    color="bg-admin-warning" 
                    icon={UserPlus} 
                    title="Pendaftar Baru" 
                    value={stats.stats.new_users} 
                    linkText="Moderasi User" 
                />
                <InfoBox 
                    color="bg-admin-danger" 
                    icon={Users} 
                    title="Total Partisipan" 
                    value={stats.stats.total_participants} 
                    linkText="Daftar Lengkap" 
                />
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Trends */}
                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tren Pengumpulan Sampah</h3>
                    </div>
                    <div className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chart_data}>
                                <defs>
                                    <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007bff" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="botol" stroke="#007bff" strokeWidth={3} fillOpacity={1} fill="url(#colorOrganic)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Regional Bins Activity */}
                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partisipasi Daur Ulang</h3>
                    </div>
                    <div className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                                <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '4px', border: '1px solid #eee', fontSize: '10px', fontWeight: 'bold'}} />
                                <Bar dataKey="botol" fill="#17a2b8" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Recent Activity */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaksi Terbaru</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-black">User</th>
                                <th className="px-6 py-3 font-black">Tipe</th>
                                <th className="px-6 py-3 font-black">Lokasi SmartBin</th>
                                <th className="px-6 py-3 font-black">Poin</th>
                                <th className="px-6 py-3 font-black text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.recent_transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-admin-primary/10 text-admin-primary flex items-center justify-center font-black text-[10px]">
                                            {t.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{t.user_name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">USER-{t.user_id.toString().padStart(5, '0')}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                            t.type === 'deposit' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                        )}>
                                            {t.type === 'deposit' ? 'Setor' : 'Tukar'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-600 font-medium">{t.location}</td>
                                    <td className={cn(
                                        "px-6 py-3 text-xs font-black",
                                        t.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {t.type === 'deposit' ? '+' : '-'}{t.points.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-right text-[10px] text-gray-400 font-bold">{t.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stats.recent_transactions.length === 0 && (
                        <div className="p-12 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">Belum ada transaksi terbaru</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
