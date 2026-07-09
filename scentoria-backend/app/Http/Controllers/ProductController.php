<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function show($id)
{
    // Relationship များနှင့်အတူ ရှာဖွေခြင်း
    $product = Product::with(['brand', 'scent', 'variants'])->find($id);

    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // JSON အနေနဲ့ ပြန်ပို့ပါ
    return response()->json($product);
}
    public function index()
    {
        // Eager loads everything requested including the structural notes
        return response()->json(Product::with(['brand', 'scent', 'variants', 'notes'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug',
            'brand_id' => 'required|exists:brands,id',
            'scent_id' => 'required|exists:scents,id',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'gender' => 'required|string',
            'season' => 'required|string',
            'image_url' => 'nullable|url',
            'variants' => 'required|array',
            'variants.*.size' => 'required|string',
            'variants.*.original_price' => 'required|numeric',
            'variants.*.sale_price' => 'required|numeric',
            'variants.*.stock_quantity' => 'required|integer',
            'variants.*.sku' => 'nullable|string',
            // Note validation rules
            'top_notes' => 'nullable|array',
            'top_notes.*' => 'exists:notes,id',
            'heart_notes' => 'nullable|array',
            'heart_notes.*' => 'exists:notes,id',
            'base_notes' => 'nullable|array',
            'base_notes.*' => 'exists:notes,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $product = Product::create($validated);

            // Save Variants
            foreach ($validated['variants'] as $variantData) {
                if (filled($variantData['original_price'] ?? null)) {
                    $product->variants()->create($variantData);
                }
            }

            // Sync Notes with types
            $syncData = [];
            foreach ($validated['top_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'top'];
            }
            foreach ($validated['heart_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'heart'];
            }
            foreach ($validated['base_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'base'];
            }
            $product->notes()->sync($syncData);

            return response()->json($product->load(['brand', 'scent', 'variants', 'notes']), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug,' . $product->id,
            'brand_id' => 'required|exists:brands,id',
            'scent_id' => 'required|exists:scents,id',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'gender' => 'required|string',
            'season' => 'required|string',
            'image_url' => 'nullable|url',
            'variants' => 'required|array',
            'variants.*.size' => 'required|string',
            'variants.*.original_price' => 'required|numeric',
            'variants.*.sale_price' => 'required|numeric',
            'variants.*.stock_quantity' => 'required|integer',
            'variants.*.sku' => 'nullable|string',
            // Note validation rules
            'top_notes' => 'nullable|array',
            'top_notes.*' => 'exists:notes,id',
            'heart_notes' => 'nullable|array',
            'heart_notes.*' => 'exists:notes,id',
            'base_notes' => 'nullable|array',
            'base_notes.*' => 'exists:notes,id',
        ]);

        return DB::transaction(function () use ($validated, $product) {
            $product->update($validated);

            // Refresh variants
            $product->variants()->delete();
            foreach ($validated['variants'] as $variantData) {
                if (filled($variantData['original_price'] ?? null)) {
                    $product->variants()->create($variantData);
                }
            }

            // Sync Notes with types
            $syncData = [];
            foreach ($validated['top_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'top'];
            }
            foreach ($validated['heart_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'heart'];
            }
            foreach ($validated['base_notes'] ?? [] as $noteId) {
                $syncData[$noteId] = ['type' => 'base'];
            }
            $product->notes()->sync($syncData);

            return response()->json($product->load(['brand', 'scent', 'variants', 'notes']));
        });
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        return DB::transaction(function () use ($product) {
            $product->variants()->delete();
            $product->notes()->detach(); // Clean pivot records
            $product->delete();
            return response()->json(['message' => 'Product deleted successfully']);
        });
    }
}