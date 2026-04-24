<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SmartBin;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Info Box Stats
        $totalBottles = Transaction::sum('bottles_count');
        $activeBins = SmartBin::whereIn('status', ['active', 'online'])->count();
        $newUsers = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $totalParticipants = User::count();

        // Chart Data: Waste Collection Trends (Last 7 months)
        $trends = Transaction::select(
            DB::raw('strftime("%m", created_at) as month'),
            DB::raw('SUM(CASE WHEN type = "deposit" THEN bottles_count ELSE 0 END) as bottles')
        )
        ->where('created_at', '>=', Carbon::now()->subMonths(7))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Map months to names for chart
        $monthNames = ['01' => 'Jan', '02' => 'Feb', '03' => 'Mar', '04' => 'Apr', '05' => 'May', '06' => 'Jun', '07' => 'Jul', '08' => 'Aug', '09' => 'Sep', '10' => 'Oct', '11' => 'Nov', '12' => 'Dec'];
        
        $chartData = $trends->map(function($item) use ($monthNames) {
            return [
                'name' => $monthNames[$item->month] ?? $item->month,
                'bottles' => $item->bottles,
            ];
        });

        // Recent Transactions
        $recentTransactions = Transaction::with(['user', 'smartBin'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'user_name' => $t->user->name ?? 'Unknown',
                    'user_id' => $t->user->id ?? 0,
                    'type' => $t->type,
                    'location' => $t->smartBin->name ?? 'Mobile App',
                    'points' => $t->points,
                    'status' => $t->status,
                    'date' => $t->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'trash_collected' => number_format($totalBottles),
                    'active_bins' => $activeBins,
                    'new_users' => $newUsers,
                    'total_participants' => $totalParticipants,
                ],
                'chart_data' => $chartData,
                'recent_transactions' => $recentTransactions
            ]
        ]);
    }
}
