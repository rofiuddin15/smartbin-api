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
        Schema::create('finance_ledgers', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'income', 'expense', 'topup'
            $table->string('category'); // 'deposit', 'redeem', 'capital'
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->string('reference_type')->nullable(); // Polymorphic relation if needed
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finance_ledgers');
    }
};
