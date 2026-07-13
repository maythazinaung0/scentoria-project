<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    // Reads only — all the aggregation already happened in the
    // nightly COBOL batch job. Nothing here touches orders/order_items.
    public function index()
    {
        $monthly = DB::table('monthly_sales_reports')
            ->orderBy('year_month')
            ->get(['year_month', 'total_revenue']);

        $products = DB::table('product_sales_reports')
            ->orderBy('rank')
            ->limit(10)
            ->get(['product_name', 'quantity_sold', 'revenue', 'rank']);

        $currentMonth = Carbon::now()->format('Ym');
        $previousMonth = Carbon::now()->subMonth()->format('Ym');

        $currentRevenue = optional($monthly->firstWhere('year_month', $currentMonth))->total_revenue ?? 0;
        $previousRevenue = optional($monthly->firstWhere('year_month', $previousMonth))->total_revenue ?? 0;

        $growth = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : null;

        return response()->json([
            'current_month_revenue' => (int) $currentRevenue,
            'growth_percent' => $growth,
            'monthly_revenue' => $monthly,
            'top_products' => $products,
            'generated_at' => DB::table('monthly_sales_reports')->max('generated_at'),
        ]);
    }
}