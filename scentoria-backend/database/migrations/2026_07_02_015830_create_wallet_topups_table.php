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
        Schema::create('wallet_topups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('deposit_amount');
            $table->enum('topup_channel', ['kbzpay','cbpay']);
            $table->enum('status', ['pending', 'completed', 'rejected'])->default('pending');
            $table->string('transaction_image_url')->nullable();
            $table->string('image_hash', 64)->nullable();
            $table->string('sender_name')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unique(['topup_channel', 'transaction_reference']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_topups');
    }
};
