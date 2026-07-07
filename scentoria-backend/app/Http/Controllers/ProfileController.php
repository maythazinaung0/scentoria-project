<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function show($id)
    {
        $product = Product::with(['brand', 'scent', 'variants'])->find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return response()->json($product);
    }

    public function index(Request $request)
    {
        $query = Product::with(['brand', 'scent', 'variants']);
        if ($request->has('scent_id')) {
            $query->where('scent_id', $request->query('scent_id'));
        }
        return response()->json($query->get());
    }
}