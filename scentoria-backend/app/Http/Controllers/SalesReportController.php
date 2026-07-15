<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    // GET /api/admin/sales-report?period=day|month|all
    // Reads only — all the aggregation already happened in the COBOL
    // batch job (nightly, or on demand via runBatch() below).
    public function index(Request $request)
    {
        $period = $request->query('period', 'month');

        return response()->json(match ($period) {
            'day' => $this->dayReport(),
            'all' => $this->allTimeReport(),
            default => $this->monthReport(),
        });
    }

    // POST /api/admin/sales-report/run-batch
    // Runs the same pipeline the nightly schedule runs, on demand.
    // Synchronous — the COBOL job is fast enough at this data scale
    // that the admin can just wait for the response.
    public function runBatch(Request $request)
    {
        try {
            $exitCode = Artisan::call('sales:run-batch');
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Batch job failed: '.$e->getMessage()], 500);
        }

        if ($exitCode !== 0) {
            return response()->json([
                'message' => 'Batch job failed. Check server logs for details.',
                'output' => Artisan::output(),
            ], 500);
        }

        // Return fresh data in the same shape index() would, honoring
        // whatever period the admin currently has selected.
        return $this->index($request);
    }

    private function dayReport(): array
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
        $growth = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : null;

        return [
            'period' => 'day',
            'current_period_revenue' => $currentRevenue,
            'growth_percent' => $growth,
            'revenue_series' => $series,
            'top_products' => $this->topProducts(),
            'generated_at' => DB::table('daily_sales_reports')->max('generated_at'),
        ];
    }

    private function monthReport(): array
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
        $growth = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : null;

        return [
            'period' => 'month',
            'current_period_revenue' => $currentRevenue,
            'growth_percent' => $growth,
            'revenue_series' => $series,
            'top_products' => $this->topProducts(),
            'generated_at' => DB::table('monthly_sales_reports')->max('generated_at'),
        ];
    }

   private function allTimeReport(): array
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
    $growth = $previousRevenue > 0
        ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
        : null;

    return [
        'period' => 'all',
        'current_period_revenue' => $total,
        'growth_percent' => $growth,
        'revenue_series' => $yearly->values(),
        'top_products' => $this->topProducts(),
        'generated_at' => DB::table('monthly_sales_reports')->max('generated_at'),
    ];
}

    private function topProducts()
    {
        return DB::table('product_sales_reports')
            ->orderBy('rank')
            ->limit(10)
            ->get(['product_name', 'quantity_sold', 'revenue', 'rank']);
    }
}