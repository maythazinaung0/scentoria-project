<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SalesReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class SalesReportController extends Controller
{
    public function __construct(private SalesReportService $reports)
    {
    }

    // GET /api/admin/sales-report?period=day|month|all
    // Reads only — all the aggregation already happened in the batch job
    // (nightly, or on demand via runBatch() below).
    public function index(Request $request)
    {
        $period = $request->query('period', 'month');

        $report = match ($period) {
            'day' => $this->reports->dayReport(),
            'all' => $this->reports->allTimeReport(),
            default => $this->reports->monthReport(),
        };

        return response()->json([
            ...$report,
            'top_products' => $this->reports->topProducts(),
        ]);
    }

    // POST /api/admin/sales-report/run-batch
    // Runs the same pipeline the nightly schedule runs, on demand.
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
}