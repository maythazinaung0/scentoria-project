<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderProcessingMail;
use Carbon\Carbon;

class OrderController extends Controller
{
    // GET /api/orders/{id} — customer-facing order confirmation / detail page.
    public function show($id): JsonResponse
    {
        $order = Order::with(['items.variant.product', 'customer'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Flatten address onto the order response, since address now lives
        // on the user record rather than the orders table.
        $orderData = $order->toArray();
        $orderData['address'] = $order->customer->address ?? null;

        return response()->json($orderData);
    }

    // GET /api/admin/orders — admin listing of every order.
    public function index(): JsonResponse
    {
        $orders = Order::with(['customer', 'items.variant.product.brand'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedOrders = $orders->map(function ($order) {
    return [
        'id' => (string) $order->id,
        'customer_name' => $order->customer ? $order->customer->name : 'Unknown Customer',
        'customer_email' => $order->customer ? $order->customer->email : null,
        'customer_phone' => $order->customer ? $order->customer->phone_number : null,
        'customer_address' => $order->customer ? $order->customer->address : null,
        'payment_method' => $order->payment_method,
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
        $previousStatus = $order->status;

        $order->status = $request->status;
        $order->save();

        if ($request->status === 'processing' && $previousStatus !== 'processing' && $order->customer) {
            Mail::to($order->customer->email)->send(new OrderProcessingMail($order));
        }

        return response()->json([
            'success' => true,
            'message' => 'Status modified successfully.',
            'status' => $order->status
        ]);
    }
}