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
        Schema::table('smart_bins', function (Blueprint $table) {
            $table->string('responsible_person')->nullable()->after('location');
            $table->string('username')->unique()->nullable()->after('responsible_person');
            $table->string('password')->nullable()->after('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('smart_bins', function (Blueprint $table) {
            $table->dropColumn(['responsible_person', 'username', 'password']);
        });
    }
};
