import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchIncomeList, fetchExpenseList, addLedgerEntry } from '../store/slices/financeSlice';
import { 
    PlusCircle, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight,
    Download,
    Calendar,
    Wallet,
    TrendingUp,
    TrendingDown,
    X,
    Save
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const FinanceLedgerPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const isIncomePage = location.pathname.includes('income');
    const pageTitle = isIncomePage ? 'Tabungan Masuk (Debit)' : 'Penarikan Saldo (Kredit)';
    const pageDesc = isIncomePage ? 'Catatan seluruh sampah yang masuk sebagai tabungan' : 'Catatan seluruh pencairan poin dan biaya operasional';
    
    const { incomeList, expenseList, loading } = useSelector((state: RootState) => state.finance);
    const data = isIncomePage ? incomeList : expenseList;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: isIncomePage ? 'capital' : 'operational',
        amount: 0,
        description: ''
    });

    useEffect(() => {
        if (isIncomePage) {
            dispatch(fetchIncomeList());
        } else {
            dispatch(fetchExpenseList());
        }
    }, [dispatch, isIncomePage]);

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addLedgerEntry({
            type: isIncomePage ? 'income' : 'expense',
            ...formData
        })).then(() => {
            setIsModalOpen(false);
            setFormData({
                category: isIncomePage ? 'capital' : 'operational',
                amount: 0,
                description: ''
            });
            if (isIncomePage) dispatch(fetchIncomeList());
            else dispatch(fetchExpenseList());
        });
    };

    const filteredData = data.filter(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredData.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        {isIncomePage ? <TrendingUp className="text-green-600" /> : <TrendingDown className="text-red-600" />}
                        {pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500">{pageDesc}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative hidden md:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-admin-primary w-64 bg-white shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-admin-primary/20 transition-all"
                    >
                        <PlusCircle size={16} />
                        Input {isIncomePage ? 'Pemasukan' : 'Pengeluaran'}
                    </button>
                </div>
            </div>

            {/* Summary Bar */}
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded", isIncomePage ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                            <Wallet size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total {pageTitle}</p>
                            <p className="text-xl font-black text-gray-800">Rp {totalAmount.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Jumlah Item</p>
                        <p className="text-xl font-black text-gray-800">{filteredData.length}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-admin-primary transition-colors border border-gray-100 rounded">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-admin-primary transition-colors border border-gray-100 rounded">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[12px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">ID Transaksi</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Entitas / User</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4 text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && filteredData.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Memuat Data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300 font-bold uppercase tracking-widest italic">Belum ada catatan {isIncomePage ? 'pemasukan' : 'pengeluaran'}</td></tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-black text-[12px] text-gray-400 uppercase tracking-widest">{item.id}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-widest",
                                                isIncomePage ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-bold uppercase tracking-tight">{item.entity_name}</td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 font-medium tracking-tight truncate max-w-xs">{item.description}</td>
                                        <td className={cn(
                                            "px-6 py-4 text-sm font-black",
                                            isIncomePage ? "text-green-600" : "text-red-600"
                                        )}>
                                            {isIncomePage ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] text-gray-400 font-black uppercase tracking-widest">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Input Manual */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={16} className="text-admin-primary" /> Catat {isIncomePage ? 'Pemasukan' : 'Pengeluaran'} Baru
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kategori Transaksi</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                >
                                    {isIncomePage ? (
                                        <>
                                            <option value="waste_sale">Penjualan Sampah (Recycling Sales)</option>
                                            <option value="admin_fee">Biaya Admin (Redeem Fee)</option>
                                            <option value="capital">Suntikan Modal / Investasi</option>
                                            <option value="other">Pendapatan Lainnya</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="operational">Biaya Operasional</option>
                                            <option value="maintenance">Biaya Pemeliharaan</option>
                                            <option value="other">Biaya Lain-lain</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Nominal (IDR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">Rp</span>
                                    <input 
                                        type="number" 
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Keterangan / Deskripsi</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all h-24 resize-none"
                                    placeholder="Berikan keterangan detail transaksi..."
                                    required
                                />
                            </div>

                            <div className="px-0 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">Batal</button>
                                <button type="submit" className={cn(
                                    "px-6 py-2 text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md transition-all flex items-center gap-2",
                                    isIncomePage ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                )}>
                                    <Save size={14} /> Simpan Catatan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceLedgerPage;
