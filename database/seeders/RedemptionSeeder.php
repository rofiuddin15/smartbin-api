<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\PointTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RedemptionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('status', 'active')->limit(5)->get();

        if ($users->isEmpty()) {
            return;
        }

        foreach ($users as $index => $user) {
            // Ensure user has enough points
            if ($user->total_points < 10000) {
                $user->total_points += 15000;
                $user->save();
            }

            $redeems = [
                [
                    'points' => 5000,
                    'amount' => 50000,
                    'type' => 'gopay',
                    'status' => 'pending'
                ],
                [
                    'points' => 2500,
                    'amount' => 25000,
                    'type' => 'ovo',
                    'status' => 'completed'
                ],
                [
                    'points' => 10000,
                    'amount' => 100000,
                    'type' => 'dana',
                    'status' => 'pending'
                ]
            ];

            $redeemData = $redeems[$index % count($redeems)];

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'redeem',
                'points' => -$redeemData['points'],
                'ewallet_type' => $redeemData['type'],
                'ewallet_account' => '08' . rand(100000000, 999999999),
                'ewallet_amount' => $redeemData['amount'],
                'status' => $redeemData['status'],
                'notes' => "Redeem points via Seeder",
                'created_at' => now()->subHours(rand(1, 72)),
            ]);

            PointTransaction::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'points_before' => $user->total_points,
                'points_change' => -$redeemData['points'],
                'points_after' => $user->total_points - $redeemData['points'],
                'description' => "Redeem to {$redeemData['type']}",
            ]);

            $user->total_points -= $redeemData['points'];
            $user->save();
        }
    }
}
