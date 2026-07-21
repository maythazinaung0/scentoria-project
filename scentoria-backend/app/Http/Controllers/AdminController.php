<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\SalesReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function __construct(private SalesReportService $reports)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'day');

        $report = match ($period) {
            'all' => $this->reports->allTimeReport(),
            'month' => $this->reports->monthReport(),
            default => $this->reports->dayReport(),
        };

        [$currentStart, $currentEnd, $previousStart, $previousEnd] = $this->dateRangesFor($period);
        $orderStats = $this->periodOrderStats($currentStart, $currentEnd, $previousStart, $previousEnd);

        $statusBreakdown = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentOrders = Order::with('customer:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'user_id', 'total_amount', 'status', 'created_at'])
            ->map(fn ($o) => [
                'id' => $o->id,
                'customer_name' => $o->customer->name ?? 'Unknown Customer',
                'total_amount' => $o->total_amount,
                'status' => $o->status,
                'created_at' => $o->created_at,
            ]);

        $lowStock = ProductVariant::with('product:id,name')
            ->where('stock_quantity', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'product_id', 'size', 'stock_quantity'])
            ->map(fn ($v) => [
                'product_name' => $v->product->name ?? 'Unknown',
                'size' => $v->size,
                'stock_quantity' => $v->stock_quantity,
            ]);

        return response()->json([
            'period' => $period,
            'stats' => [
                'revenue' => $orderStats['revenue'],
                'orders' => $orderStats['orders'],
                'avg_order_value' => $orderStats['avg_order_value'],
                'pending_orders' => (int) ($statusBreakdown['pending'] ?? 0),
                'active_products' => Product::where('status', 'active')->count(),
            ],
            'revenue_series' => $report['revenue_series'],
            'status_breakdown' => $statusBreakdown,
            'top_products' => $this->reports->topProducts(),
            'low_stock' => $lowStock,
            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: Carbon, 3: Carbon} [currentStart, currentEnd, previousStart, previousEnd]
     */
    private function dateRangesFor(string $period): array
    {
        return match ($period) {
            'all' => [
                Carbon::now()->startOfYear(), Carbon::now(),
                Carbon::now()->subYear()->startOfYear(), Carbon::now()->subYear()->endOfYear(),
            ],
            'month' => [
                Carbon::now()->startOfMonth(), Carbon::now(),
                Carbon::now()->subMonthNoOverflow()->startOfMonth(), Carbon::now()->subMonthNoOverflow()->endOfMonth(),
            ],
            default => [ // day
                Carbon::today(), Carbon::now(),
                Carbon::yesterday(), Carbon::yesterday()->endOfDay(),
            ],
        };
    }

    private function periodOrderStats(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        $current = Order::whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw("
                COUNT(*) as order_count,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as revenue,
                COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as avg_order_value
            ")->first();

        $previous = Order::whereBetween('created_at', [$previousStart, $previousEnd])
            ->selectRaw("
                COUNT(*) as order_count,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as revenue,
                COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as avg_order_value
            ")->first();

        return [
            'revenue' => $this->withGrowth((int) $current->revenue, (int) $previous->revenue),
            'orders' => $this->withGrowth((int) $current->order_count, (int) $previous->order_count),
            'avg_order_value' => $this->withGrowth((int) round($current->avg_order_value), (int) round($previous->avg_order_value)),
        ];
    }

    private function withGrowth(int $current, int $previous): array
    {
        return [
            'current' => $current,
            'previous' => $previous,
            'growth_percent' => $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : null,
        ];
    }
}