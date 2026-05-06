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
        
        $participantQuery = User::whereDoesntHave('roles', function($q) {
            $q->whereIn('name', ['admin', 'operator', 'finance']);
        });

        $newUsers = (clone $participantQuery)->where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $totalParticipants = $participantQuery->count();

        // Generate the last 7 months labels
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthKey = $month->format('m');
            $yearKey = $month->format('Y');
            $chartData[$yearKey . '-' . $monthKey] = [
                'name' => $month->format('M'),
                'bottles' => 0,
                'sort_key' => $month->format('Y-m')
            ];
        }

        $driver = DB::getDriverName();
        $dateFunc = $driver === 'sqlite' ? "strftime('%Y-%m', created_at)" : "DATE_FORMAT(created_at, '%Y-%m')";

        $trends = Transaction::select(
            DB::raw("$dateFunc as month_year"),
            DB::raw('SUM(CASE WHEN type = "deposit" THEN bottles_count ELSE 0 END) as bottles')
        )
        ->where('created_at', '>=', Carbon::now()->subMonths(7)->startOfMonth())
        ->groupBy('month_year')
        ->get();

        foreach ($trends as $trend) {
            if (isset($chartData[$trend->month_year])) {
                $chartData[$trend->month_year]['bottles'] = (int)$trend->bottles;
            }
        }

        $finalChartData = array_values($chartData);

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

        // Location Stats
        $locationStats = Transaction::select(
            'smart_bins.name as location',
            DB::raw('SUM(bottles_count) as total_bottles')
        )
        ->join('smart_bins', 'transactions.smart_bin_id', '=', 'smart_bins.id')
        ->where('type', 'deposit')
        ->groupBy('smart_bins.name')
        ->orderBy('total_bottles', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'trash_collected' => number_format($totalBottles),
                    'active_bins' => $activeBins,
                    'new_users' => $newUsers,
                    'total_participants' => $totalParticipants,
                ],
                'chart_data' => $finalChartData,
                'location_stats' => $locationStats,
                'recent_transactions' => $recentTransactions
            ]
        ]);
    }
}
