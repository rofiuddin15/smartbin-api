<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SmartBin;
use App\Models\Transaction;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $bins = SmartBin::all();

        if ($users->isEmpty() || $bins->isEmpty()) {
            return;
        }

        // Create 50 random transactions over the last 6 months
        for ($i = 0; $i < 50; $i++) {
            $type = rand(0, 10) > 2 ? 'deposit' : 'redeem';
            $date = Carbon::now()->subDays(rand(0, 180));
            
            Transaction::create([
                'user_id' => $users->random()->id,
                'smart_bin_id' => $type === 'deposit' ? $bins->random()->id : null,
                'type' => $type,
                'points' => $type === 'deposit' ? rand(50, 500) : rand(100, 1000),
                'bottles_count' => $type === 'deposit' ? rand(5, 50) : 0,
                'status' => 'completed',
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
