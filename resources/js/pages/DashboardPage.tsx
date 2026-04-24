import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Trash2, 
    TrendingUp, 
    UserPlus, 
    ArrowRight,
    Search
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
import api from '../utils/api';

const InfoBox = ({ color, icon: Icon, title, value, linkText }: { color: string, icon: any, title: string, value: string, linkText: string }) => (
    <div className={`overflow-hidden rounded shadow-sm flex flex-col relative h-full`}>
        <div className={`p-4 flex justify-between items-start ${color} text-white flex-1`}>
            <div>
                <h3 className="text-2xl font-bold mb-1">{value}</h3>
                <p className="text-xs opacity-90 font-medium uppercase tracking-wider">{title}</p>
            </div>
            <Icon size={40} className="text-white/30 absolute right-2 top-4" />
        </div>
        <a href="#" className="bg-black/10 hover:bg-black/20 text-white text-center py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-colors shrink-0">
            {linkText} <ArrowRight size={12} />
        </a>
    </div>
);

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback for demo if API fails
            setStats({
                stats: {
                    trash_collected: "1,250",
                    active_bins: 42,
                    new_users: 156,
                    total_participants: "2,400"
                },
                chart_data: [
                    { name: 'Jan', bottles: 4000 },
                    { name: 'Feb', bottles: 3000 },
                    { name: 'Mar', bottles: 2000 },
                    { name: 'Apr', bottles: 2780 },
                    { name: 'May', bottles: 1890 },
                    { name: 'Jun', bottles: 2390 },
                    { name: 'Jul', bottles: 3490 },
                ],
                recent_transactions: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    Home / <span className="text-gray-800">Dashboard</span>
                </div>
            </div>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBox 
                    color="bg-admin-info" 
                    icon={TrendingUp} 
                    title="Trash Collected (Bottles)" 
                    value={stats.stats.trash_collected} 
                    linkText="View Stats" 
                />
                <InfoBox 
                    color="bg-admin-success" 
                    icon={Trash2} 
                    title="Active IoT Bins" 
                    value={stats.stats.active_bins} 
                    linkText="Check status" 
                />
                <InfoBox 
                    color="bg-admin-warning" 
                    icon={UserPlus} 
                    title="New Mobile Users" 
                    value={stats.stats.new_users} 
                    linkText="Manage users" 
                />
                <InfoBox 
                    color="bg-admin-danger" 
                    icon={Users} 
                    title="Total Participants" 
                    value={stats.stats.total_participants} 
                    linkText="Detailed list" 
                />
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Trends */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Waste Collection Trends</h3>
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="bottles" stroke="#007bff" fillOpacity={1} fill="url(#colorOrganic)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Regional Bins Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Recycling Participation</h3>
                    </div>
                    <div className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="bottles" fill="#17a2b8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                                <th className="px-6 py-3 font-semibold">Location</th>
                                <th className="px-6 py-3 font-semibold">Points</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recent_transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-admin-primary/10 text-admin-primary flex items-center justify-center font-bold text-xs">
                                            {t.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{t.user_name}</p>
                                            <p className="text-[10px] text-gray-500">USER-{t.user_id.toString().padStart(5, '0')}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{t.location}</td>
                                    <td className={`px-6 py-4 font-semibold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'deposit' ? '+' : '-'}{t.points}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-admin-success' : 'bg-admin-warning'}`}></div>
                                            <span className="capitalize">{t.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">{t.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stats.recent_transactions.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">No recent transactions found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
