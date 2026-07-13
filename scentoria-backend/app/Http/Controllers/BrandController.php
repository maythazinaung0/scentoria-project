<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BrandController extends Controller
{
    // GET /api/admin/brands — full admin listing (used for the admin panel,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:brands,name|max:255',
        ]);

        $brand = Brand::create($validated);
        return response()->json($brand, 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:brands,name,' . $brand->id . '|max:255',
        ]);

        $brand->update($validated);
        return response()->json($brand);
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->delete();
        return response()->json(['message' => 'Brand deleted successfully']);
    }
}