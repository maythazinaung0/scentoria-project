<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\WalletTransaction;

class AdminOrderController extends Controller
{
    public function handleStatusUpdate(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:accept,cancel' 
        ]);

        // Get Order and Items of Product Variants 
        $order = Order::with('items.variant')->findOrFail($id);

        // Order isn't pending, no correction allowed 
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'This order has already been processed.'], 400);
        }

        return DB::transaction(function () use ($request, $order) {
            
            // ACCEPT ACTION -> COMPLETED
            if ($request->action === 'accept') {
                 
                // Check each product Stock and decrement
                foreach ($order->items as $item) {
                    $variant = $item->variant;

                    if (!$variant || $variant->stock < $item->quantity) {
                        return response()->json([
                            'message' => "Insufficient stock for variant: " . ($variant ? $variant->size : 'Unknown')
                        ], 400);
                    }
                        $variant->decrement('stock', $item->quantity);
                }

                // Status change 'completed' 
                $order->update(['status' => 'completed']);

                return response()->json([
                    'message' => 'Order accepted successfully and marked as completed.',
                    'order'   => $order
                ]);
            }

            // CANCEL ACTION -> CANCELLED
            if ($request->action === 'cancel') {
      
                // Wallet (virtual_currency) and refund
                if ($order->payment_method === 'virtual_currency') {
                    $user = $order->user;
                    $user->increment('wallet_balance', $order->total_amount);

                    // Refund record
                    WalletTransaction::create([
                        'user_id'                   => $user->id,
                        'type'                      => 'refund',
                        'order_id'                  => $order->id,
                        'direction'                 => 'credit', 
                        'amount'                    => $order->total_amount,
                        'balance_after_transaction' => $user->refresh()->wallet_balance,
                    ]);
                }

                // Status change 'cancelled' 
                $order->update(['status' => 'cancelled']);

                return response()->json([
                    'message' => 'Order has been cancelled and refunded (if applicable).',
                    'order'   => $order
                ]);
            }
        });
    }
}