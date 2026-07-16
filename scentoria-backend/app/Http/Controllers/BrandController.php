<?php
 
namespace App\Http\Controllers;
 
use App\Http\Requests\BrandRequest;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
 
class BrandController extends Controller
{
    // GET /api/admin/brands — full admin listing (used for the admin panel)
    public function index()
    {
        return response()->json(Brand::orderBy('name')->get());
    }
 
    public function search()
    {
        try {
            $brands = Brand::select('id', 'name')
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($brand) {
                    $brand->image_url = null;
                    return $brand;
                });
 
            return response()->json($brands, 200);
        } catch (\Exception $e) {
            Log::error("BrandController search error: " . $e->getMessage());
            return response()->json(['message' => 'Error retrieving brands'], 500);
        }
    }
 
    public function store(BrandRequest $request): JsonResponse
    {
        $brand = Brand::create($request->validated());
 
        // api.js's response interceptor auto-toasts a success message for
        // POST/PUT/PATCH/DELETE whenever response.data.message is present —
        // without this key the save silently succeeds with no confirmation.
        return response()->json(
            array_merge(['message' => 'Brand created successfully.'], $brand->toArray()),
            201
        );
    }
 
    public function update(BrandRequest $request, $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);
        $brand->update($request->validated());
 
        return response()->json(
            array_merge(['message' => 'Brand updated successfully.'], $brand->toArray())
        );
    }
 
    public function destroy($id): JsonResponse
    {
        $brand = Brand::findOrFail($id);
 
        // Rule 1: a product that has ever been ordered can never be
        // hard-deleted (order_items.product_variant_id is RESTRICT-on-delete
        // — see ProductController::destroy()), so a brand behind such a
        // product can never be fully removed either. This is a permanent
        // block, not a "clean up first" one.
        $orderedProductCount = $brand->products()
            ->whereHas('variants.orderItems')
            ->count();
 
        if ($orderedProductCount > 0) {
            return response()->json([
                'message' => "This brand can't be deleted: {$orderedProductCount} "
                    . ($orderedProductCount === 1 ? 'of its products has' : 'of its products have')
                    . ' order history that must be preserved. Deactivate the product(s) instead if they should no longer be sold.',
            ], 422);
        }
 

        $productCount = $brand->products()->count();
 
        if ($productCount > 0) {
            return response()->json([
                'message' => "This brand still has {$productCount} "
                    . ($productCount === 1 ? 'product' : 'products')
                    . ' assigned to it. Reassign or delete those products first.',
            ], 422);
        }
 

        $brand->delete();
 
        return response()->json(['message' => 'Brand deleted successfully.']);
    }
}
 