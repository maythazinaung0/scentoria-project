<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_sales_reports', function (Blueprint $table) {
            $table->id();
            $table->char('date', 8); // e.g. "20260712" (YYYYMMDD)
            $table->unsignedBigInteger('total_revenue')->default(0);
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_sales_reports');
    }
};