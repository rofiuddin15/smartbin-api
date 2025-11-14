<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $operatorRole = Role::firstOrCreate(['name' => 'operator']);

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Smart bin management
            'view smart bins',
            'create smart bins',
            'edit smart bins',
            'delete smart bins',
            'manage smart bin status',

            // Transaction management
            'view transactions',
            'create transactions',
            'manage transactions',

            // Redeem management
            'redeem points',
            'view redeem history',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        // Admin has all permissions
        $adminRole->syncPermissions(Permission::all());

        // User role permissions (regular users)
        $userRole->syncPermissions([
            'view smart bins',
            'view transactions',
            'create transactions',
            'redeem points',
            'view redeem history',
        ]);

        // Operator role permissions (for managing smart bins)
        $operatorRole->syncPermissions([
            'view smart bins',
            'create smart bins',
            'edit smart bins',
            'manage smart bin status',
            'view transactions',
        ]);
    }
}
