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
            case 'pending': return { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending Approval' };
            case 'completed': return { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Processed' };
            case 'failed': return { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' };
            default: return { color: 'bg-gray-100 text-gray-700', icon: Clock, label: status };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">E-Money Payouts</h1>
                    <p className="text-sm text-gray-500">Review and process user point redemption requests</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
                        <Download size={16} />
                        Export Log
                    </button>
                    <button className="bg-admin-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                        Process Batch
                    </button>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50/30 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Wallet size={18} className="text-admin-info" />
                        Payout Queue
                    </h3>
                    <div className="flex items-center gap-3">
                        <select className="text-xs border-gray-300 rounded focus:ring-admin-primary focus:border-admin-primary px-2 py-1">
                            <option value="all">All Wallets</option>
                            <option value="gopay">GoPay</option>
                            <option value="ovo">OVO</option>
                            <option value="dana">Dana</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Request ID</th>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Redeem Details</th>
                                <th className="px-6 py-4 font-semibold">Payout Destination</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts.map((req) => {
                                const status = getStatusInfo(req.status);
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{req.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{req.user_name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">Rp {req.amount_idr.toLocaleString()}</span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Coins size={10} /> {req.points.toLocaleString()} Points
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                                                    {req.ewallet_type.substring(0, 3)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold">{req.ewallet_type}</span>
                                                    <span className="text-[10px] font-mono text-gray-500">{req.ewallet_account}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
                                                <status.icon size={12} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="bg-admin-success text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-green-700 transition-colors shadow-sm">
                                                        Approve
                                                    </button>
                                                    <button className="bg-white border border-admin-danger text-admin-danger px-3 py-1 rounded text-[10px] font-bold hover:bg-admin-danger hover:text-white transition-all">
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="p-1.5 text-gray-400 hover:text-admin-primary rounded">
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

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                    <p className="text-[10px] text-gray-500 italic">Total Pending Payout: <span className="font-bold text-gray-700">Rp 150,000</span></p>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-gray-400">Page 1 of 5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointRedemptionPage;
