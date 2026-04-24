<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending')->after('total_points');
            $table->string('rejection_reason')->nullable()->after('status');
            $table->boolean('is_verified')->default(false)->after('rejection_reason');
            $table->string('avatar_url')->nullable()->after('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'rejection_reason', 'is_verified', 'avatar_url']);
        });
    }
};
