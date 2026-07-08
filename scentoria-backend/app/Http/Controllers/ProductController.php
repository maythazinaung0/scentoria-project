<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function show($id)
    {
        
        $product = Product::with(['brand', 'scent', 'variants', 'notes.note'])->find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function index()
    {
        try {
            
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