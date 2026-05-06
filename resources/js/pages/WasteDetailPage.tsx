import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Trash2, 
    Calendar,
    ArrowLeft,
    BarChart3,
    Activity,
    Filter
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
    Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const WasteDetailPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <Activity className="animate-spin" size={32} />
                <span className="text-sm font-bold uppercase tracking-widest">Memuat Detail Statistik...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 bg-white rounded border border-gray-200 text-gray-400 hover:text-admin-primary transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Detail Sampah Terkumpul</h1>
                        <p className="text-sm text-gray-500">Statistik mendalam pengumpulan botol plastik</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-[12px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
                        <Calendar size={14} /> 7 Bulan Terakhir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded text-[12px] font-black uppercase tracking-widest shadow-lg shadow-admin-primary/20 hover:bg-blue-700 transition-all">
                        <Filter size={14} /> Filter
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Botol</p>
                        <h3 className="text-4xl font-black text-gray-800">{stats.stats.trash_collected}</h3>
                        <p className="text-[12px] text-green-500 font-bold mt-2 flex items-center gap-1">
                            <TrendingUp size={14} /> +12% dari bulan lalu
                        </p>
                    </div>
                    <Trash2 size={80} className="absolute -right-4 -bottom-4 text-gray-50" />
                </div>
                <div className="bg-white p-6 rounded border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Rata-rata Harian</p>
                        <h3 className="text-4xl font-black text-gray-800">42</h3>
                        <p className="text-[12px] text-gray-400 font-bold mt-2 italic">Berdasarkan 30 hari terakhir</p>
                    </div>
                    <BarChart3 size={80} className="absolute -right-4 -bottom-4 text-gray-50" />
                </div>
                <div className="bg-white p-6 rounded border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Bulan Ini</p>
                        <h3 className="text-4xl font-black text-gray-800">85%</h3>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
                            <div className="bg-admin-primary h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                    <Activity size={80} className="absolute -right-4 -bottom-4 text-gray-50" />
                </div>
            </div>

            {/* Main Chart Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={18} className="text-admin-primary" /> Analisis Pertumbuhan Bulanan
                        </h3>
                    </div>
                    <div className="p-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chart_data}>
                                <defs>
                                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007bff" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} 
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#007bff', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="bottles" 
                                    stroke="#007bff" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorWaste)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Location Rankings */}
                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                            <Filter size={18} className="text-admin-primary" /> Peringkat Lokasi
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="text-[11px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-black">Lokasi SmartBin</th>
                                    <th className="px-6 py-3 font-black text-right">Botol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.location_stats.map((loc: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                                                    idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                                                    idx === 1 ? "bg-gray-100 text-gray-600" :
                                                    idx === 2 ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{loc.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-admin-primary">{loc.total_bottles.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.location_stats.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center text-gray-300 text-[11px] font-black uppercase tracking-widest">Belum ada data lokasi</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Perbandingan Volume</h3>
                    </div>
                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} />
                                <Tooltip cursor={{fill: '#f8f9fa'}} />
                                <Bar dataKey="bottles" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                    {stats.chart_data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === stats.chart_data.length - 1 ? '#007bff' : '#dee2e6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Wawasan Data</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-blue-50 border-l-4 border-admin-primary rounded">
                            <p className="text-[12px] font-black text-admin-primary uppercase tracking-widest mb-1">Puncak Pengumpulan</p>
                            <p className="text-sm text-blue-800 font-medium">Bulan lalu mencatat rekor tertinggi dengan kenaikan signifikan pada partisipasi masyarakat.</p>
                        </div>
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <p className="text-[12px] font-black text-green-600 uppercase tracking-widest mb-1">Kontribusi IoT</p>
                            <p className="text-sm text-green-800 font-medium">80% sampah terkumpul melalui unit SmartBin yang tersebar di area publik.</p>
                        </div>
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <p className="text-[12px] font-black text-yellow-600 uppercase tracking-widest mb-1">Rekomendasi</p>
                            <p className="text-sm text-yellow-800 font-medium">Penambahan unit di sektor timur berpotensi meningkatkan volume hingga 25%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WasteDetailPage;
