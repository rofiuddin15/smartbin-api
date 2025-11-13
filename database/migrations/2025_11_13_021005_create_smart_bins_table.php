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
        Schema::create('smart_bins', function (Blueprint $table) {
            $table->id();
            $table->string('bin_code')->unique(); // Unique identifier for the bin
            $table->string('name'); // Nama/lokasi bin
            $table->string('location'); // Alamat lengkap
            $table->decimal('latitude', 10, 8)->nullable(); // GPS coordinates
            $table->decimal('longitude', 11, 8)->nullable(); // GPS coordinates
            $table->enum('status', ['online', 'offline', 'full', 'maintenance'])->default('online');
            $table->integer('capacity_percentage')->default(0); // 0-100
            $table->integer('total_bottles_collected')->default(0);
            $table->timestamp('last_online_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smart_bins');
    }
};
