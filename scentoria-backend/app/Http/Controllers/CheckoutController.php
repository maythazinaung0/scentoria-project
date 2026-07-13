<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\WalletTransaction;
use App\Models\ProductVariant;
use App\Models\CartItem; 
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;

class CheckoutController extends Controller
{ 
    public function getProfile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'name'           => $user->name,          
            'phone_number'   => $user->phone_number,  
            'address'        => $user->address,       
            'wallet_balance' => $user->wallet_balance ?? 0, 
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone'          => 'required|string',
            'address'        => 'required|string',
            'payment_method' => 'required|in:cash,virtual_currency',
            'total_amount'   => 'required|integer',
            'items'          => 'required|array',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity'           => 'required|integer|min:1',
            'items.*.price'              => 'required|integer'
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            
        // Wallet Hold and if Admin cancel, refund
            if ($validated['payment_method'] === 'virtual_currency') {
                if ($user->wallet_balance < $validated['total_amount']) {
                    return response()->json(['message' => 'Insufficient wallet balance.'], 400);
                }
                $user->decrement('wallet_balance', $validated['total_amount']);
            }

            // Order 
            $order = Order::create([
        'user_id'        => $user->id,
        'total_amount'   => $validated['total_amount'],
        'status'         => 'pending', 
        'payment_method' => $validated['payment_method'],
]);

            foreach ($validated['items'] as $item) {
                $variant = ProductVariant::find($item['product_variant_id']);

                if ($variant) {
                    OrderItem::create([
                        'order_id'           => $order->id,
                        'product_variant_id' => $item['product_variant_id'],
                        'quantity'           => $item['quantity'],
                        'price'              => $variant->sale_price
                    ]);
                }
            }

            // Wallet Transaction 
            if ($validated['payment_method'] === 'virtual_currency') {
                WalletTransaction::create([
                    'user_id'                   => $user->id,
                    'type'                      => 'purchase',
                    'order_id'                  => $order->id,
                    'direction'                 => 'debit',
                    'amount'                    => $validated['total_amount'],
                    'balance_after_transaction' => $user->refresh()->wallet_balance,
                ]);
            }

           
            $user->phone_number = $validated['phone'];
            $user->address      = $validated['address'];
            $user->save();

           
            CartItem::where('user_id', $user->id)->delete();
           Mail::to($user->email)->send(new OrderConfirmationMail($order->load('customer')));
            return response()->json(['message' => 'Order placed.', 'order_id' => $order->id], 201);
        });
    }
}