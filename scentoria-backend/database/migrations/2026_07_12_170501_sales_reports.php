<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * These two tables are the *read side* of the sales report.
     * Nothing writes to them except RunSalesBatchCommand, after the
     * COBOL job finishes — the React page only ever selects from here,
     * so the page load never has to wait on aggregation.
     */
    public function up(): void
    {
        Schema::create('monthly_sales_reports', function (Blueprint $table) {
            $table->id();
            $table->char('year_month', 6); // e.g. "202607"
            $table->unsignedBigInteger('total_revenue')->default(0);
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique('year_month');
        });

        Schema::create('product_sales_reports', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->unsignedInteger('quantity_sold')->default(0);
            $table->unsignedBigInteger('revenue')->default(0);
            $table->unsignedInteger('rank')->default(0);
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sales_reports');
        Schema::dropIfExists('monthly_sales_reports');
    }
};