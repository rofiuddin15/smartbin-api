<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FinanceLedger;
use App\Models\Setting;
use App\Models\User;
use App\Models\Transaction;
use App\Models\PointTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function getDashboard()
    {
        // 1. Dapatkan Setting Konversi
        $pointRate = Setting::where('key', 'point_to_idr_rate')->value('value') ?? 10;
        $marginPercent = Setting::where('key', 'revenue_margin_percent')->value('value') ?? 400;

        // 2. Hitung Liabilitas (Hutang Poin ke Member)
        $totalPointsUser = User::sum('total_points');
        $liabilitiesIdr = $totalPointsUser * $pointRate;

        // 3. Hitung Pendapatan & Pengeluaran dari Ledger (Atau fallback ke Transaksi historis jika belum ada di Ledger)
        // Kita hitung dari Transaksi saja agar selalu sinkron dengan histori yang sudah ada sebelum fitur ledger dibuat.
        // Pengeluaran = Redeem yang sukses (points_change < 0)
        $totalRedeemPoints = abs(PointTransaction::where('points_change', '<', 0)->sum('points_change'));
        $totalPengeluaranPoinIdr = $totalRedeemPoints * $pointRate;

        // Pendapatan = Total Botol * Nilai Aset per Botol (points_change > 0)
        $totalDepositPoints = PointTransaction::where('points_change', '>', 0)->sum('points_change');
        $nilaiAsetPerPoin = $pointRate * ($marginPercent / 100);
        $totalPendapatanPoinIdr = $totalDepositPoints * $nilaiAsetPerPoin;

        // Ledger Manual Calculations
        $manualIncome = FinanceLedger::where('type', 'income')->where('category', '!=', 'capital')->sum('amount');
        $manualExpenses = FinanceLedger::where('type', 'expense')->sum('amount');
        $totalCapital = FinanceLedger::where('category', 'capital')->sum('amount');

        $totalPendapatanIdr = $totalPendapatanPoinIdr + $manualIncome;
        $totalPengeluaranIdr = $totalPengeluaranPoinIdr + $manualExpenses;
        $anggaranTersisa = $totalCapital + $totalPendapatanIdr - $totalPengeluaranIdr;

        // 4. Data Chart (Cash Flow) - 4 Minggu Terakhir
        $chartData = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = Carbon::now()->startOfWeek()->subWeeks($i);
            $end = Carbon::now()->endOfWeek()->subWeeks($i);
            
            $depPoints = PointTransaction::where('points_change', '>', 0)->whereBetween('created_at', [$start, $end])->sum('points_change');
            $redPoints = abs(PointTransaction::where('points_change', '<', 0)->whereBetween('created_at', [$start, $end])->sum('points_change'));
            
            $mIncome = FinanceLedger::where('type', 'income')->where('category', '!=', 'capital')->whereBetween('created_at', [$start, $end])->sum('amount');
            $mExpense = FinanceLedger::where('type', 'expense')->whereBetween('created_at', [$start, $end])->sum('amount');

            $chartData[] = [
                'name' => 'Mg ' . ($start->weekOfMonth) . ' ' . $start->format('M'),
                'pendapatan' => ($depPoints * $nilaiAsetPerPoin) + $mIncome,
                'pengeluaran' => ($redPoints * $pointRate) + $mExpense,
            ];
        }

        // 5. Distribusi Pencairan (Pie Chart)
        $distribution = PointTransaction::where('points_change', '<', 0)
            ->select('description', DB::raw('count(*) as count'), DB::raw('sum(points_change) as total_points'))
            ->groupBy('description')
            ->get();
            
        $pieData = [];
        foreach ($distribution as $dist) {
            $name = 'Lainnya';
            $desc = $dist->description ?? '';
            if (stripos($desc, 'GoPay') !== false) $name = 'GoPay';
            elseif (stripos($desc, 'OVO') !== false) $name = 'OVO';
            elseif (stripos($desc, 'Dana') !== false) $name = 'Dana';
            
            $existing = array_search($name, array_column($pieData, 'name'));
            $pts = abs((float)$dist->total_points);
            if ($existing !== false) {
                $pieData[$existing]['value'] += $pts;
            } else {
                $pieData[] = ['name' => $name, 'value' => $pts];
            }
        }

        // 6. Log Riwayat Keuangan (Combined)
        $pointLogs = PointTransaction::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($pt) use ($pointRate, $nilaiAsetPerPoin) {
                $isDeposit = $pt->points_change > 0;
                $pts = abs($pt->points_change);
                return [
                    'id' => 'TRX-' . str_pad($pt->id, 5, '0', STR_PAD_LEFT),
                    'category' => $isDeposit ? 'deposit' : 'redeem',
                    'amount' => $isDeposit ? ($pts * $nilaiAsetPerPoin) : ($pts * $pointRate),
                    'description' => $pt->description ?? ($isDeposit ? 'Setoran Sampah' : 'Pencairan Poin'),
                    'user_name' => $pt->user->name ?? 'System',
                    'created_at' => $pt->created_at->toISOString(),
                ];
            });

        $manualLogs = FinanceLedger::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($l) {
                return [
                    'id' => 'LDG-' . str_pad($l->id, 5, '0', STR_PAD_LEFT),
                    'category' => $l->type === 'income' ? 'deposit' : 'redeem',
                    'amount' => (float)$l->amount,
                    'description' => $l->description,
                    'user_name' => 'Admin',
                    'created_at' => $l->created_at->toISOString(),
                ];
            });

        $combinedLogs = $pointLogs->concat($manualLogs)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'cards' => [
                    'pendapatan' => $totalPendapatanIdr,
                    'liabilitas' => $liabilitiesIdr,
                    'pengeluaran' => $totalPengeluaranIdr,
                    'saldo_anggaran' => $anggaranTersisa,
                ],
                'chart_data' => $chartData,
                'distribution_data' => $pieData,
                'recent_logs' => $combinedLogs,
                'settings' => [
                    'point_to_idr_rate' => $pointRate,
                    'revenue_margin_percent' => $marginPercent,
                ]
            ]
        ]);
    }

    public function storeLedger(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:income,expense',
            'category' => 'required|string|in:deposit,redeem,capital,operational,maintenance,waste_sale,admin_fee,other',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
        ]);

        $ledger = FinanceLedger::create([
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'description' => $request->description,
        ]);

        return response()->json(['success' => true, 'data' => $ledger, 'message' => 'Transaksi berhasil dicatat.']);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'point_to_idr_rate' => 'required|numeric|min:1',
            'revenue_margin_percent' => 'required|numeric|min:0',
        ]);

        Setting::updateOrCreate(
            ['key' => 'point_to_idr_rate'],
            ['value' => $request->point_to_idr_rate]
        );

        Setting::updateOrCreate(
            ['key' => 'revenue_margin_percent'],
            ['value' => $request->revenue_margin_percent]
        );

        return response()->json(['success' => true, 'message' => 'Pengaturan keuangan berhasil diperbarui.']);
    }

    public function exportReport(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
        ]);

        $month = $request->month;
        $year = $request->year;

        // 1. Get Settings
        $pointRate = Setting::where('key', 'point_to_idr_rate')->value('value') ?? 10;
        $marginPercent = Setting::where('key', 'revenue_margin_percent')->value('value') ?? 400;
        $nilaiAsetPerPoin = $pointRate * ($marginPercent / 100);

        // 2. Fetch Data
        $pointTransactions = PointTransaction::with('user')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->get();

        $ledgers = FinanceLedger::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->get();

        // 3. Generate CSV
        $filename = "Laporan_Keuangan_{$year}_{$month}.csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($pointTransactions, $ledgers, $pointRate, $nilaiAsetPerPoin) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID Transaksi', 'Kategori', 'Nama User/Admin', 'Deskripsi', 'Nominal (IDR)', 'Tanggal']);

            foreach ($pointTransactions as $t) {
                $isDeposit = $t->points_change > 0;
                $pts = abs($t->points_change);
                $nominal = $isDeposit ? ($pts * $nilaiAsetPerPoin) : ($pts * $pointRate);
                
                fputcsv($file, [
                    'TRX-' . str_pad($t->id, 5, '0', STR_PAD_LEFT),
                    $isDeposit ? 'Tabungan Member (Aset)' : 'Penarikan/Payout',
                    $t->user->name ?? 'System',
                    $t->description ?? ($isDeposit ? 'Setoran Sampah' : 'Pencairan Poin'),
                    round($nominal),
                    $t->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            foreach ($ledgers as $l) {
                fputcsv($file, [
                    'LDG-' . str_pad($l->id, 5, '0', STR_PAD_LEFT),
                    $l->type === 'income' ? 'Pemasukan Kas (Realized)' : 'Biaya/Pengeluaran Manual',
                    'Admin',
                    $l->description,
                    round($l->amount),
                    $l->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function getIncomeList()
    {
        $pointRate = Setting::where('key', 'point_to_idr_rate')->value('value') ?? 10;
        $marginPercent = Setting::where('key', 'revenue_margin_percent')->value('value') ?? 400;
        $nilaiAsetPerPoin = $pointRate * ($marginPercent / 100);

        $pointIncomes = PointTransaction::with('user')
            ->where('points_change', '>', 0)
            ->get()
            ->map(function($pt) use ($nilaiAsetPerPoin) {
                return [
                    'id' => 'TRX-' . str_pad($pt->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'income',
                    'category' => 'deposit',
                    'amount' => abs($pt->points_change) * $nilaiAsetPerPoin,
                    'description' => $pt->description ?? 'Setoran Sampah',
                    'entity_name' => $pt->user->name ?? 'System',
                    'created_at' => $pt->created_at->toISOString(),
                ];
            });

        $manualIncomes = FinanceLedger::where('type', 'income')
            ->get()
            ->map(function($l) {
                return [
                    'id' => 'LDG-' . str_pad($l->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'income',
                    'category' => $l->category,
                    'amount' => (float)$l->amount,
                    'description' => $l->description,
                    'entity_name' => 'Admin',
                    'created_at' => $l->created_at->toISOString(),
                ];
            });

        $combined = $pointIncomes->concat($manualIncomes)->sortByDesc('created_at')->values();
        
        return response()->json(['success' => true, 'data' => $combined]);
    }

    public function getExpenseList()
    {
        $pointRate = Setting::where('key', 'point_to_idr_rate')->value('value') ?? 10;

        $pointExpenses = PointTransaction::with('user')
            ->where('points_change', '<', 0)
            ->get()
            ->map(function($pt) use ($pointRate) {
                return [
                    'id' => 'TRX-' . str_pad($pt->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'expense',
                    'category' => 'redeem',
                    'amount' => abs($pt->points_change) * $pointRate,
                    'description' => $pt->description ?? 'Pencairan Poin',
                    'entity_name' => $pt->user->name ?? 'System',
                    'created_at' => $pt->created_at->toISOString(),
                ];
            });

        $manualExpenses = FinanceLedger::where('type', 'expense')
            ->get()
            ->map(function($l) {
                return [
                    'id' => 'LDG-' . str_pad($l->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'expense',
                    'category' => $l->category,
                    'amount' => (float)$l->amount,
                    'description' => $l->description,
                    'entity_name' => 'Admin',
                    'created_at' => $l->created_at->toISOString(),
                ];
            });

        $combined = $pointExpenses->concat($manualExpenses)->sortByDesc('created_at')->values();
        
        return response()->json(['success' => true, 'data' => $combined]);
    }
}
