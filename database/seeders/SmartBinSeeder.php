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
        $users = \App\Models\User::all();
        $staffCount = $users->count();

        $bins = [
            [
                'bin_code' => 'SB001',
                'name' => 'Smart Bin - Arek Lancor',
                'location' => 'Pusat Kota Pamekasan, Jl. Panglima Sudirman',
                'responsible_person' => $staffCount > 0 ? $users->get(0 % $staffCount)->name : 'Bpk. Ahmad Fauzi',
                'username' => 'arek_lancor_01',
                'password' => bcrypt('password123'),
                'latitude' => -7.1574,
                'longitude' => 113.4718,
                'status' => 'online',
                'capacity_percentage' => 45,
                'total_bottles_collected' => 1250,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB002',
                'name' => 'Smart Bin - UIM Bettet',
                'location' => 'Kampus UIM, Bettet, Pamekasan',
                'responsible_person' => $staffCount > 0 ? $users->get(1 % $staffCount)->name : 'Ibu Siti Aminah',
                'username' => 'uim_bettet_02',
                'password' => bcrypt('password123'),
                'latitude' => -7.1322,
                'longitude' => 113.4764,
                'status' => 'online',
                'capacity_percentage' => 65,
                'total_bottles_collected' => 840,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB003',
                'name' => 'Smart Bin - IAIN Madura',
                'location' => 'Kampus IAIN, Panglegur, Pamekasan',
                'responsible_person' => $staffCount > 0 ? $users->get(2 % $staffCount)->name : 'Bpk. Hendra Wijaya',
                'username' => 'iain_madura_03',
                'password' => bcrypt('password123'),
                'latitude' => -7.1932,
                'longitude' => 113.4746,
                'status' => 'online',
                'capacity_percentage' => 20,
                'total_bottles_collected' => 450,
                'last_online_at' => now(),
            ],
            [
                'bin_code' => 'SB004',
                'name' => 'Smart Bin - RSUD Smart',
                'location' => 'RSUD Smart, Pamekasan',
                'responsible_person' => $staffCount > 0 ? $users->get(3 % $staffCount)->name : 'Dr. Bambang',
                'username' => 'rsud_smart_04',
                'password' => bcrypt('password123'),
                'latitude' => -7.1654,
                'longitude' => 113.4912,
                'status' => 'offline',
                'capacity_percentage' => 85,
                'total_bottles_collected' => 2100,
                'last_online_at' => now()->subHours(2),
            ],
            [
                'bin_code' => 'SB005',
                'name' => 'Smart Bin - Terminal Pamekasan',
                'location' => 'Terminal Bus Pamekasan, Ceguk',
                'responsible_person' => $staffCount > 0 ? $users->get(4 % $staffCount)->name : 'Bpk. Yusuf',
                'username' => 'terminal_pmk_05',
                'password' => bcrypt('password123'),
                'latitude' => -7.2001,
                'longitude' => 113.4832,
                'status' => 'full',
                'capacity_percentage' => 98,
                'total_bottles_collected' => 3200,
                'last_online_at' => now(),
            ],
        ];

        foreach ($bins as $bin) {
            SmartBin::create($bin);
        }
    }
}
