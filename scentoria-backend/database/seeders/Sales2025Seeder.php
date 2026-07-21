<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

/**
 * Test/demo data only — backfills `monthly_sales_reports` for 2025 so the
 * dashboard's "All time" view (which groups monthly_sales_reports by year)
 * has a full prior year to show and compare against, instead of just the
 * current year's partial data.
 *
 * Safe to re-run: uses updateOrInsert keyed on year_month, so it won't
 * create duplicates.
 */
class Sales2025Seeder extends Seeder
{
    public function run(): void
    {
        // Rough seasonality: quieter start of year, ramps up, holiday-season
        // spike in Nov/Dec — just enough shape to make the yearly chart look
        // like real data instead of a flat line.
        $monthlyRevenue = [
            '01' => 850_000,
            '02' => 920_000,
            '03' => 1_050_000,
            '04' => 980_000,
            '05' => 1_150_000,
            '06' => 1_300_000,
            '07' => 1_250_000,
            '08' => 1_400_000,
            '09' => 1_550_000,
            '10' => 1_700_000,
            '11' => 2_100_000,
            '12' => 2_650_000,
        ];

        $generatedAt = Carbon::create(2026, 1, 1, 2, 0, 0);

        foreach ($monthlyRevenue as $month => $revenue) {
            DB::table('monthly_sales_reports')->updateOrInsert(
                ['year_month' => "2025{$month}"],
                [
                    'total_revenue' => $revenue,
                    'generated_at' => $generatedAt,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $this->command?->info('Seeded 2025 monthly_sales_reports: 12 rows, total '
            . number_format(array_sum($monthlyRevenue)) . ' MMK.');
    }
}