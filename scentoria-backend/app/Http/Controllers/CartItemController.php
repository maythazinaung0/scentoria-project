<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant; // Don't forget to import this model at the top!
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartItemController extends Controller
{
    // ... your index method ...

    public function store(Request $request)
    {
        // 1. First, validate incoming request parameters
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // 2. PASTE YOUR CODE HERE (Before running updateOrCreate)
        $variant = ProductVariant::findOrFail($request->product_variant_id);

        // 👈 Validating against the updated stock_quantity column
        if ($request->quantity > $variant->stock_quantity) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'quantity' => ["Only {$variant->stock_quantity} items available in stock."]
                ]
            ], 422);
        }
        // 3. If validation passes, create or update the item
        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'product_variant_id' => $request->product_variant_id,
            ],
            [
                'quantity' => $request->quantity,
            ]
        );

        return response()->json([
            'message' => 'Cart updated successfully',
            'data' => $cartItem->load('productVariant.product')
        ]);
    }
}