<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FinanceAndSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Initial Settings
        \App\Models\Setting::firstOrCreate(
            ['key' => 'point_to_idr_rate'],
            ['type' => 'number', 'value' => '10', 'description' => 'Konversi 1 Poin ke Rupiah untuk pencairan E-Money']
        );

        \App\Models\Setting::firstOrCreate(
            ['key' => 'revenue_margin_percent'],
            ['type' => 'number', 'value' => '400', 'description' => 'Persentase margin keuntungan perusahaan dari setiap poin (misal 400% berarti jika 1 Poin = Rp10, maka Aset bertambah Rp50)']
        );

        // 2. Initial Capital (Modal Awal)
        if (\App\Models\FinanceLedger::count() === 0) {
            \App\Models\FinanceLedger::create([
                'type' => 'income',
                'category' => 'capital',
                'amount' => 50000000, // 50 Juta
                'description' => 'Suntikan Modal Awal / Anggaran Dasar',
            ]);
        }
    }
}
