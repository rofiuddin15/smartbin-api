<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RoleSeeder::class,
        ]);

        // Create test users
        $testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '081234567890',
            'pin' => Hash::make('1234'),
            'total_points' => 500,
        ]);
        $testUser->assignRole('user');

        $johnUser = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '081234567891',
            'pin' => Hash::make('5678'),
            'total_points' => 1200,
        ]);
        $johnUser->assignRole('user');

        // Create admin user
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '081234567892',
            'pin' => Hash::make('0000'),
            'total_points' => 0,
        ]);
        $adminUser->assignRole('admin');

        // Call SmartBin seeder
        $this->call([
            SmartBinSeeder::class,
        ]);
    }
}
