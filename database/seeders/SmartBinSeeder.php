<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SmartBin;

class SmartBinSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bins = [
            [
                'bin_code' => 'SB001',
                'name' => 'Smart Bin - Mall ABC',
                'location' => 'Jl. Sudirman No. 123, Jakarta',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'status' => 'online',
                'capacity_percentage' => 25,
                'total_bottles_collected' => 150,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB002',
                'name' => 'Smart Bin - Universitas XYZ',
                'location' => 'Jl. Pendidikan No. 45, Jakarta',
                'latitude' => -6.3019,
                'longitude' => 106.8294,
                'status' => 'online',
                'capacity_percentage' => 60,
                'total_bottles_collected' => 320,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB003',
                'name' => 'Smart Bin - Taman Kota',
                'location' => 'Jl. Taman Sari No. 78, Jakarta',
                'latitude' => -6.1751,
                'longitude' => 106.8650,
                'status' => 'online',
                'capacity_percentage' => 15,
                'total_bottles_collected' => 85,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB004',
                'name' => 'Smart Bin - Kantor Pemerintah',
                'location' => 'Jl. Merdeka No. 10, Jakarta',
                'latitude' => -6.2000,
                'longitude' => 106.8166,
                'status' => 'offline',
                'capacity_percentage' => 45,
                'total_bottles_collected' => 210,
                'last_online_at' => now()->subHours(3),
            ],
            [
                'bin_code' => 'SB005',
                'name' => 'Smart Bin - Stasiun Kereta',
                'location' => 'Jl. Stasiun No. 5, Jakarta',
                'latitude' => -6.1666,
                'longitude' => 106.8311,
                'status' => 'full',
                'capacity_percentage' => 95,
                'total_bottles_collected' => 550,
                'last_online_at' => now(),
            ],
        ];

        foreach ($bins as $bin) {
            SmartBin::create($bin);
        }
    }
}
