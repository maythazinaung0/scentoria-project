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
    $existing = DB::table('daily_sales_reports')->pluck('total_revenue', 'date');

    $series = collect(range(29, 0))->map(function ($daysAgo) use ($existing) {
        $date = Carbon::now()->subDays($daysAgo)->format('Ymd');
        return ['label' => $date, 'total_revenue' => (int) ($existing[$date] ?? 0)];
    })->values();

    // Same 30-day window, shifted back 30 more days, aligned by position
    // (not date) so point i lines up with point i of the current series.
    $previousSeries = collect(range(59, 30))->map(function ($daysAgo) use ($existing) {
        $date = Carbon::now()->subDays($daysAgo)->format('Ymd');
        return ['label' => $date, 'total_revenue' => (int) ($existing[$date] ?? 0)];
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
        'previous_period_series' => $previousSeries,
        'generated_at' => DB::table('daily_sales_reports')->max('generated_at'),
    ];
}

public function monthReport(): array
{
    $existing = DB::table('monthly_sales_reports')->pluck('total_revenue', 'year_month');

    $series = collect(range(11, 0))->map(function ($monthsAgo) use ($existing) {
        $ym = Carbon::now()->subMonths($monthsAgo)->format('Ym');
        return ['label' => $ym, 'total_revenue' => (int) ($existing[$ym] ?? 0)];
    })->values();

    // Prior 12-month window, aligned by position for the same reason as above.
    $previousSeries = collect(range(23, 12))->map(function ($monthsAgo) use ($existing) {
        $ym = Carbon::now()->subMonths($monthsAgo)->format('Ym');
        return ['label' => $ym, 'total_revenue' => (int) ($existing[$ym] ?? 0)];
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
        'previous_period_series' => $previousSeries,
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

    public function productPerformance(): \Illuminate\Support\Collection
{
    $products = DB::table('product_sales_reports')
        ->orderBy('rank')
        ->get(['product_name', 'quantity_sold', 'revenue', 'rank']);

    $totalRevenue = $products->sum('revenue');

    return $products->map(fn ($p) => [
        'product_name' => $p->product_name,
        'quantity_sold' => $p->quantity_sold,
        'revenue' => $p->revenue,
        'rank' => $p->rank,
        'revenue_share' => $totalRevenue > 0
            ? round(($p->revenue / $totalRevenue) * 100, 1)
            : 0,
    ])->values();
}
}