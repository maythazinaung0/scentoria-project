<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;

use App\Models\Brand;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // GET /api/products — storefront listing.
    public function index()
    {
        try {
            $products = Product::with(['brand', 'scent', 'variants', 'notes'])
                ->where('status', 'active')
                ->latest()
                ->get();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/products/{slug} — storefront product detail page.
    public function show($slug)
    {
        $product = Product::with(['brand', 'scent', 'variants', 'notes'])
            ->where('status', 'active')
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    // GET /api/admin/products — admin listing.
    public function adminIndex()
    {
        try {
            $products = Product::with(['brand', 'scent', 'variants', 'notes'])
                ->latest()
                ->get();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/admin/products/{id} — admin still looks up by id.
    public function adminShow($id)
    {
        $product = Product::with(['brand', 'scent', 'variants', 'notes'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        $brand = Brand::findOrFail($validated['brand_id']);

        return DB::transaction(function () use ($validated, $brand) {
            $validated['slug'] = $this->generateUniqueSlug($brand->name, $validated['name']);
            $product = Product::create($validated);

            foreach ($validated['variants'] as $variantData) {
                if (filled($variantData['original_price'] ?? null)) {
                    $variantData['sku'] = $this->generateSku($product->slug, $variantData['size']);
                    $product->variants()->create($variantData);
                }
            }

            $this->syncProductNotes($product, $validated);
            $product->refreshStockStatus();

            return response()->json($product->load(['brand', 'scent', 'variants', 'notes']), 201);
        });
    }

    public function update(ProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validated();
        $brand = Brand::findOrFail($validated['brand_id']);

        return DB::transaction(function () use ($validated, $product, $brand) {
            $validated['slug'] = $this->generateUniqueSlug($brand->name, $validated['name'], $product->id);
            $product->update($validated);

            $keepIds = [];
            foreach ($validated['variants'] as $variantData) {
                if (!filled($variantData['original_price'] ?? null)) continue;
                $variantId = $variantData['id'] ?? null;
                unset($variantData['id']);
                $variant = $variantId ? $product->variants()->find($variantId) : $product->variants()->where('size', $variantData['size'])->first();
                $variantData['sku'] = $this->generateSku($product->slug, $variantData['size']);

                if ($variant) {
                    $variant->update($variantData);
                } else {
                    $variant = $product->variants()->create($variantData);
                }
                $keepIds[] = $variant->id;
            }

            $product->variants()->whereNotIn('id', $keepIds)->get()->each(function ($variant) {
                if (!$variant->orderItems()->exists()) $variant->delete();
            });

            $this->syncProductNotes($product, $validated);
            $product->refreshStockStatus();
            return response()->json($product->load(['brand', 'scent', 'variants', 'notes']));
        });
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        return DB::transaction(function () use ($product) {
            $product->variants()->doesntHave('orderItems')->delete();
            if ($product->variants()->has('orderItems')->exists()) {
                return response()->json(['message' => 'This product has variants tied to existing orders and cannot be deleted.'], 422);
            }
            $product->notes()->detach();
            $product->delete();
            return response()->json(['message' => 'Product deleted successfully']);
        });
    }

    

    private function generateUniqueSlug(string $brandName, string $productName, ?int $ignoreId = null): string
    {
        $base = Str::slug($brandName . ' ' . $productName);
        $slug = $base;
        $suffix = 2;
        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }
        return $slug;
    }

    private function generateSku(string $productSlug, string $size): string
    {
        return $productSlug . '-' . Str::slug($size);
    }

    private function syncProductNotes(Product $product, array $validated): void
    {
        $product->notes()->detach();
        $rows = [];
        $now = now();
        foreach (['top_notes' => 'top', 'heart_notes' => 'heart', 'base_notes' => 'base'] as $field => $type) {
            foreach ($validated[$field] ?? [] as $noteId) {
                $rows[] = ['product_id' => $product->id, 'note_id' => $noteId, 'type' => $type, 'created_at' => $now, 'updated_at' => $now];
            }
        }
        if (!empty($rows)) DB::table('product_notes')->insert($rows);
    }
}