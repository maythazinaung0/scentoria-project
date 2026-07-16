<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;

class RunSalesBatchCommand extends Command
{
    protected $signature = 'sales:run-batch';
    protected $description = 'Export order data, run the COBOL sales batch job, and ingest the results into the report tables';

    public function handle(): int
    {
        $this->call('sales:export');

        $binary = base_path(env('COBOL_BATCH_BIN', 'cobol/bin/sales_batch'));
        $inputDir = storage_path('app/cobol/input');
        $outputDir = storage_path('app/cobol/output');

        if (! is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        if (! is_file($binary)) {
            $this->error("COBOL batch binary not found at {$binary}. Compile it first — see cobol/README.md.");

            return self::FAILURE;
        }

        $process = new Process([$binary], null, [
            'SALES_INPUT_DIR' => $inputDir,
            'SALES_OUTPUT_DIR' => $outputDir,
        ]);
        $process->run();

        if (! $process->isSuccessful()) {
            $this->error('COBOL batch job failed: '.$process->getErrorOutput());

            return self::FAILURE;
        }

        $this->info('COBOL batch job completed. Ingesting results...');

        $generatedAt = Carbon::now();

       $this->ingestDailyRevenue("{$outputDir}/daily_revenue.dat", $generatedAt);
$this->ingestMonthlyRevenue("{$outputDir}/monthly_revenue.dat", $generatedAt);
$this->ingestProductSales("{$outputDir}/product_sales.dat", $generatedAt);

        $this->info('Sales report tables updated.');

        return self::SUCCESS;
    }

    // Offsets here match the OUT-* PIC clauses in cobol/SALESBATCH.cob:
    // day line = 8 (date) + 12 (revenue) = 20 chars.
    private function ingestDailyRevenue(string $path, Carbon $generatedAt): void
    {
        if (! is_file($path)) {
            $this->warn("Missing output file: {$path}");

            return;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $date = trim(substr($line, 0, 8));
            $revenue = (int) trim(substr($line, 8, 12));

            DB::table('daily_sales_reports')->updateOrInsert(
                ['date' => $date],
                [
                    'total_revenue' => $revenue,
                    'generated_at' => $generatedAt,
                    'updated_at' => $generatedAt,
                    'created_at' => $generatedAt,
                ]
            );
        }
    }

    // Offsets here match the OUT-* PIC clauses in cobol/SALESBATCH.cob:
    // month line = 6 (year_month) + 12 (revenue) = 18 chars.
    private function ingestMonthlyRevenue(string $path, Carbon $generatedAt): void
    {
        if (! is_file($path)) {
            $this->warn("Missing output file: {$path}");

            return;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $yearMonth = trim(substr($line, 0, 6));
            $revenue = (int) trim(substr($line, 6, 12));

            DB::table('monthly_sales_reports')->updateOrInsert(
                ['year_month' => $yearMonth],
                [
                    'total_revenue' => $revenue,
                    'generated_at' => $generatedAt,
                    'updated_at' => $generatedAt,
                    'created_at' => $generatedAt,
                ]
            );
        }
    }

    // product line = 30 (name) + 7 (qty) + 12 (revenue) = 49 chars.
    // Already sorted by quantity descending by the COBOL job, so the
    // read order here is the rank order.
    private function ingestProductSales(string $path, Carbon $generatedAt): void
    {
        if (! is_file($path)) {
            $this->warn("Missing output file: {$path}");

            return;
        }

        DB::table('product_sales_reports')->truncate();

        $rank = 1;
        $rows = [];

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $name = trim(substr($line, 0, 30));
            $quantity = (int) trim(substr($line, 30, 7));
            $revenue = (int) trim(substr($line, 37, 12));

            $rows[] = [
                'product_name' => $name,
                'quantity_sold' => $quantity,
                'revenue' => $revenue,
                'rank' => $rank++,
                'generated_at' => $generatedAt,
                'created_at' => $generatedAt,
                'updated_at' => $generatedAt,
            ];
        }

        if (! empty($rows)) {
            DB::table('product_sales_reports')->insert($rows);
        }
    }
}