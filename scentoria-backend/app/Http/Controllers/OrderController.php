<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;


class OrderController extends Controller
{
public function show($id): JsonResponse
{
    $order = Order::with('items.variant.product')->find($id);

    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }
    return response()->json($order);
}

public function index(): JsonResponse
    {
        // Safely pull relationships now that imports are fixed
        $orders = Order::with(['user', 'items.variant.product.brand'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            return [
                'id' => (string) $order->id,
                'customer_name' => $order->user ? $order->user->name : 'Unknown Customer',
                'customer_email' => $order->user ? $order->user->email : null,
                'customer_phone' => $order->user ? $order->user->phone_number : null,
                'customer_address' => $order->address,
                'total_amount' => (int) $order->total_amount,
                'status' => $order->status,
                'created_at' => $order->created_at ? Carbon::parse($order->created_at)->toIso8601String() : Carbon::now()->toIso8601String(),
                'order_items' => $order->items ? $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'brand' => $item->variant && $item->variant->product && $item->variant->product->brand ? $item->variant->product->brand->name : 'Generic',
                        'product_name' => $item->variant && $item->variant->product ? $item->variant->product->name : 'Product Item',
                        'size' => $item->variant ? $item->variant->size : 'Standard',
                        'quantity' => (int) $item->quantity,
                        'unit_price' => (int) $item->price
                    ];
                }) : []
            ];
        });

        return response()->json($formattedOrders);
    }

    /**
     * Patch handle for updates to transaction lifecycle states.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status modified successfully.',
            'status' => $order->status
        ]);
    }
}