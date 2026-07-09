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
        ->with('productVariant.product.brand')
        ->get();
        return response()->json($cartItems);
    }

  public function store(Request $request)
{
    $request->validate([
        'product_variant_id' => 'required|exists:product_variants,id',
        'quantity' => 'required|integer|min:1',
    ]);

    $variant = ProductVariant::findOrFail($request->product_variant_id);

    $existingItem = CartItem::where('user_id', Auth::id())
        ->where('product_variant_id', $request->product_variant_id)
        ->first();

    $newQuantity = ($existingItem->quantity ?? 0) + $request->quantity;

    if ($newQuantity > $variant->stock_quantity) {
        return response()->json([
            'message' => 'Cannot add anymore.',
            'errors' => [
                'quantity' => ["Only {$variant->stock_quantity} items available in stock."]
            ]
        ], 422);
    }

    $cartItem = CartItem::updateOrCreate(
        [
            'user_id' => Auth::id(),
            'product_variant_id' => $request->product_variant_id,
        ],
        [
            'quantity' => $newQuantity,
        ]
    );

    return response()->json([
        'message' => 'Cart updated successfully',
        'data' => $cartItem->load('productVariant.product.brand')
    ]);
}

    public function destroy($id)
    {
        $cartItem = CartItem::where('user_id', Auth::id())->findOrFail($id);
        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    public function update(Request $request, $id)
{
    $request->validate([
        'quantity' => 'required|integer|min:1',
    ]);

    $cartItem = CartItem::where('user_id', Auth::id())->findOrFail($id);
    $variant = $cartItem->productVariant;

    if ($request->quantity > $variant->stock_quantity) {
        return response()->json([
            'message' => 'Cannot add anymore.',
            'errors' => [
                'quantity' => ["Only {$variant->stock_quantity} items available in stock."]
            ]
        ], 422);
    }

    $cartItem->update(['quantity' => $request->quantity]);

    return response()->json([
        'message' => 'Cart updated successfully',
        'data' => $cartItem->load('productVariant.product.brand')
    ]);
}
}