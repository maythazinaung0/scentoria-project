<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function show($id)
    {
        // 'product_notes' ကို ဖျက်လိုက်ပြီး သေချာတဲ့ relationship တွေကိုပဲ သုံးပါ
        // 'notes.note' က notes table ထဲက နာမည်ကိုပါ ယူပေးမှာပါ
        $product = Product::with(['brand', 'scent', 'variants', 'notes.note'])->find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function index()
    {
        try {
            // Index မှာလည်း ဒီအတိုင်းပဲ ပြင်ပေးပါ
            $products = Product::with(['brand', 'scent', 'variants', 'notes.note',])->get();
            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}