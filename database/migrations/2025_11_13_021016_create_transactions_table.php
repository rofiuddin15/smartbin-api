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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('smart_bin_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['deposit', 'redeem']); // deposit = setor botol, redeem = tukar poin
            $table->integer('points'); // Positive for deposit, negative for redeem
            $table->integer('bottles_count')->nullable(); // For deposit transactions
            $table->string('ewallet_type')->nullable(); // gopay, ovo, dana, etc
            $table->string('ewallet_account')->nullable(); // Phone number or account
            $table->decimal('ewallet_amount', 10, 2)->nullable(); // Amount in Rupiah
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
