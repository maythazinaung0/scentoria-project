<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
   public function index(): JsonResponse
    {
        $orders = Order::with('customer:id,name')
            ->latest()
            ->get(['id', 'user_id', 'total_amount', 'status', 'created_at'])
            ->map(fn ($o) => [
                'id' => $o->id,
                'customer_name' => $o->customer->name,
                'total_amount' => $o->total_amount,
                'status' => $o->status,
                'created_at' => $o->created_at,
            ]);

        return response()->json([
            'orders' => $orders,
            'product_count' => Product::count(),
        ]);
    }
}
