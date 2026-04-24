import React from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Download, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    LucideIcon
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const finData = [
    { name: 'Minggu 1', pendapatan: 4500000, pengeluaran: 2100000 },
    { name: 'Minggu 2', pendapatan: 5200000, pengeluaran: 3200000 },
    { name: 'Minggu 3', pendapatan: 3800000, pengeluaran: 1500000 },
    { name: 'Minggu 4', pendapatan: 6100000, pengeluaran: 4200000 },
];

const categoryData = [
    { name: 'GoPay', value: 45 },
    { name: 'OVO', value: 25 },
    { name: 'Dana', value: 20 },
    { name: 'Lainnya', value: 10 },
];

const COLORS = ['#007bff', '#17a2b8', '#ffc107', '#dc3545'];

const FinCard = ({ title, value, subValue, icon: Icon, trend, trendType }: { 
    title: string, value: string, subValue: string, icon: LucideIcon, trend: string, trendType: 'up' | 'down' 
}) => (
    <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded bg-gray-50 text-gray-400 border border-gray-100">
                <Icon size={20} />
            </div>
            <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                trendType === 'up' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
            )}>
                {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div>
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-xl font-black text-gray-800 mb-1">{value}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{subValue}</p>
        </div>
    </div>
);


const FinancePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Laporan Keuangan</h1>
                    <p className="text-xs text-gray-500">Pantau pendapatan hasil daur ulang dan liabilitas pencairan poin member</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        <Calendar size={16} />
                        30 Hari Terakhir
                    </button>
                    <button className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-admin-primary/20 transition-all">
                        <Download size={16} />
                        Ekspor Laporan
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinCard 
                    title="Total Pendapatan" 
                    value="Rp 24.520.000" 
                    subValue="Hasil Penjualan Sampah" 
                    icon={TrendingUp} 
                    trend="+12.5%" 
                    trendType="up" 
                />
                <FinCard 
                    title="Liabilitas Poin" 
                    value="156.700 PTS" 
                    subValue="Saldo Member Beredar" 
                    icon={DollarSign} 
                    trend="+5.2%" 
                    trendType="up" 
                />
                <FinCard 
                    title="Total Pencairan" 
                    value="Rp 12.400.000" 
                    subValue="Dibayar via E-Money" 
                    icon={TrendingDown} 
                    trend="-2.1%" 
                    trendType="down" 
                />
                <FinCard 
                    title="Anggaran E-Money" 
                    value="Rp 50.000.000" 
                    subValue="Sisa Plafon Pencairan" 
                    icon={BarChart3} 
                    trend="Stabil" 
                    trendType="up" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendapatan vs Pengeluaran</h3>
                    </div>
                    <div className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} tickFormatter={(val: number) => `Rp${val/1000000}JT`} />
                                <Tooltip 
                                    formatter={(value: any) => [`Rp ${value?.toLocaleString('id-ID')}`, '']}
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }} 
                                />
                                <Bar dataKey="pendapatan" fill="#007bff" radius={[2, 2, 0, 0]} name="Pendapatan" />
                                <Bar dataKey="pengeluaran" fill="#dc3545" radius={[2, 2, 0, 0]} name="Pengeluaran" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distribusi Pencairan</h3>
                    </div>
                    <div className="p-6 h-[350px] flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '4px', border: '1px solid #eee', fontSize: '10px', fontWeight: 'bold'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2"> 
                            {categoryData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payout table shortcut */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Riwayat Keuangan</h3>
                    <button className="text-[10px] text-admin-primary font-black uppercase tracking-widest hover:underline">Lihat Semua Rekaman</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-black">ID Transaksi</th>
                                <th className="px-6 py-3 font-black">Kategori</th>
                                <th className="px-6 py-3 font-black">Deskripsi</th>
                                <th className="px-6 py-3 font-black">Jumlah</th>
                                <th className="px-6 py-3 font-black text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-black text-[10px] text-gray-400 uppercase tracking-widest">FIN-TX-00{i}</td>
                                    <td className="px-6 py-3">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest",
                                            i % 2 === 0 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            {i % 2 === 0 ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-600 font-bold uppercase tracking-tight">
                                        {i % 2 === 0 ? 'Penjualan Batch Plastik #55' : 'Pencairan Poin Member - Batch OVO'}
                                    </td>
                                    <td className={cn(
                                        "px-6 py-3 text-xs font-black",
                                        i % 2 === 0 ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {i % 2 === 0 ? '+' : '-'} Rp {(i * 1250000).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-3 text-right text-[10px] text-gray-400 font-black uppercase tracking-widest"> {i + 10} Nov, 2023</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
