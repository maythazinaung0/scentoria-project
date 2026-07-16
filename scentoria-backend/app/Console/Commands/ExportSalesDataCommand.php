<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ExportSalesDataCommand extends Command
{
    protected $signature = 'sales:export';
    protected $description = 'Export completed order line items to a fixed-width file for the COBOL sales batch job';

    // Field widths — must stay in sync with the record layout
    // (01 INPUT-RECORD) in cobol/SALESBATCH.cob.
    private const DATE_LEN = 8;
    private const PRODUCT_LEN = 30;
    private const QTY_LEN = 5;
    private const TOTAL_LEN = 10;

    public function handle(): int
    {
        $path = storage_path('app/cobol/input/sales_input.dat');

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        // Adjust the join if your product_variants/products columns differ —
        // this assumes order_items -> product_variants -> products, with
        // a `name` column on products.
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('product_variants', 'product_variants.id', '=', 'order_items.product_variant_id')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->where('orders.status', 'completed')
            ->orderBy('orders.created_at')
            ->select([
                'orders.created_at',
                'products.name as product_name',
                'order_items.quantity',
                'order_items.price',
            ])
            ->get();

        $handle = fopen($path, 'w');

        foreach ($rows as $row) {
            $date = Carbon::parse($row->created_at)->format('Ymd');
            $lineTotal = $row->quantity * $row->price;

            $record =
                str_pad($date, self::DATE_LEN, ' ', STR_PAD_RIGHT) .
                str_pad(substr($row->product_name, 0, self::PRODUCT_LEN), self::PRODUCT_LEN, ' ', STR_PAD_RIGHT) .
                str_pad((string) $row->quantity, self::QTY_LEN, '0', STR_PAD_LEFT) .
                str_pad((string) $lineTotal, self::TOTAL_LEN, '0', STR_PAD_LEFT);

            fwrite($handle, $record . PHP_EOL);
        }

        fclose($handle);

        $this->info("Exported {$rows->count()} line items to {$path}");

        return self::SUCCESS;
    }
}