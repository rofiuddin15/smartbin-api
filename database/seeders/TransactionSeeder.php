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
        $users = User::role('user')->where('status', 'active')->get();
        $bins = SmartBin::all();

        if ($users->isEmpty() || $bins->isEmpty()) {
            return;
        }

        // Create 50 random deposit transactions over the last 6 months
        for ($i = 0; $i < 50; $i++) {
            $date = Carbon::now()->subDays(rand(0, 180));
            
            Transaction::create([
                'user_id' => $users->random()->id,
                'smart_bin_id' => $bins->random()->id,
                'type' => 'deposit',
                'points' => rand(50, 500),
                'bottles_count' => rand(5, 50),
                'status' => 'completed',
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
