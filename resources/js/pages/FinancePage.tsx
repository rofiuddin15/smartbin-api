import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchFinanceDashboard, updateFinanceSettings, addLedgerEntry } from '../store/slices/financeSlice';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Download, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    LucideIcon,
    Settings,
    X,
    Save,
    PlusCircle
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
                "flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border",
                trendType === 'up' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
            )}>
                {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div>
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-2xl font-black text-gray-800 mb-1">{value}</p>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">{subValue}</p>
        </div>
    </div>
);


const FinancePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { cards, chartData, distributionData, recentLogs, settings, loading } = useSelector((state: RootState) => state.finance);
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    
    const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    
    const [ledgerType, setLedgerType] = useState('expense');
    const [ledgerCategory, setLedgerCategory] = useState('operational');
    const [ledgerAmount, setLedgerAmount] = useState(0);
    const [ledgerDescription, setLedgerDescription] = useState('');

    const [pointRate, setPointRate] = useState(settings.point_to_idr_rate);
    const [marginPercent, setMarginPercent] = useState(settings.revenue_margin_percent);

    useEffect(() => {
        dispatch(fetchFinanceDashboard());
    }, [dispatch]);

    useEffect(() => {
        setPointRate(settings.point_to_idr_rate);
        setMarginPercent(settings.revenue_margin_percent);
    }, [settings]);

    const handleSaveSettings = () => {
        dispatch(updateFinanceSettings({ point_to_idr_rate: pointRate, revenue_margin_percent: marginPercent }))
            .then(() => dispatch(fetchFinanceDashboard()))
            .then(() => setIsSettingsOpen(false));
    };

    const handleAddLedger = () => {
        dispatch(addLedgerEntry({ 
            type: ledgerType, 
            category: ledgerCategory, 
            amount: ledgerAmount, 
            description: ledgerDescription 
        }))
            .then(() => dispatch(fetchFinanceDashboard()))
            .then(() => {
                setIsLedgerOpen(false);
                setLedgerAmount(0);
                setLedgerDescription('');
            });
    };

    const handleExport = async () => {
        try {
            const api = (await import('../utils/api')).default;
            const response = await api.get(`/admin/finance/export?month=${exportMonth}&year=${exportYear}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Keuangan_${exportYear}_${exportMonth}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsExportOpen(false);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (loading && recentLogs.length === 0) {
        return <div className="flex items-center justify-center h-64 text-gray-400 font-bold animate-pulse uppercase tracking-widest">Memuat Laporan...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Laporan Keuangan</h1>
                    <p className="text-sm text-gray-500">Pantau pendapatan hasil daur ulang dan liabilitas pencairan poin member</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsLedgerOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <PlusCircle size={16} className="text-green-600" />
                        Input Transaksi
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <Settings size={16} />
                        Pengaturan
                    </button>
                    <button 
                        onClick={() => setIsExportOpen(true)}
                        className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-admin-primary/20 transition-all"
                    >
                        <Download size={16} />
                        Ekspor Laporan
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinCard 
                    title="Total Pendapatan Aset" 
                    value={`Rp ${cards.pendapatan.toLocaleString('id-ID')}`} 
                    subValue="Estimasi Margin Jual Sampah" 
                    icon={TrendingUp} 
                    trend="Aktif" 
                    trendType="up" 
                />
                <FinCard 
                    title="Liabilitas Poin" 
                    value={`Rp ${cards.liabilitas.toLocaleString('id-ID')}`} 
                    subValue="Total Saldo Member Beredar" 
                    icon={DollarSign} 
                    trend="Tertunda" 
                    trendType="down" 
                />
                <FinCard 
                    title="Total Pencairan (Payout)" 
                    value={`Rp ${cards.pengeluaran.toLocaleString('id-ID')}`} 
                    subValue="Telah Dibayar via E-Money" 
                    icon={TrendingDown} 
                    trend="Sukses" 
                    trendType="up" 
                />
                <FinCard 
                    title="Anggaran E-Money" 
                    value={`Rp ${cards.saldo_anggaran.toLocaleString('id-ID')}`} 
                    subValue="Sisa Plafon Anggaran" 
                    icon={BarChart3} 
                    trend="Stabil" 
                    trendType="up" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Pendapatan vs Pengeluaran (4 Minggu)</h3>
                    </div>
                    <div className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#999'}} tickFormatter={(val: any) => `Rp${val/1000}K`} />
                                <Tooltip 
                                    formatter={(value: any) => [`Rp ${value?.toLocaleString('id-ID')}`, '']}
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <Bar dataKey="pendapatan" fill="#007bff" radius={[2, 2, 0, 0]} name="Pendapatan (Rp)" />
                                <Bar dataKey="pengeluaran" fill="#dc3545" radius={[2, 2, 0, 0]} name="Pengeluaran (Rp)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Distribusi Metode Pencairan</h3>
                    </div>
                    <div className="p-6 h-[350px] flex flex-col">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                {distributionData.length > 0 ? (
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: any) => [`${val} Pts`, 'Points']} contentStyle={{borderRadius: '4px', border: '1px solid #eee', fontSize: '12px', fontWeight: 'bold'}} />
                                    </PieChart>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[11px]">Belum ada pencairan</div>
                                )}
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2"> 
                            {distributionData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-[12px] text-gray-500 font-bold uppercase tracking-tight">{item.name} ({item.value} Pts)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payout table shortcut */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Log Riwayat Keuangan (Real-Time)</h3>
                    <button className="text-[12px] text-admin-primary font-black uppercase tracking-widest hover:underline">Muat Ulang</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[12px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-black">ID Ref</th>
                                <th className="px-6 py-3 font-black">Kategori</th>
                                <th className="px-6 py-3 font-black">User / Entitas</th>
                                <th className="px-6 py-3 font-black">Deskripsi</th>
                                <th className="px-6 py-3 font-black">Nominal (Rp)</th>
                                <th className="px-6 py-3 font-black text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Belum ada transaksi</td>
                                </tr>
                            ) : (
                                recentLogs.map((log: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-black text-[12px] text-gray-400 uppercase tracking-widest">{log.id}</td>
                                        <td className="px-6 py-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[11px] font-black uppercase border tracking-widest",
                                                log.category === 'deposit' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {log.category === 'deposit' ? 'Aset Pendapatan' : 'Pengeluaran Payout'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-800 font-bold uppercase tracking-tight">{log.user_name}</td>
                                        <td className="px-6 py-3 text-[13px] text-gray-600 font-medium tracking-tight">
                                            {log.description}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-3 text-xs font-black",
                                            log.category === 'deposit' ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {log.category === 'deposit' ? '+' : '-'} Rp {Math.round(log.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-3 text-right text-[12px] text-gray-400 font-black uppercase tracking-widest">
                                            {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Pengaturan */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <Settings size={16} className="text-admin-primary" /> Pengaturan Keuangan
                            </h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Rate Konversi Poin ke Rupiah</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">Rp</span>
                                    <input 
                                        type="number" 
                                        value={pointRate}
                                        onChange={(e) => setPointRate(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 italic">Nilai Rupiah untuk 1 poin member (Misal: 10)</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Margin Valuasi Aset Sampah (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={marginPercent}
                                        onChange={(e) => setMarginPercent(Number(e.target.value))}
                                        className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">%</span>
                                </div>
                                <p className="text-[11px] text-gray-400 italic">Keuntungan kotor perusahaan dari setiap nilai poin. Misal 400% dari Rp 10 = Rp 40 (Total Aset = Rp 50/poin botol).</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">Batal</button>
                            <button onClick={handleSaveSettings} className="px-6 py-2 bg-admin-primary text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                                <Save size={14} /> Simpan Pengaturan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Input Transaksi Manual (Modal & Pengeluaran Lain) */}
            {isLedgerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={16} className="text-admin-primary" /> Input Transaksi Manual
                            </h3>
                            <button onClick={() => setIsLedgerOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Tipe Transaksi</label>
                                    <select 
                                        value={ledgerType}
                                        onChange={(e) => setLedgerType(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    >
                                        <option value="income">Pemasukan / Modal</option>
                                        <option value="expense">Pengeluaran</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kategori</label>
                                    <select 
                                        value={ledgerCategory}
                                        onChange={(e) => setLedgerCategory(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    >
                                        {ledgerType === 'income' ? (
                                            <>
                                                <option value="capital">Suntikan Modal</option>
                                                <option value="other">Pendapatan Lainnya</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="operational">Operasional</option>
                                                <option value="maintenance">Pemeliharaan</option>
                                                <option value="other">Lain-lain</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Nominal (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">Rp</span>
                                    <input 
                                        type="number" 
                                        value={ledgerAmount}
                                        onChange={(e) => setLedgerAmount(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Keterangan</label>
                                <textarea 
                                    value={ledgerDescription}
                                    onChange={(e) => setLedgerDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all h-20 resize-none"
                                    placeholder="Contoh: Beli alat kebersihan atau Suntikan dana investor"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsLedgerOpen(false)} className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">Batal</button>
                            <button onClick={handleAddLedger} className="px-6 py-2 bg-green-600 text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md hover:bg-green-700 transition-all flex items-center gap-2">
                                <Save size={14} /> Simpan Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ekspor Laporan */}
            {isExportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <Download size={16} className="text-admin-primary" /> Ekspor Laporan CSV
                            </h3>
                            <button onClick={() => setIsExportOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500 font-medium">Pilih periode laporan yang ingin Anda unduh dalam format CSV.</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Bulan</label>
                                    <select 
                                        value={exportMonth}
                                        onChange={(e) => setExportMonth(Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Tahun</label>
                                    <select 
                                        value={exportYear}
                                        onChange={(e) => setExportYear(Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return <option key={year} value={year}>{year}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsExportOpen(false)} className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">Batal</button>
                            <button onClick={handleExport} className="px-6 py-2 bg-admin-primary text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                                <Download size={14} /> Unduh CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
