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
            $products = Product::with(['brand', 'scent', 'variants', 'notes.note'])->get();
            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // --- Added Navigation Methods ---

    public function byBrand($id) 
    {
        return Product::where('brand_id', $id)->with(['brand', 'scent'])->get();
    }

    public function byScent($id) 
    {
        return Product::where('scent_id', $id)->with(['brand', 'scent'])->get();
    }

   // Ensure this is in your ProductController
public function byNote($id) 
{
    $products = Product::whereHas('notes.note', function($q) use ($id) {
        $q->where('notes.id', $id); // Make sure this matches your DB structure
    })->with(['brand', 'scent'])->get();

    return response()->json($products);
}

    public function byGender($type) 
    {
        return Product::where('gender', $type)->with(['brand', 'scent'])->get();
    }

    public function bySeason($type) 
    {
        return Product::where('season', $type)->with(['brand', 'scent'])->get();
    }

    // --- Utility Methods for Lists ---

    public function getGenders() 
    {
        return response()->json([
            ['id' => 'male', 'name' => 'Male'], 
            ['id' => 'female', 'name' => 'Female'], 
            ['id' => 'unisex', 'name' => 'Unisex']
        ]);
    }

    public function getSeasons() 
    {
        return response()->json([
            ['id' => 'summer', 'name' => 'Summer'], 
            ['id' => 'winter', 'name' => 'Winter'], 
            ['id' => 'spring', 'name' => 'Spring'], 
            ['id' => 'fall', 'name' => 'Fall']
        ]);
    }
}