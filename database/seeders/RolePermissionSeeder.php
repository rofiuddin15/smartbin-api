<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions for both guards
        $permissions = [
            'manage_dashboard',
            'manage_users',
            'manage_staff',
            'manage_roles',
            'manage_bins',
            'manage_payouts',
            'view_finance',
            'delete_data',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // --- WEB ROLES ---
        $adminRoleWeb = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRoleWeb->syncPermissions(Permission::where('guard_name', 'web')->get());

        $operatorRoleWeb = Role::firstOrCreate(['name' => 'operator', 'guard_name' => 'web']);
        $operatorRoleWeb->syncPermissions(Permission::whereIn('name', ['manage_dashboard', 'manage_users', 'manage_bins'])->where('guard_name', 'web')->get());

        $financeRoleWeb = Role::firstOrCreate(['name' => 'finance', 'guard_name' => 'web']);
        $financeRoleWeb->syncPermissions(Permission::whereIn('name', ['manage_dashboard', 'manage_payouts', 'view_finance'])->where('guard_name', 'web')->get());

        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        // --- API ROLES ---
        $adminRoleApi = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $adminRoleApi->syncPermissions(Permission::where('guard_name', 'api')->get());

        $operatorRoleApi = Role::firstOrCreate(['name' => 'operator', 'guard_name' => 'api']);
        $operatorRoleApi->syncPermissions(Permission::whereIn('name', ['manage_dashboard', 'manage_users', 'manage_bins'])->where('guard_name', 'api')->get());

        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'api']);

        // --- USERS SEEDING WITH UNIQUE PHONE NUMBERS ---
        
        // 1. Super Admin
        $admin = User::where('email', 'admin@smartbin.example')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Super Admin',
                'email' => 'admin@smartbin.example',
                'password' => Hash::make('password'),
                'phone_number' => '089900000001',
                'pin' => Hash::make('123456'),
                'total_points' => 0,
                'status' => 'active',
                'is_verified' => true,
            ]);
        }
        $admin->syncRoles(['admin']);

        // 2. Operator Staff
        $operator = User::where('email', 'operator@smartbin.example')->first();
        if (!$operator) {
            $operator = User::create([
                'name' => 'Budi Operation',
                'email' => 'operator@smartbin.example',
                'password' => Hash::make('password'),
                'phone_number' => '089900000002',
                'pin' => Hash::make('123456'),
                'total_points' => 0,
                'status' => 'active',
                'is_verified' => true,
            ]);
        }
        $operator->syncRoles(['operator']);

        // 3. Finance Staff
        $finance = User::where('email', 'finance@smartbin.example')->first();
        if (!$finance) {
            $finance = User::create([
                'name' => 'Ani Finance',
                'email' => 'finance@smartbin.example',
                'password' => Hash::make('password'),
                'phone_number' => '089900000003',
                'pin' => Hash::make('123456'),
                'total_points' => 0,
                'status' => 'active',
                'is_verified' => true,
            ]);
        }
        $finance->syncRoles(['finance']);
    }
}
