<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Reads the pre-aggregated report tables that `sales:run-batch` populates.
 * Shared by SalesReportController (the full report page) and AdminController
 * (the dashboard), so both surfaces show identical revenue numbers instead of
 * each computing their own version.
 */
class SalesReportService
{
    public function dayReport(): array
    {
        // Every day is present in the series, even ones with zero revenue —
        // otherwise the chart only shows the handful of days that happen to
        // have orders, and those few bars stretch to fill the whole width.
        $existing = DB::table('daily_sales_reports')->pluck('total_revenue', 'date');

        $series = collect(range(29, 0))->map(function ($daysAgo) use ($existing) {
            $date = Carbon::now()->subDays($daysAgo)->format('Ymd');
            return [
                'label' => $date,
                'total_revenue' => (int) ($existing[$date] ?? 0),
            ];
        })->values();

        $today = Carbon::now()->format('Ymd');
        $yesterday = Carbon::now()->subDay()->format('Ymd');
        $currentRevenue = (int) ($existing[$today] ?? 0);
        $previousRevenue = (int) ($existing[$yesterday] ?? 0);

        return [
            'period' => 'day',
            'current_period_revenue' => $currentRevenue,
            'growth_percent' => $this->growth($currentRevenue, $previousRevenue),
            'revenue_series' => $series,
            'generated_at' => DB::table('daily_sales_reports')->max('generated_at'),
        ];
    }

    public function monthReport(): array
    {
        // Same reasoning as dayReport() — always show the last 12 calendar
        // months, zero-filled, instead of only months that had any orders.
        $existing = DB::table('monthly_sales_reports')->pluck('total_revenue', 'year_month');

        $series = collect(range(11, 0))->map(function ($monthsAgo) use ($existing) {
            $ym = Carbon::now()->subMonths($monthsAgo)->format('Ym');
            return [
                'label' => $ym,
                'total_revenue' => (int) ($existing[$ym] ?? 0),
            ];
        })->values();

        $currentMonth = Carbon::now()->format('Ym');
        $previousMonth = Carbon::now()->subMonth()->format('Ym');
        $currentRevenue = (int) ($existing[$currentMonth] ?? 0);
        $previousRevenue = (int) ($existing[$previousMonth] ?? 0);

        return [
            'period' => 'month',
            'current_period_revenue' => $currentRevenue,
            'growth_percent' => $this->growth($currentRevenue, $previousRevenue),
            'revenue_series' => $series,
            'generated_at' => DB::table('monthly_sales_reports')->max('generated_at'),
        ];
    }

    public function allTimeReport(): array
    {
        $yearly = DB::table('monthly_sales_reports')
            ->selectRaw('LEFT(`year_month`, 4) as label, SUM(total_revenue) as total_revenue')
            ->groupByRaw('LEFT(`year_month`, 4)')
            ->orderByRaw('LEFT(`year_month`, 4) asc')
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label,
                'total_revenue' => (int) $row->total_revenue,
            ]);

        $total = (int) $yearly->sum('total_revenue');

        $currentYear = Carbon::now()->format('Y');
        $previousYear = Carbon::now()->subYear()->format('Y');
        $currentRevenue = (int) ($yearly->firstWhere('label', $currentYear)['total_revenue'] ?? 0);
        $previousRevenue = (int) ($yearly->firstWhere('label', $previousYear)['total_revenue'] ?? 0);

        return [
            'period' => 'all',
            'current_period_revenue' => $total,
            'growth_percent' => $this->growth($currentRevenue, $previousRevenue),
            'revenue_series' => $yearly->values(),
            'generated_at' => DB::table('monthly_sales_reports')->max('generated_at'),
        ];
    }

    public function topProducts()
    {
        return DB::table('product_sales_reports')
            ->orderBy('rank')
            ->limit(3)
            ->get(['product_name', 'quantity_sold', 'revenue', 'rank']);
    }

    private function growth(int $current, int $previous): ?float
    {
        return $previous > 0
            ? round((($current - $previous) / $previous) * 100, 1)
            : null;
    }
}