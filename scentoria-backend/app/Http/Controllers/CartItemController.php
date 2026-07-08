<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;  
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartItemController extends Controller
{
    public function index()
    {
        $cartItems = CartItem::where('user_id', Auth::id())
            ->with('productVariant.product') 
            ->get();

        return response()->json($cartItems);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',[cite: 2]
            'quantity' => 'required|integer|min:1',[cite: 2]
        ]);

        $variant = ProductVariant::findOrFail($request->product_variant_id);

        if ($request->quantity > $variant->stock_quantity) {[cite: 4]
            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'quantity' => ["Only {$variant->stock_quantity} items available in stock."][cite: 4]
                ]
            ], 422);
        }

        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => Auth::id(),[cite: 2]
                'product_variant_id' => $request->product_variant_id,[cite: 2]
            ],
            [
                'quantity' => $request->quantity,[cite: 2]
            ]
        );

        return response()->json([
            'message' => 'Cart updated successfully',
            'data' => $cartItem->load('productVariant.product')[cite: 4]
        ]);
    }

    public function destroy($id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())->findOrFail($id);[cite: 2]
        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }
}