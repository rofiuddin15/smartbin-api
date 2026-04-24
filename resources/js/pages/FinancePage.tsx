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
import { clsx } from 'clsx';

const finData = [
    { name: 'Week 1', revenue: 4500000, payout: 2100000 },
    { name: 'Week 2', revenue: 5200000, payout: 3200000 },
    { name: 'Week 3', revenue: 3800000, payout: 1500000 },
    { name: 'Week 4', revenue: 6100000, payout: 4200000 },
];

const categoryData = [
    { name: 'GoPay', value: 45 },
    { name: 'OVO', value: 25 },
    { name: 'Dana', value: 20 },
    { name: 'Other', value: 10 },
];

const COLORS = ['#007bff', '#17a2b8', '#ffc107', '#dc3545'];

const FinCard = ({ title, value, subValue, icon: Icon, trend, trendType }: { 
    title: string, value: string, subValue: string, icon: LucideIcon, trend: string, trendType: 'up' | 'down' 
}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
                <Icon size={20} />
            </div>
            <div className={clsx(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                trendType === 'up' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
                {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</h4>
            <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
            <p className="text-xs text-gray-400 font-medium">{subValue}</p>
        </div>
    </div>
);


const FinancePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Financial Reports</h1>
                    <p className="text-sm text-gray-500">Track revenue from recycled goods and point payout liabilities</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <Calendar size={16} />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 bg-admin-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        <Download size={16} />
                        Financial Export
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinCard 
                    title="Total Revenue" 
                    value="Rp 24,520,000" 
                    subValue="From recyclable sales" 
                    icon={TrendingUp} 
                    trend="+12.5%" 
                    trendType="up" 
                />
                <FinCard 
                    title="Point Liability" 
                    value="156,700 pts" 
                    subValue="Outstanding user balance" 
                    icon={DollarSign} 
                    trend="+5.2%" 
                    trendType="up" 
                />
                <FinCard 
                    title="Total Payouts" 
                    value="Rp 12,400,000" 
                    subValue="Paid via E-Wallet" 
                    icon={TrendingDown} 
                    trend="-2.1%" 
                    trendType="down" 
                />
                <FinCard 
                    title="E-Money Budget" 
                    value="Rp 50,000,000" 
                    subValue="Available for redemptions" 
                    icon={BarChart3} 
                    trend="Stable" 
                    trendType="up" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Revenue vs Payouts</h3>
                    </div>
                    <div className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val: number) => `Rp${val/1000000}M`} />
                                <Tooltip 
                                    formatter={(value: any) => [`Rp ${value?.toLocaleString()}`, '']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar dataKey="revenue" fill="#007bff" radius={[4, 4, 0, 0]} name="Revenue" />
                                <Bar dataKey="payout" fill="#dc3545" radius={[4, 4, 0, 0]} name="Payout" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700">Payout Distribution</h3>
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
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2"> 
                            {categoryData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-xs text-gray-600 font-medium">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payout table shortcut */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Financial History Log</h3>
                    <button className="text-xs text-admin-primary font-bold hover:underline">View All Records</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">FIN-TX-00{i}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {i % 2 === 0 ? 'Income' : 'Outcome'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {i % 2 === 0 ? 'Recyclable Plastic Batch #55 Sales' : 'Batch Payout - E-Wallet Redemptions'}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {i % 2 === 0 ? '+' : '-'} Rp {(i * 1250000).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500"> Nov {i + 10}, 2023</td>
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
